/* Same-origin metadata is generated from the public stable release, never beta. */
(async function () {
  const panel = document.getElementById('release-security-details');
  if (!panel) return;
  try {
    const mirror = await window.OMSCReleaseDownloads.readMirror();
    let data;
    if (mirror) {
      data = {status:'available',version:mirror.version,result:mirror.scan.result,completedAt:mirror.scan.completedAt,
        scanner:mirror.scan.scanner,readableReportUrl:mirror.scan.readableReportUrl,reportUrl:mirror.scan.reportUrl,
        releaseUrl:mirror.releaseUrl,packages:[{...mirror.installer,checksumUrl:mirror.installer.mirrorChecksumUrl}]};
    } else {
      const response = await fetch('/release-security/latest.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Release information unavailable');
      data = await response.json();
    }
    if (data.status !== 'available') return;
    if (!/^\d+\.\d+\.\d+$/.test(data.version) || data.result !== 'no-threats-detected') throw new Error('Invalid release');
    const link = (label, url) => {
      const parsed = new URL(url);
      const github = parsed.origin === 'https://github.com' && parsed.pathname.startsWith('/DeeJai1/OldMan-Stream-Companion-Public/releases/');
      const backup = parsed.origin === window.OMSCReleaseDownloads.origin && parsed.pathname.startsWith('/releases/'+data.version+'/');
      if ((!github && !backup) || parsed.search || parsed.hash) throw new Error('Invalid release link');
      const a = document.createElement('a');
      a.textContent = label; a.href = parsed.href;
      return a;
    };
    const content = document.createElement('div');
    const summary = document.createElement('p');
    summary.textContent = `Version ${data.version} · ${data.scanner.name}: no threats detected. Scan completed ${new Date(data.completedAt).toLocaleString()}. Engine ${data.scanner.engineVersion}; definitions ${data.scanner.signatureVersion}.`;
    content.append(summary);
    const reports = document.createElement('p');
    reports.append(link('Read scan report', data.readableReportUrl), ' · ', link('Download JSON report', data.reportUrl), ' · ', link('Public release', data.releaseUrl));
    content.append(reports);
    for (const asset of data.packages) {
      if (!/^[0-9a-f]{64}$/.test(asset.sha256)) throw new Error('Invalid checksum');
      const block = document.createElement('div');
      block.className = 'release-checksum';
      const name = document.createElement('p'); name.textContent = asset.name;
      const hash = document.createElement('code'); hash.textContent = asset.sha256;
      const download = document.createElement('p');
      download.append(link('Download SHA-256 file', asset.checksumUrl));
      block.append(name, hash, download); content.append(block);
    }
    panel.replaceChildren(content);
  } catch (_) {
    panel.textContent = 'Public release verification information is temporarily unavailable. Check the scan reports and checksum files on the official public GitHub Releases page.';
  }
}());
