"use strict";

// OMSC_STAGE8B_MARKER â€” Split Panel Duo Revision 2, approved visual design.
// Uses OMSC widget playback snapshots and the shared progress clock; no Spotify API calls.
(function () {
    const root = document.getElementById("omsc-split-panel-duo");
    if (!root) return;
    const byId = id => document.getElementById(id);
    const cover = byId("spd-cover-image");
    const title = byId("spd-title");
    const artist = byId("spd-artist");
    const album = byId("spd-album");
    const status = byId("spd-status");
    const remaining = byId("spd-remaining");
    const fill = byId("spd-progress-fill");
    const query = new URLSearchParams(window.location.search);
    const isPreview = query.get("preview") === "1";
    const demoStartedAt = performance.now();
    const demoCycleMilliseconds = 30000;
    const defaults = {
        artworkBorderColor: "#BA6FFF",
        detailsBorderColor: "#43EBED",
        artworkPanelColor: "#1A1428",
        detailsPanelColor: "#101921",
        textColor: "#F8F6FF",
        gapPixels: 16,
        glowPercent: 75,
        transparent: false,
        artworkSide: "Left"
    };
    let active = false;
    const hex = (value, fallback) =>
        /^#[a-f0-9]{6}$/i.test(String(value || "")) ? value : fallback;
    function clamp(value, minimum, maximum, fallback) {
        const numeric = Number(value);
        return Number.isFinite(numeric)
            ? Math.max(minimum, Math.min(maximum, numeric))
            : fallback;
    }
    function appearance(state) {
        let settings = { ...defaults, ...(state.splitPanelDuo || {}) };
        if (isPreview && query.has("splitPanelDuoAppearance")) {
            try {
                const override = JSON.parse(query.get("splitPanelDuoAppearance"));
                if (override && typeof override === "object" && !Array.isArray(override)) {
                    settings = { ...settings, ...override };
                }
            } catch {
                // Invalid preview settings must not break an OBS browser source.
            }
        }
        for (const [variable, key] of [
            ["--spd-art-border", "artworkBorderColor"],
            ["--spd-detail-border", "detailsBorderColor"],
            ["--spd-art-panel", "artworkPanelColor"],
            ["--spd-detail-panel", "detailsPanelColor"],
            ["--spd-text", "textColor"]
        ]) {
            root.style.setProperty(variable, hex(settings[key], defaults[key]));
        }
        root.style.setProperty("--spd-gap",
            `${clamp(settings.gapPixels, 8, 26, 16)}px`);
        root.style.setProperty("--spd-glow",
            String(clamp(settings.glowPercent, 0, 100, 75) / 100));
        root.classList.toggle("spd-transparent", settings.transparent === true);
        root.classList.toggle("spd-reverse",
            String(settings.artworkSide || "Left").toLowerCase() === "right");
    }
    function setArtwork(url) {
        if (!url) {
            cover.style.display = "none";
            cover.removeAttribute("src");
            return;
        }
        if (cover.getAttribute("src") !== url) {
            cover.src = url;
            cover.style.display = "block";
        } else if (cover.complete && cover.naturalWidth > 0) {
            cover.style.display = "block";
        }
    }
    cover.addEventListener("error", () => { cover.style.display = "none"; });
    function formatRemaining(seconds) {
        const n = Math.max(0, Math.ceil(seconds));
        return `-${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
    }
    function playing(state) {
        return isPreview ||
            String(state?.playback?.state || "").toLowerCase() === "playing";
    }
    function setActive(enabled, state) {
        active = enabled === true;
        root.classList.toggle("spd-visible", active && state?.visible === true);
        if (!active) return;
        appearance(state);
        const playback = state.playback || {};
        title.textContent = playback.title || "";
        artist.textContent = playback.artist || "";
        album.textContent = playback.album || "";
        setArtwork(playback.albumArtworkUrl || "");
        root.classList.toggle("spd-paused", !playing(state));
        status.textContent = playing(state) ? "PLAYING" : "PAUSED";
    }
    function tick(percentage, state) {
        if (!active || !state) return;
        const fraction = isPreview
            ? ((performance.now() - demoStartedAt) % demoCycleMilliseconds) / demoCycleMilliseconds
            : clamp(percentage, 0, 100, 0) / 100;
        fill.style.width = `${(fraction * 100).toFixed(3)}%`;
        const duration = Math.max(0, Number(state.playback?.durationSeconds) || 0);
        remaining.textContent = duration > 0
            ? formatRemaining(duration * (1 - fraction))
            : "";
        root.classList.toggle("spd-paused", !playing(state));
        status.textContent = playing(state) ? "PLAYING" : "PAUSED";
    }
    function hide() {
        active = false;
        root.classList.remove("spd-visible");
    }
    window.OMSCSplitPanelDuo = { setActive, tick, hide };
})();