"use strict";
(() => {
  const banner = document.getElementById("public-launch-banner");
  if (!banner) return;
  const launchAt = Date.parse(document.querySelector("[data-launch-local]")?.getAttribute("datetime"));
  if (!Number.isFinite(launchAt)) return;
  const repository = "https://github.com/DeeJai1/OldMan-Stream-Companion-Public";
  const endpoint = "https://api.github.com/repos/DeeJai1/OldMan-Stream-Companion-Public/releases/latest";
  let checking = false, released = false, nextCheck = 0;

  function publicRelease(data) {
    if (!data || data.draft !== false || data.prerelease !== false || !data.published_at || !Number.isFinite(Date.parse(data.published_at))) return null;
    const match = /^v?([1-9]\d*|0)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(data.tag_name);
    if (!match || Number(match[1]) < 1) return null;
    const version = match.slice(1).join(".");
    if (data.html_url !== repository + "/releases/tag/" + data.tag_name) return null;
    const name = "OldManStreamCompanion-Setup-" + version + ".exe";
    const installer = data.assets?.find(asset => asset.name === name && asset.state === "uploaded" && Number.isSafeInteger(asset.size) && asset.size > 0 &&
      asset.browser_download_url === repository + "/releases/download/" + data.tag_name + "/" + name);
    return installer ? { version, url: installer.browser_download_url } : null;
  }

  function celebrate(release) {
    if (released || Date.now() < launchAt) return;
    released = true;
    document.documentElement.dataset.publicReleased = "true";
    for (const link of document.querySelectorAll("[data-public-installer]")) link.href = release.url;
    for (const node of document.querySelectorAll("[data-public-version]")) node.textContent = "VERSION " + release.version;
    for (const node of document.querySelectorAll("[data-launch-pending], .launch-local-release")) node.hidden = true;
    for (const node of document.querySelectorAll("[data-launch-live]")) node.hidden = false;
    for (const node of document.querySelectorAll("[data-public-nav]")) node.textContent = "Download OMSC";
    for (const node of document.querySelectorAll("[data-launch-countdown]")) {
      node.removeAttribute("data-launch-countdown"); node.removeAttribute("aria-label"); node.removeAttribute("title");
      const value = node.querySelector(".launch-countdown-value"); if (value) value.textContent = "";
    }
    document.querySelector("[data-public-download-title]").textContent = "OMSC " + release.version + " is out now";
    document.querySelector("[data-public-download-copy]").textContent = "Your stream companion has arrived. Download the free Windows installer, connect your accounts and make it yours. Runs locally. No monthly subscription.";
    document.querySelector("[data-public-download-note]").textContent = "Download the official stable Windows installer above.";
    document.querySelector("[data-public-faq]").textContent = "Download the free stable Windows installer from the public download section below.";
    banner.hidden = false;
    document.getElementById("public-launch-status").textContent = "OMSC " + release.version + " is out now. The free Windows download is available.";
  }

  async function check() {
    if (released || checking || Date.now() < launchAt || Date.now() < nextCheck || document.hidden) return;
    checking = true;
    nextCheck = Date.now() + 300000;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(endpoint, { credentials: "omit", redirect: "error", cache: "no-cache", signal: controller.signal, headers: { Accept: "application/vnd.github+json" } });
      if (!response.ok) return; // Pending, rate-limited or unavailable: never claim a release.
      const release = publicRelease(await response.json());
      if (release) celebrate(release);
    } catch (_) { /* Retain the waiting state and retry later. No beta fallback. */ }
    finally { clearTimeout(timeout); checking = false; }
  }
  check();
  // Wake at the release instant even if this page was opened before launch.
  if (Date.now() < launchAt) setTimeout(check, Math.min(2147483647, launchAt - Date.now()));
  setInterval(check, 60000);
  window.addEventListener("focus", check);
  window.addEventListener("pageshow", check);
  document.addEventListener("visibilitychange", check);
})();
