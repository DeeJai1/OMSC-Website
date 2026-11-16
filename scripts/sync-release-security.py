"""Publish only exact-byte scan receipts for the latest public stable release."""
import hashlib
import json
import pathlib
import re
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
REPO = 'DeeJai1/OldMan-Stream-Companion-Public'
OUTPUT = ROOT / 'release-security/latest.json'


def fetch(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={
        'User-Agent': 'OMSC-public-release-security', 'Accept': 'application/vnd.github+json'
    }), timeout=120)


def validate_release(release):
    if release['draft'] or release['prerelease'] or not re.fullmatch(r'v?\d+\.\d+\.\d+', release['tag_name']):
        raise ValueError('Only public stable versions may appear on the website')


def validate_report(report, version, assets):
    if (report.get('schemaVersion') != 1 or report.get('channel') != 'stable'
            or report.get('version') != version or report.get('result') != 'no-threats-detected'
            or not report.get('completedAt') or report.get('error')):
        raise ValueError('Missing successful matching stable scan report')
    scanner = report.get('scanner', {})
    if scanner.get('name') != 'Microsoft Defender Antivirus' or not scanner.get('engineVersion') or not scanner.get('signatureVersion'):
        raise ValueError('Missing scanner identity')
    targets = report.get('targets', [])
    if ({t['kind'] for t in targets} != {'installer', 'update-archive', 'published-payload'}
            or any(t.get('result') != 'no-threats-detected' or t.get('exitCode') != 0 for t in targets)
            or report.get('payloadFileCount', 0) < 1):
        raise ValueError('Incomplete scan coverage')
    expected = {f'OldManStreamCompanion-Setup-{version}.exe', f'OldManStreamCompanion-win-x64-v{version}.zip'}
    if {a['name'] for a in report.get('assets', [])} != expected or len(report['assets']) != 2:
        raise ValueError('Unexpected scanned packages')
    for asset in report['assets']:
        actual = assets[asset['name']]
        if not re.fullmatch('[0-9a-f]{64}', asset['sha256']) or actual['size'] != asset['size']:
            raise ValueError('Invalid package size or hash')


def sync():
    try:
        with fetch(f'https://api.github.com/repos/{REPO}/releases/latest') as response:
            release = json.load(response)
    except urllib.error.HTTPError as error:
        if error.code != 404:
            raise
        OUTPUT.write_text(json.dumps({'status': 'pending'}, indent=2) + '\n')
        return
    validate_release(release)
    version = release['tag_name'].removeprefix('v')
    assets = {a['name']: a for a in release['assets']}
    fingerprint = hashlib.sha256(json.dumps(release, sort_keys=True).encode()).hexdigest()
    if OUTPUT.exists() and json.loads(OUTPUT.read_text()).get('fingerprint') == fingerprint:
        return
    report_asset = assets[f'OldManStreamCompanion-Security-Scan-v{version}.json']
    markdown_asset = assets[f'OldManStreamCompanion-Security-Scan-v{version}.md']
    with fetch(report_asset['browser_download_url']) as response:
        report = json.load(response)
    validate_report(report, version, assets)
    with fetch(markdown_asset['browser_download_url']) as response:
        if hashlib.sha256(response.read()).hexdigest() != report['markdownSha256']:
            raise ValueError('Human-readable scan report hash mismatch')
    packages = []
    for package in report['assets']:
        actual = assets[package['name']]
        digest, size = hashlib.sha256(), 0
        with fetch(actual['browser_download_url']) as response:
            while chunk := response.read(1024 * 1024):
                digest.update(chunk)
                size += len(chunk)
        if digest.hexdigest() != package['sha256'] or size != package['size']:
            raise ValueError('Published bytes differ from scanned package')
        checksum_asset = assets[package['name'] + '.sha256']
        with fetch(checksum_asset['browser_download_url']) as response:
            if response.read().decode('utf-8-sig').split()[0].lower() != package['sha256']:
                raise ValueError('Checksum file mismatch')
        packages.append({**package, 'url': actual['browser_download_url'],
                         'checksumUrl': checksum_asset['browser_download_url']})
    data = {'status': 'available', 'version': version, 'releaseUrl': release['html_url'],
            'publishedAt': release['published_at'], 'completedAt': report['completedAt'],
            'scanner': report['scanner'], 'result': report['result'], 'packages': packages,
            'reportUrl': report_asset['browser_download_url'],
            'readableReportUrl': markdown_asset['browser_download_url'], 'fingerprint': fingerprint}
    OUTPUT.write_text(json.dumps(data, indent=2) + '\n')


if __name__ == '__main__':
    sync()
