"use strict";

// OMSC_STAGE7C_MARKER: Spectrum Ring approved prototype v3.
// This renderer uses the existing OMSC playback clock, not Spotify API requests.
(function () {
    const root = document.getElementById("omsc-spectrum-ring");
    if (!root) return;

    const byId = id => document.getElementById(id);
    const ring = byId("sr-progress");
    const artwork = byId("sr-cover-image");
    const title = byId("sr-track");
    const artist = byId("sr-artist");
    const album = byId("sr-album");
    const status = byId("sr-status");
    const remaining = byId("sr-remaining");
    const ticks = byId("sr-spectrum-ticks");
    const query = new URLSearchParams(window.location.search);
    const isPreview = query.get("preview") === "1";
    const circumference = 2 * Math.PI * 68;
    const startedAt = performance.now();
    const demoCycleMilliseconds = 30000;

    const defaults = {
        primaryColor: "#B36BFF",
        secondaryColor: "#39EDEB",
        panelColor: "#101119",
        textColor: "#F7F5FF",
        ringThicknessPixels: 8,
        glowPercent: 80,
        transparent: false
    };
    let active = false;
    let lastTickDraw = 0;

    for (let i = 0; i < 48; i++) {
        const bar = document.createElementNS("http://www.w3.org/2000/svg", "line");
        bar.setAttribute("x1", "80");
        bar.setAttribute("y1", "3");
        bar.setAttribute("x2", "80");
        bar.setAttribute("y2", "7");
        bar.setAttribute("transform", `rotate(${i * 7.5} 80 80)`);
        bar.setAttribute("class", "sr-orbit-tick");
        ticks.appendChild(bar);
    }
    const bars = Array.from(ticks.children);

    function hex(value, fallback) {
        return /^#[0-9a-f]{6}$/i.test(String(value || "")) ? value : fallback;
    }
    function clamp(value, min, max, fallback) {
        const numeric = Number(value);
        return Number.isFinite(numeric)
            ? Math.min(max, Math.max(min, numeric))
            : fallback;
    }
    function appearance(state) {
        let settings = { ...defaults, ...(state.spectrumRing || {}) };
        if (isPreview && query.has("spectrumRingAppearance")) {
            try {
                const override = JSON.parse(query.get("spectrumRingAppearance"));
                if (override && typeof override === "object" && !Array.isArray(override)) {
                    settings = { ...settings, ...override };
                }
            } catch {
                // Bad preview-only settings never break the OBS widget.
            }
        }
        for (const [variable, key] of [
            ["--sr-primary", "primaryColor"],
            ["--sr-secondary", "secondaryColor"],
            ["--sr-panel", "panelColor"],
            ["--sr-text", "textColor"]
        ]) {
            root.style.setProperty(variable, hex(settings[key], defaults[key]));
        }
        root.style.setProperty("--sr-ring-size", String(clamp(settings.ringThicknessPixels, 3, 14, 8)));
        root.style.setProperty("--sr-glow", String(clamp(settings.glowPercent, 0, 100, 80) / 100));
        root.classList.toggle("transparent", settings.transparent === true);
    }
    function setArtwork(url) {
        if (!url) {
            artwork.style.display = "none";
            artwork.removeAttribute("src");
            return;
        }
        if (artwork.getAttribute("src") !== url) {
            artwork.style.display = "block";
            artwork.src = url;
        }
    }
    artwork.addEventListener("error", () => {
        artwork.style.display = "none";
    });
    function secondsLeft(value) {
        const n = Math.max(0, Math.ceil(value));
        return `-${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
    }
    function isPlaying(state) {
        return isPreview || String(state?.playback?.state || "").toLowerCase() === "playing";
    }
    function setActive(enabled, state) {
        active = enabled === true;
        root.classList.toggle("sr-visible", active && state?.visible === true);
        if (!active) return;
        appearance(state);
        const playback = state.playback || {};
        title.textContent = playback.title || "";
        artist.textContent = playback.artist || "";
        album.textContent = playback.album || "";
        setArtwork(playback.albumArtworkUrl || "");
        root.classList.toggle("paused", !isPlaying(state));
        status.textContent = isPlaying(state) ? "PLAYING" : "PAUSED";
    }
    function tick(percentage, state) {
        if (!active || !state) return;
        const now = performance.now();
        const fraction = isPreview
            ? ((now - startedAt) % demoCycleMilliseconds) / demoCycleMilliseconds
            : clamp(percentage, 0, 100, 0) / 100;

        // At zero the arc is genuinely invisible, including its round end cap.
        ring.style.strokeDasharray = String(circumference);
        ring.style.strokeDashoffset = String(circumference * (1 - fraction));
        ring.style.opacity = fraction <= 0.000001 ? "0" : "1";

        const duration = Math.max(0, Number(state.playback?.durationSeconds) || 0);
        remaining.textContent = duration ? secondsLeft(duration * (1 - fraction)) : "";
        const playing = isPlaying(state);
        root.classList.toggle("paused", !playing);
        status.textContent = playing ? "PLAYING" : "PAUSED";

        // Animate the outer spectrum marks without any separate playhead dot.
        // Limit DOM updates to ten times per second for low OBS CPU usage.
        if (now - lastTickDraw >= 100) {
            lastTickDraw = now;
            const wave = now / 235;
            bars.forEach((bar, i) => {
                const energy = playing
                    ? 0.4 + 0.6 * Math.abs(Math.sin(wave + i * 0.54) * Math.cos(wave * 0.58 - i * 0.25))
                    : 0.28;
                bar.setAttribute("opacity", String(0.12 + 0.48 * energy));
                bar.setAttribute("stroke-width", String(1.1 + 1.4 * energy));
            });
        }
    }
    function hide() {
        active = false;
        root.classList.remove("sr-visible");
    }
    window.OMSCSpectrumRing = { setActive, tick, hide };
})();