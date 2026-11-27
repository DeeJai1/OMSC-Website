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
    const open = document.createElement('button');
    open.type = 'button'; open.className = 'scan-report-open'; open.textContent = 'Read scan result';
    const dialog = document.createElement('dialog');
    dialog.className = 'scan-report-dialog'; dialog.setAttribute('aria-labelledby', 'scan-report-title');
    const heading = document.createElement('h2'); heading.tabIndex = -1; heading.setAttribute('autofocus', ''); heading.id = 'scan-report-title'; heading.textContent = `Version ${data.version} scan result`;
    const close = document.createElement('button'); close.type = 'button'; close.className = 'btn btn-outline'; close.textContent = 'Close scan result';
    close.addEventListener('click', () => dialog.close());
    dialog.append(heading, summary.cloneNode(true));
    const details = document.createElement('dl');
    const field = (label, value) => {
      const term = document.createElement('dt'), definition = document.createElement('dd');
      term.textContent = label; definition.textContent = value; details.append(term, definition);
    };
    field('Scan result', 'No threats detected');
    if (data.scanner.signatureUpdatedAt) field('Definitions updated', new Date(data.scanner.signatureUpdatedAt).toLocaleString());
    if (data.scanner.scanType) field('Scan type', data.scanner.scanType);
    for (const [key, label] of [['archivesScanned', 'Archives scanned'], ['exclusionsIgnored', 'Exclusions ignored'], ['remediationEnabled', 'Automatic remediation']]) {
      if (typeof data.scanner[key] === 'boolean') field(label, data.scanner[key] ? 'Yes' : 'No');
    }
    dialog.append(details);
    const note = document.createElement('p');
    note.textContent = 'This is a dated scan of the release files, not a guarantee of future safety. OMSC is not publisher-signed; Windows SmartScreen warnings are separate from antivirus scan results.';
    dialog.append(note);
    const files = document.createElement('div'); dialog.append(files);
    const originals = document.createElement('p');
    originals.append(link('Download original scan report', data.readableReportUrl), ' · ', link('Download JSON report', data.reportUrl));
    dialog.append(originals, close);
    open.addEventListener('click', () => { dialog.showModal(); dialog.scrollTop = 0; });
    dialog.addEventListener('close', () => open.focus());
    dialog.addEventListener('click', event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
    });
    reports.append(open, ' · ', link('Download JSON report', data.reportUrl), ' · ', link('Public release', data.releaseUrl));
    content.append(reports);
    for (const asset of data.packages) {
      if (!/^[0-9a-f]{64}$/.test(asset.sha256)) throw new Error('Invalid checksum');
      const block = document.createElement('div');
      block.className = 'release-checksum';
      const name = document.createElement('p'); name.textContent = asset.name;
      const hash = document.createElement('code'); hash.textContent = asset.sha256;
      const download = document.createElement('p');
      download.append(link('Download SHA-256 file', asset.checksumUrl));
      block.append(name, hash, download); content.append(block); files.append(block.cloneNode(true));
    }
    panel.replaceChildren(content);
    document.body.append(dialog);
  } catch (_) {
    panel.textContent = 'Public release verification information is temporarily unavailable. Check the scan reports and checksum files on the official public GitHub Releases page.';
  }
}());
