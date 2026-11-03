# OldMan Stream Companion — Official Website

Static Cloudflare Pages website. Public Windows installer: Coming Soon.
This repository is the **website**, not the OMSC application source.

Cloudflare Pages configuration: branch main, framework None, build command `exit 0`, output directory `.`.

## Website accuracy and screenshot policy (November 2026 review)

The [OMSC application repository](https://github.com/DeeJai1/OldMan-Stream-Companion) is the feature and UI source of truth. The website is a separate static project; do not infer feature readiness from the presence of development UI or from a renderable sample. The public installer remains **Coming Soon** until explicitly published.

### Current visual asset inventory

| Website asset or preview | Source | Status |
| --- | --- | --- |
| `assets/omsc-dashboard-v050-preview.svg` | Hand-authored dashboard illustration | **Replace with a genuine current OMSC capture**; not a screenshot |
| Now Playing widget iframe | Original OMSC HTML/JS/CSS with demo API values | JS/CSS parity checked against application |
| Stream Credits iframe | Original widget with website demo adapter and black background | Renderer JS synchronised from app during November review; visual acceptance still needed |
| Alerts iframe | Website sample harness with OMSC-derived Alerts renderer | **Needs visual/API parity check** against the current app; not proof of full alert/event capabilities |
| `assets/social-preview.png` | Branded marketing graphic | Does not depict the application UI |

### Images required before approving a screenshot refresh

Capture from a **running** Windows OMSC development build with its exact commit/version recorded. Prioritise: Dashboard; Connections (Twitch and OBS); Commands Manager; Shoutouts Banner/Media; Raid Welcome; Native Twitch Events editor; Timed Messages; Stream Analytics; Sound/Video Alerts; Stream Credits settings. Capture real OMSC pages; do not generate UI likenesses or label an illustration as a screenshot.

Use demonstration accounts and non-sensitive data. Redact Twitch tokens, emails, personal file paths and private usernames; retain readable interface labels and controls. Record the build identifier alongside each source image, use consistent crops, and write alt text describing the visible interface accurately. If showing a feature not publicly released, clearly label the image **Development preview**.

### Documentation review checks

- Compare command counts, defaults and permissions with `OldManStreamCompanion.Server/Configuration/CommandSettings.cs`; the November review identified 27 default commands (17 viewer, 10 moderator).
- Distinguish existing modules, current v0.4.50 development work and later roadmap items. Do not advertise the separate future OMSC Bot as included in v0.4.50.
- Verify OBS/Streamer.bot claims against the actual release being described.
- Test local links, the demo widget tabs, keyboard navigation, mobile layout and media behaviour in a deployed preview before merging.
- Keep the public Windows installer labelled *Coming Soon* until an approved public release is available.
