"use strict";

(function () {
    const panel = document.getElementById("omsc-audio-visualiser");
    const barsRoot = document.getElementById("omsc-visualiser-bars");
    const artwork = document.getElementById("omsc-visualiser-artwork");
    const fallback = document.getElementById("omsc-visualiser-art-fallback");
    const track = document.getElementById("omsc-visualiser-track");
    const artist = document.getElementById("omsc-visualiser-artist");
    const progress = document.getElementById("omsc-visualiser-progress-fill");

    const controller = window.OMSCAudioVisualiser.create();

    // OMSC_STAGE5G_MARKER
    const isVisualiserPreview =
        new URLSearchParams(window.location.search)
            .get("preview") === "1";
    let state = null;
    let layout = "";
    let analysis = null;
    let polling = false;
    let lastPoll = 0;
    let lastArtwork = "";
    let bars = [];
    let smoothedLevels = [];
    let previousFrameAt = NaN;

    function supports(value) {
        return value === "WaveformStrip" ||
               value === "EqualiserTower";
    }

    function buildBars(count) {
        if (bars.length === count) return;

        barsRoot.replaceChildren();
        bars = [];
        smoothedLevels = new Array(count).fill(0);
        previousFrameAt = NaN;

        for (let i = 0; i < count; i++) {
            const bar = document.createElement("span");
            bar.className = "omsc-visualiser-bar";
            barsRoot.appendChild(bar);
            bars.push(bar);
        }
    }

    // OMSC_STAGE5C_MARKER
    function applyAppearance() {
        if (!layout || !state) return;

        const key = layout === "WaveformStrip"
            ? "waveformStrip"
            : "equaliserTower";

        const config = state.visualisers?.[key] || {};

        const hex = (value, fallback) =>
            /^#[0-9a-fA-F]{6}$/.test(String(value || ""))
                ? value
                : fallback;

        const primary = hex(config.primaryColor, "#00E5FF");
        const secondary = hex(config.secondaryColor, "#AF55FF");
        const panelColor = hex(config.panelColor, "#0C0A1C");

        // OMSC_STAGE5I_MARKER
        const progressColor = hex(
            config.progressBarColor,
            "#00E5FF"
        );

        progress.style.background = progressColor;
        progress.style.boxShadow =
            `0 0 8px ${progressColor}`;

        // OMSC_STAGE5F_MARKER
        const textColor = hex(config.textColor, "#FFFFFF");

        panel.style.color = textColor;
        track.style.color = textColor;
        artist.style.color = textColor;

        const glow = Number.isFinite(Number(config.glowPercent))
            ? Math.max(0, Math.min(100, Number(config.glowPercent)))
            : 50;

        panel.style.setProperty("--omsc-viz-primary", primary);
        panel.style.setProperty("--omsc-viz-secondary", secondary);

        panel.style.background =
            config.transparent === true
                ? "transparent"
                : panelColor;

        const strength = glow / 100;

        panel.style.boxShadow =
            strength > 0
                ? `0 0 ${Math.round(28 * strength)}px ${primary}55`
                : "none";

        for (const bar of bars) {
            bar.style.boxShadow =
                strength > 0
                    ? `0 0 ${Math.round(12 * strength)}px ${primary}`
                    : "none";
        }
    }
    function apply(nextState) {
        state = nextState;
        layout = supports(state?.layout) ? state.layout : "";

        panel.classList.toggle("layout-inactive", !layout);
        panel.classList.toggle(
            "visible",
            !!layout &&
            (isVisualiserPreview
                ? state?.enabled !== false
                : state?.visible === true)
        );
        panel.classList.toggle(
            "equaliser-tower",
            layout === "EqualiserTower"
        );

        if (!layout) return;

        const playback = state.playback || {};

        track.textContent = playback.title || "";
        artist.textContent = playback.artist || "";

        const nextArtwork =
            playback.albumArtworkUrl ||
            playback.artistArtworkUrl ||
            "";

        if (nextArtwork !== lastArtwork) {
            lastArtwork = nextArtwork;

            if (nextArtwork) {
                artwork.src = nextArtwork;
                artwork.style.display = "block";
                fallback.style.display = "none";
            } else {
                artwork.removeAttribute("src");
                artwork.style.display = "none";
                fallback.style.display = "";
            }
        }

        buildBars(layout === "WaveformStrip" ? 48 : 16);
        applyAppearance();
    }

    artwork.addEventListener("error", () => {
        artwork.style.display = "none";
        fallback.style.display = "";
    });

    async function pollAudio() {
        if (polling) return;
        polling = true;

        try {
            const response = await fetch(
                "/api/widget/now-playing/audio-analysis",
                { cache: "no-store" }
            );

            analysis = response.ok
                ? await response.json()
                : null;
        } catch {
            analysis = null;
        } finally {
            polling = false;
        }
    }

    function animate(now) {
        requestAnimationFrame(animate);

        if (!layout || !state) return;

        if (!isVisualiserPreview && state.visible !== true) {
            return;
        }

        // The dashboard preview always demonstrates motion.
        // Actual OBS playback remains tied to Spotify.
        if (!isVisualiserPreview && now - lastPoll >= 80) {
            lastPoll = now;
            void pollAudio();
        }


        const playback = state.playback || {};
        const playing = isVisualiserPreview ||
            String(playback.state || "").toLowerCase() === "playing";

        const capturedAt = analysis?.lastAudioUtc
            ? Date.parse(analysis.lastAudioUtc)
            : NaN;

        const freshCapture =
            analysis?.enabled === true &&
            analysis?.status === "Capturing" &&
            Number(analysis?.rootPid) > 0 &&
            Number.isFinite(capturedAt) &&
            Date.now() - capturedAt >= 0 &&
            Date.now() - capturedAt < 1500;

        const frame = controller.sample({
            playing,
            source: isVisualiserPreview ? "web" : (freshCapture ? "desktop" : "unknown"),
            analysis: !isVisualiserPreview && freshCapture ? analysis : null,
            trackKey: [
                playback.artist,
                playback.title,
                playback.durationSeconds
            ].join("|"),
            timeMs: now
        });

        const levels = layout === "WaveformStrip"
            ? frame.waveform
            : frame.spectrum;

        const frameDeltaMs = Number.isFinite(previousFrameAt)
            ? Math.max(0, Math.min(64, now - previousFrameAt))
            : 16;
        previousFrameAt = now;

        for (let i = 0; i < bars.length; i++) {
            const level = Number(levels[i] || 0);

            const safeLevel = Number.isFinite(level)
                ? Math.max(0, Math.min(1, Math.abs(level)))
                : 0;

            // Preview-only amplification makes the two visual
            // styles easy to inspect without changing real audio.
            let displayedLevel = isVisualiserPreview && playing
                ? Math.min(1, Math.pow(safeLevel, 0.65) * 1.65)
                : safeLevel;

            if (!isVisualiserPreview) {
                if (frame.mode === "idle") {
                    smoothedLevels[i] = 0;
                    displayedLevel = 0;
                } else {
                    const previous = smoothedLevels[i] || 0;
                    const smoothingMs = safeLevel > previous ? 65 : 240;
                    const fraction = 1 - Math.exp(-frameDeltaMs / smoothingMs);
                    displayedLevel = previous + (safeLevel - previous) * fraction;
                    smoothedLevels[i] = displayedLevel;
                }
            }

            bars[i].style.height =
                `${Math.max(4, Math.min(100, displayedLevel * 100))}%`;
        }

        if (typeof getCurrentPercentage === "function") {
            const percent = getCurrentPercentage();

            progress.style.width =
                `${Math.max(0, Math.min(100, percent))}%`;
        }
    }


    // OMSC_STAGE5E_MARKER
    window.OMSCAudioVisualiserDiagnostics = function () {
        const rect = panel.getBoundingClientRect();
        const details = document.querySelector(
            "#omsc-audio-visualiser .omsc-visualiser-details"
        );
        const detailsRect = details?.getBoundingClientRect();

        return {
            layout,
            visible: panel.classList.contains("visible"),
            canvasWidth: document.documentElement.clientWidth,
            canvasHeight: document.documentElement.clientHeight,
            panelWidth: Math.round(rect.width),
            panelHeight: Math.round(rect.height),
            detailsWidth: Math.round(detailsRect?.width || 0),
            bars: bars.length,
            track: state?.playback?.title || ""
        };
    };
    window.OMSCAudioVisualiserLayouts = { apply };

    requestAnimationFrame(animate);
})();