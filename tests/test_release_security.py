import copy
import importlib.util
import pathlib
import unittest
import io
import json
import tempfile
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('security', pathlib.Path(__file__).resolve().parents[1] / 'scripts/sync-release-security.py')
security = importlib.util.module_from_spec(spec)
spec.loader.exec_module(security)


class PublicReleaseSecurityTests(unittest.TestCase):
    def setUp(self):
        self.report = {
            'schemaVersion': 1, 'channel': 'stable', 'version': '1.0.0',
            'result': 'no-threats-detected', 'completedAt': '2026-11-28T00:00:00Z',
            'scanner': {'name': 'Microsoft Defender Antivirus', 'engineVersion': '1', 'signatureVersion': '2'},
            'payloadFileCount': 5,
            'targets': [{'kind': kind, 'result': 'no-threats-detected', 'exitCode': 0}
                        for kind in ['installer', 'update-archive', 'published-payload']],
            'assets': [{'name': name, 'size': 12, 'sha256': 'a' * 64} for name in [
                'OldManStreamCompanion-Setup-1.0.0.exe', 'OldManStreamCompanion-win-x64-v1.0.0.zip']]
        }
        self.assets = {a['name']: {'size': 12} for a in self.report['assets']}

    def test_beta_and_draft_cannot_be_displayed(self):
        for release in [dict(draft=False, prerelease=True, tag_name='v1.0.0-rc.7.4'),
                        dict(draft=True, prerelease=False, tag_name='v1.0.0'),
                        dict(draft=False, prerelease=False, tag_name='v1.0.0-beta')]:
            with self.assertRaises(ValueError):
                security.validate_release(release)

    def test_matching_stable_report(self):
        security.validate_report(self.report, '1.0.0', self.assets)

    def test_wrong_version_beta_failed_or_incomplete_scan_rejected(self):
        for field, value in [('version', '0.9.0'), ('channel', 'beta'),
                             ('result', 'threat-detected'), ('targets', []), ('payloadFileCount', 0)]:
            report = copy.deepcopy(self.report)
            report[field] = value
            with self.assertRaises(ValueError):
                security.validate_report(report, '1.0.0', self.assets)

    def test_changed_package_size_rejected(self):
        self.assets[self.report['assets'][0]['name']]['size'] += 1
        with self.assertRaises(ValueError):
            security.validate_report(self.report, '1.0.0', self.assets)

    def test_same_size_tampering_never_publishes_metadata(self):
        version = '1.0.0'
        report_name = f'OldManStreamCompanion-Security-Scan-v{version}.json'
        md_name = f'OldManStreamCompanion-Security-Scan-v{version}.md'
        self.report['markdownSha256'] = security.hashlib.sha256(b'report').hexdigest()
        names = [a['name'] for a in self.report['assets']] + [report_name, md_name]
        release = {'draft': False, 'prerelease': False, 'tag_name': 'v1.0.0',
                   'assets': [{'name': name, 'size': 12, 'browser_download_url': name} for name in names]}

        def fake_fetch(url):
            if url.endswith('/releases/latest'):
                return io.BytesIO(json.dumps(release).encode())
            if url == report_name:
                return io.BytesIO(json.dumps(self.report).encode())
            if url == md_name:
                return io.BytesIO(b'report')
            return io.BytesIO(b'changedbytes')

        with tempfile.TemporaryDirectory() as folder:
            output = pathlib.Path(folder) / 'latest.json'
            output.write_text('{"status":"pending"}')
            with patch.object(security, 'OUTPUT', output), patch.object(security, 'fetch', fake_fetch):
                with self.assertRaisesRegex(ValueError, 'Published bytes differ'):
                    security.sync()
            self.assertEqual(json.loads(output.read_text()), {'status': 'pending'})


if __name__ == '__main__':
    unittest.main()
