# OldMan Stream Companion — Official Website

Static Cloudflare Pages website. Public Windows installer: Coming Soon.
This repository is the **website**, not the OMSC application source.

Cloudflare Pages configuration: branch main, framework None, build command `exit 0`, output directory `.`.

Public launch is scheduled for Saturday 28 November 2026 at 10:00 am Australia/Adelaide (ACDT), equivalent to `2026-11-27T23:30:00Z`. `launch-countdown.js` uses that one absolute instant; countdowns follow the device clock and release dates use each visitor's system time zone.

## Public scan reports

The homepage's `#release-security` section reads same-origin `release-security/latest.json`.
The **Refresh public stable scan report** workflow runs hourly (GitHub schedules may be delayed), on manual dispatch, and when its code changes. It checks only `DeeJai1/OldMan-Stream-Companion-Public/releases/latest`; drafts, prereleases and version suffixes are rejected. Before updating the page metadata it verifies the stable Defender report, both package downloads against the report's exact SHA-256 hashes and sizes, the human-readable report hash, and both checksum files. Failed verification fails the workflow and retains the previous verified version, which is explicitly labelled on the page.

At launch, publish the stable installer, update ZIP, their `.sha256` files, and matching `OldManStreamCompanion-Security-Scan-vX.Y.Z.json` / `.md` reports in the public release. Run the refresh workflow immediately after publishing to avoid waiting for the schedule. Cloudflare Pages deploys the resulting metadata commit on main. No beta credentials or private reports are exposed.

The launch-day Discord draft is in `docs/discord-public-1.0-announcement.md`. Post it after the public release and its verification details are live; the draft is not sent automatically.

## Automatic release-day celebration

At the launch instant, the homepage begins checking the latest stable release in the public distribution repository. A top-of-page **“THE WAIT IS OVER. OMSC IS OUT NOW.”** banner appears only after both the clock has reached `2026-11-27T23:30:00Z` and GitHub lists a published stable version 1.0.0 or later with its uploaded, non-empty Windows installer. Drafts, betas, release candidates, missing installers and foreign download links cannot enable it. This uses the public GitHub API without credentials; no beta repository or private data is queried.

The gold/purple banner includes a free installer button, a fuller confetti celebration and a verification-section link. Ninety-six confetti pieces fall in staggered waves for roughly 14 seconds, then stop and is disabled for reduced-motion visitors. Navigation, hero, FAQ and download copy switch to the released state together; the announcement is accessible without moving focus or opening a modal. Before launch, the banner is hidden. If the date passes before publication, the countdown says “Awaiting public release”. A page left open checks at the exact scheduled launch instant, then retries every five minutes until a suitable release appears (GitHub outages/rate limits retain the waiting state). Reloading performs a fresh check. The clock uses the visitor's device time, as the countdown does.

No additional site edit is needed on release day for the banner. Publish the stable GitHub release with the correctly named installer. The separate verified scan-report workflow still needs to run after publishing, as described above. Do not publish a public stable installer in advance if it must remain unavailable before launch: the banner's date gate controls this website, not access to files already public on GitHub.

Validation: `node --test tests/launch-countdown.test.cjs`, `node tests/site-native-preview.test.cjs`, `node tests/launch-release-browser.cjs` (Playwright with Chromium), and the Python release-security suite. Browser checks simulate the launch clock and GitHub responses locally; there is no production preview switch that can bypass either gate.
