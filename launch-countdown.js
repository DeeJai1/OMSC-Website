"use strict";
(() => {
  // Saturday 28 November 2026, 10:00 am in Australia/Adelaide (ACDT, UTC+10:30).
  // Keep one absolute instant: visitors must not count down to 10 am in their own zone.
  const launchISO = "2026-11-27T23:30:00Z";
  const launchAt = Date.parse(launchISO);
  const badges = [...document.querySelectorAll("[data-launch-countdown]")];
  const localDates = [...document.querySelectorAll("[data-launch-local]")];
  if (!badges.length && !localDates.length) return;

  function render() {
    // Re-read the system clock rather than decrementing a counter: sleeping tabs
    // and computer clock changes must not accumulate drift or show negative time.
    const remaining = Math.max(0, launchAt - Date.now());
    const days = Math.floor(remaining / 86400000);
    // Keep the final partial day accurate without showing hours or reaching zero early.
    const countdown = remaining > 0 && days === 0
      ? "Less than 1 day"
      : `${days} ${days === 1 ? "day" : "days"} to launch`;
    for (const badge of badges) badge.querySelector(".launch-countdown-value").textContent = countdown;
  }

  function refresh() {
    // No timeZone override: Intl uses the visitor's system time zone, including
    // the correct daylight-saving offset at the future release date.
    const local = new Intl.DateTimeFormat(undefined, {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      hour: "numeric", minute: "2-digit", timeZoneName: "short"
    }).format(new Date(launchAt));
    for (const time of localDates) { time.dateTime = launchISO; time.textContent = local; }
    for (const badge of badges) {
      badge.title = "Public launch: " + local;
      // Announce the exact local date once; do not repeatedly announce the changing countdown.
      badge.setAttribute("aria-label", "Public launch: " + local);
    }
    for (const hint of document.querySelectorAll("[data-launch-local-hint]")) hint.hidden = false;
    render();
  }

  refresh();
  setInterval(render, 60000);
  window.addEventListener("focus", refresh);
  window.addEventListener("pageshow", refresh);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });
})();
