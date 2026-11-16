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
