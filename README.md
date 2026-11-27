# OldMan Stream Companion — Official Website

Static Cloudflare Pages website. Public Windows installer: Coming Soon.
This repository is the **website**, not the OMSC application source.

Cloudflare Pages configuration: branch main, framework None, build command `exit 0`, output directory `.`.

Public launch is active at the owner’s request. Its reference time is the 1.0.0 publication on Saturday 28 November 2026 at 6:04 am Australia/Adelaide (ACDT), equivalent to `2026-11-27T19:34:09Z`. `launch-countdown.js` uses that one absolute instant; countdowns follow the device clock and release dates use each visitor's system time zone.

## Public scan reports

The homepage's `#release-security` section reads same-origin `release-security/latest.json`.
The **Refresh public stable scan report** workflow runs hourly (GitHub schedules may be delayed), on manual dispatch, and when its code changes. It checks only `DeeJai1/OldMan-Stream-Companion-Public/releases/latest`; drafts, prereleases and version suffixes are rejected. Before updating the page metadata it verifies the stable Defender report, both package downloads against the report's exact SHA-256 hashes and sizes, the human-readable report hash, and both checksum files. Failed verification fails the workflow and retains the previous verified version, which is explicitly labelled on the page.

At launch, publish the stable installer, update ZIP, their `.sha256` files, and matching `OldManStreamCompanion-Security-Scan-vX.Y.Z.json` / `.md` reports in the public release. Run the refresh workflow immediately after publishing to avoid waiting for the schedule. Cloudflare Pages deploys the resulting metadata commit on main. No beta credentials or private reports are exposed.

The launch-day Discord draft is in `docs/discord-public-1.0-announcement.md`. Post it after the public release and its verification details are live; the draft is not sent automatically.

## Automatic release-day celebration

At the launch instant, the homepage begins checking the latest stable release in the public distribution repository. A top-of-page **“THE WAIT IS OVER. OMSC IS OUT NOW.”** banner appears only after both the clock has reached `2026-11-27T19:34:09Z` and GitHub lists a published stable version 1.0.0 or later with its uploaded, non-empty Windows installer. Drafts, betas, release candidates, missing installers and foreign download links cannot enable it. This uses the public GitHub API without credentials; no beta repository or private data is queried.

The gold/purple banner includes a free installer button, a fuller confetti celebration and a verification-section link. Ninety-six confetti pieces loop continuously in staggered waves. Visitors can pause them; reduced-motion visitors see no confetti. The celebration banner retires after seven days, timed from the later of the scheduled launch and the original 1.0.0 publication. Later patches do not restart this week. Regular download links remain available afterward. Navigation, hero, FAQ and download copy switch to the released state together; the announcement is accessible without moving focus or opening a modal. Before launch, the banner is hidden. If the date passes before publication, the countdown says “Awaiting public release”. A page left open checks at the exact scheduled launch instant, then retries every five minutes until a suitable release appears (GitHub outages/rate limits retain the waiting state). Reloading performs a fresh check. The clock uses the visitor's device time, as the countdown does.

No additional site edit is needed on release day for the banner. Publish the stable GitHub release with the correctly named installer. The separate verified scan-report workflow still needs to run after publishing, as described above. Do not publish a public stable installer in advance if it must remain unavailable before launch: the banner's date gate controls this website, not access to files already public on GitHub.

Validation: `node --test tests/launch-countdown.test.cjs`, `node tests/site-native-preview.test.cjs`, `node tests/launch-release-browser.cjs` (Playwright with Chromium), and the Python release-security suite. Browser checks simulate the launch clock and GitHub responses locally; there is no production preview switch that can bypass either gate.

## Direct installer and Cloudflare backup

After both existing launch gates pass, the homepage provides **Download OMSC for
Windows** (the exact official GitHub installer asset) and **Backup download
(Cloudflare)**. No GitHub account is required for the primary link. The backup
button appears only for the same verified stable version as the primary link.

The site first reads public-only metadata from
`https://omsc-public-downloads.mattshoemark.workers.dev/latest.json`; if that is
unavailable or pending, it retains the GitHub release check. This allows launch
and verification details to work for visitors whose networks block GitHub.
Checksum and scan-report links also have independent Cloudflare-hosted copies.
There is no beta/private-source fallback. Both buttons stay hidden before launch
or before a suitable stable release exists. A page opened while the mirror is
pending rechecks and can enable the backup when it becomes ready.

The separate private-repository **Public stable installer mirror** workflow runs
hourly and on owner dispatch. It copies only the published stable installer,
installer checksum and exact matching JSON/Markdown scan reports into the
separate private R2 bucket `omsc-public-installers`. Installer bytes, successful
stable scan coverage, checksum and storage readback must match before its latest
manifest is published. Versioned files are immutable. Do not place any private
beta packages in this bucket. The new public download Worker has no beta binding
or publishing credential and supports resumable downloads.

At release, publish the reviewed public stable release with the required scan
reports and installer `.sha256`, then dispatch the private mirror workflow in
`sync` mode immediately. Verify its version/hash and both download links before
announcing availability. The hourly job subsequently refreshes it automatically.
No release is created or published by this setup. A scan/sync failure keeps the
previous verified copy and does not advertise an unverified replacement.

GitHub asset download counters cover the primary downloads only. This mirror
adds no country tracking, visitor identifiers or claim that GitHub counts include
Cloudflare transfers. A future combined download total would need a separate
aggregate mirror counter.
