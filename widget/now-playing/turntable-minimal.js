"use strict";

// OMSC_STAGE6B_MARKER
// Uses the existing Spotify widget state and playback clock.
(function () {
    const root = document.getElementById("omsc-turntable-minimal");
    if (!root) return;

    const element = id => document.getElementById(id);

    const vinyl = element("ttm-vinyl");
    const shaft = element("ttm-shaft");
    const title = element("ttm-title");
    const artist = element("ttm-artist");
    const status = element("ttm-state");
    const remaining = element("ttm-remaining");
    const fill = element("ttm-progress-fill");
    const artwork = element("ttm-artwork");
    const fallback = element("ttm-artwork-fallback");

    const params = new URLSearchParams(window.location.search);
    const isPreview = params.get("preview") === "1";

    // OMSC_STAGE6D_MARKER
    // Dashboard preview has an independent animation clock.
    const previewStartedAt = performance.now();
    const previewCycleSeconds = 30;

    root.classList.toggle("preview-demo", isPreview);

    let active = false;

    const defaults = {
        accentColor: "#AE70FF",
        secondaryColor: "#46E6FF",
        panelColor: "#101017",
        textColor: "#FFFFFF",
        progressBarColor: "#46E6FF",
        transparent: false
    };

    function color(value, fallback) {
        return /^#[0-9a-f]{6}$/i.test(String(value || ""))
            ? value
            : fallback;
    }

    function appearance(state) {
        let settings = {
            ...defaults,
            ...(state.turntableMinimal || {})
        };

        if (isPreview && params.has("turntableAppearance")) {
            try {
                const override = JSON.parse(
                    params.get("turntableAppearance")
                );

                if (override && typeof override === "object") {
                    settings = { ...settings, ...override };
                }
            } catch {
                // Ignore invalid preview-only appearance values.
            }
        }

        for (const [variable, property] of [
            ["--ttm-accent", "accentColor"],
            ["--ttm-secondary", "secondaryColor"],
            ["--ttm-panel", "panelColor"],
            ["--ttm-text", "textColor"],
            ["--ttm-progress", "progressBarColor"]
        ]) {
            root.style.setProperty(
                variable,
                color(settings[property], defaults[property])
            );
        }

        root.classList.toggle(
            "is-transparent",
            settings.transparent === true
        );
    }

    function setArtwork(url) {
        if (!url) {
            artwork.removeAttribute("src");
            artwork.style.display = "none";
            fallback.style.display = "";
            return;
        }

        if (artwork.getAttribute("src") !== url) {
            artwork.src = url;
        }

        artwork.style.display = "";
        fallback.style.display = "none";
    }

    artwork.addEventListener("error", () => {
        artwork.style.display = "none";
        fallback.style.display = "";
    });

    function formatRemaining(seconds) {
        const safe = Math.max(0, Math.ceil(seconds));
        const minutes = Math.floor(safe / 60);
        return `-${minutes}:${String(safe % 60).padStart(2, "0")}`;
    }

    function setActive(enabled, state) {
        active = enabled === true;

        root.classList.toggle(
            "visible",
            active && state?.visible === true
        );

        if (!active) return;

        appearance(state);

        const playback = state.playback || {};

        title.textContent = playback.title || "";
        artist.textContent = playback.artist || "";
        setArtwork(playback.albumArtworkUrl || "");

        const playing = isPreview ||
            String(playback.state || "").toLowerCase()
                === "playing";

        root.classList.toggle("is-paused", !playing);
        status.textContent = playing ? "PLAYING" : "PAUSED";
    }

    function tick(percentage, state) {
        if (!active || !state) return;

        // Preview demonstrates a full groove sweep.
        // Actual OBS continues to use Spotify playback progress.
        const previewElapsedSeconds = Math.max(
            0,
            (performance.now() - previewStartedAt) / 1000
        );

        const previewPercentage =
            (previewElapsedSeconds % previewCycleSeconds) /
            previewCycleSeconds * 100;

        const safe = Math.max(
            0,
            Math.min(
                100,
                isPreview
                    ? previewPercentage
                    : (Number(percentage) || 0)
            )
        );

        // Outer groove = 13 degrees.
        // Halfway = 25 degrees.
        // Inner playable groove = 37 degrees.
        const angle = 13 + 24 * (safe / 100);

        shaft.style.transform =
            `rotate(${angle.toFixed(3)}deg)`;

        fill.style.width = `${safe}%`;

        const playback = state.playback || {};
        const duration = Math.max(
            0,
            Number(playback.durationSeconds || 0)
        );

        remaining.textContent = duration > 0
            ? formatRemaining(
                duration * (1 - safe / 100)
            )
            : "";

        const playing = isPreview ||
            String(playback.state || "").toLowerCase()
                === "playing";

        root.classList.toggle("is-paused", !playing);
        status.textContent = playing ? "PLAYING" : "PAUSED";
    }

    function hide() {
        active = false;
        root.classList.remove("visible");
    }

    window.OMSCTurntableMinimal = {
        setActive,
        tick,
        hide
    };
})();