const STATE_ENDPOINT =
    "/api/widget/now-playing/state";

const POLL_INTERVAL_MS =
    2000;

let latestState =
    null;

let progressAnchorPositionSeconds =
    0;

let progressAnchorAt =
    performance.now();

let progressTrackKey =
    "";

let progressPlaybackState =
    "stopped";

let progressSnapshotUpdatedAt =
    "";

const SMALL_BACKWARD_CORRECTION_SECONDS =
    2.5;


let displayedTrackKey =
    "";

let displayStartedAt =
    performance.now();

let lastDisplayDurationSeconds =
    null;

let lastBaseVisible =
    false;

let displayHideTimer =
    null;

let compactDisplayedTrackKey =
    "";

let compactRevealStartedAt =
    performance.now();

let compactLastRevealDurationSeconds =
    null;

let compactLastBaseVisible =
    false;

let compactDrawerHideTimer =
    null;

let mixtapeDisplayedTrackKey =
    "";

let mixtapeChangeTimer =
    null;

let hiFiDisplayedTrackKey =
    "";

let hiFiChangeTimer =
    null;

let recordShelfDisplayedTrackKey =
    "";

let recordShelfChangeTimer =
    null;

const isPreview =
    new URLSearchParams(
        window.location.search)
        .get("preview") === "1";

const card =
    document.getElementById(
        "now-playing-card");

const backgroundLayer =
    document.getElementById(
        "background-layer");

const content =
    document.getElementById(
        "widget-content");

const label =
    document.getElementById(
        "now-playing-label");

const watermark =
    document.getElementById(
        "watermark");

const artistImageContainer =
    document.getElementById(
        "artist-image-container");

const artistImage =
    document.getElementById(
        "artist-image");

const artistName =
    document.getElementById(
        "artist-name");

const trackName =
    document.getElementById(
        "track-name");

const waveProgress =
    document.getElementById(
        "wave-progress");

const waveTrack =
    document.getElementById(
        "wave-track");

const wavePlayed =
    document.getElementById(
        "wave-played");

const waveClipRect =
    document.getElementById(
        "wave-progress-clip-rect");

const straightProgress =
    document.getElementById(
        "straight-progress");

const straightPlayed =
    document.getElementById(
        "straight-progress-played");

const timeRemaining =
    document.getElementById(
        "time-remaining");

const compactReveal =
    document.getElementById(
        "compact-reveal");

const compactArtworkShell =
    document.getElementById(
        "compact-reveal-artwork-shell");

const compactArtistImage =
    document.getElementById(
        "compact-artist-image");

const compactArtworkFallback =
    document.getElementById(
        "compact-artwork-fallback");

const compactDrawerClip =
    document.getElementById(
        "compact-drawer-clip");

const compactDrawer =
    document.getElementById(
        "compact-drawer");

const compactArtistName =
    document.getElementById(
        "compact-artist-name");

const compactTrackName =
    document.getElementById(
        "compact-track-name");

const compactProgressTrack =
    document.getElementById(
        "compact-progress-track");

const compactProgressPlayed =
    document.getElementById(
        "compact-progress-played");

const vinylPlayer =
    document.getElementById(
        "vinyl-player");

const vinylArtistImage =
    document.getElementById(
        "vinyl-artist-image");

const vinylArtworkFallback =
    document.getElementById(
        "vinyl-artwork-fallback");

const vinylInfoPanel =
    document.getElementById(
        "vinyl-info-panel");

const vinylArtistName =
    document.getElementById(
        "vinyl-artist-name");

const vinylTrackName =
    document.getElementById(
        "vinyl-track-name");

const vinylAlbumName =
    document.getElementById(
        "vinyl-album-name");

const vinylTimeRemaining =
    document.getElementById(
        "vinyl-time-remaining");

const vinylProgressTrack =
    document.getElementById(
        "vinyl-progress-track");

const vinylProgressPlayed =
    document.getElementById(
        "vinyl-progress-played");

const mixtapePlayer =
    document.getElementById(
        "mixtape-player");

const mixtapeAlbumImage =
    document.getElementById(
        "mixtape-album-image");

const mixtapeArtworkFallback =
    document.getElementById(
        "mixtape-artwork-fallback");

const mixtapeArtistName =
    document.getElementById(
        "mixtape-artist-name");

const mixtapeTrackName =
    document.getElementById(
        "mixtape-track-name");

const mixtapeAlbumName =
    document.getElementById(
        "mixtape-album-name");

const mixtapeTimeRemaining =
    document.getElementById(
        "mixtape-time-remaining");

const mixtapeProgressPlayed =
    document.getElementById(
        "mixtape-progress-played");

const hiFiDeck =
    document.getElementById(
        "hi-fi-deck");

const hiFiArtworkShell =
    document.getElementById(
        "hi-fi-artwork-shell");

const hiFiAlbumImage =
    document.getElementById(
        "hi-fi-album-image");

const hiFiArtworkFallback =
    document.getElementById(
        "hi-fi-artwork-fallback");

const hiFiDisplay =
    document.getElementById(
        "hi-fi-display");

const hiFiPlayState =
    document.getElementById(
        "hi-fi-play-state");

const hiFiTimeRemaining =
    document.getElementById(
        "hi-fi-time-remaining");

const hiFiArtistName =
    document.getElementById(
        "hi-fi-artist-name");

const hiFiTrackName =
    document.getElementById(
        "hi-fi-track-name");

const hiFiAlbumName =
    document.getElementById(
        "hi-fi-album-name");

const hiFiProgressPlayed =
    document.getElementById(
        "hi-fi-progress-played");

const hiFiStatus =
    document.getElementById(
        "hi-fi-status");

const recordShelf =
    document.getElementById(
        "record-shelf");

const recordShelfCurrentSleeve =
    document.getElementById(
        "record-shelf-current-sleeve");

const recordShelfAlbumImage =
    document.getElementById(
        "record-shelf-album-image");

const recordShelfArtworkFallback =
    document.getElementById(
        "record-shelf-artwork-fallback");

const recordShelfTrackName =
    document.getElementById(
        "record-shelf-track-name");

const recordShelfArtistName =
    document.getElementById(
        "record-shelf-artist-name");

const recordShelfAlbumName =
    document.getElementById(
        "record-shelf-album-name");

const recordShelfTimeRemaining =
    document.getElementById(
        "record-shelf-time-remaining");

const recordShelfProgressPlayed =
    document.getElementById(
        "record-shelf-progress-played");


function createFallbackWavePath()
{
    const width =
        1000;

    const centre =
        20;

    const amplitude =
        9;

    const wavelength =
        72;

    const points =
        [];

    for (
        let x = 0;
        x <= width;
        x += 4)
    {
        const y =
            centre +
            Math.sin(
                (x / wavelength) *
                Math.PI *
                2
            ) *
            amplitude;

        points.push(
            `${x},${y.toFixed(2)}`);
    }

    return `M ${points.join(" L ")}`;
}


function setClassicProgressPath(
    style)
{
    const shared =
        window.OMSCProgressPaths;

    const path =
        shared &&
        typeof shared.createPath ===
            "function"
            ? shared.createPath(
                style)
            : createFallbackWavePath();

    waveTrack.setAttribute(
        "d",
        path);

    wavePlayed.setAttribute(
        "d",
        path);
}


setClassicProgressPath(
    "Wave");

const COMPACT_RING_RADIUS =
    52;

const COMPACT_RING_CIRCUMFERENCE =
    2 *
    Math.PI *
    COMPACT_RING_RADIUS;

compactProgressPlayed.style.strokeDasharray =
    String(
        COMPACT_RING_CIRCUMFERENCE);

compactProgressPlayed.style.strokeDashoffset =
    String(
        COMPACT_RING_CIRCUMFERENCE);

const VINYL_RING_VIEWBOX_SIZE =
    120;

const VINYL_RING_CENTRE =
    60;

const VINYL_RING_RADIUS =
    54;

let vinylProgressArc =
    null;

vinylProgressPlayed.style.strokeDasharray =
    "none";

vinylProgressPlayed.style.strokeDashoffset =
    "0";

vinylProgressPlayed.style.opacity =
    "0";


function updateVinylProgressArc(
    sleeveSizePixels,
    vinylExposurePixels)
{
    const recordSize =
        Math.max(
            1,
            Number(
                sleeveSizePixels) -
            8);

    const exposure =
        Math.max(
            0,
            Math.min(
                recordSize,
                Number(
                    vinylExposurePixels) ||
                0));

    /*
        The sleeve covers the left portion of the record.

        Convert that vertical sleeve edge into the SVG's
        120 x 120 coordinate system, then find where that
        edge intersects the progress-ring circle.
    */
    const sleeveBoundaryX =
        VINYL_RING_VIEWBOX_SIZE *
        (
            1 -
            exposure /
            recordSize
        );

    const intersectionRatio =
        Math.max(
            -0.999999,
            Math.min(
                0.999999,
                (
                    sleeveBoundaryX -
                    VINYL_RING_CENTRE
                ) /
                VINYL_RING_RADIUS));

    const halfArcAngle =
        Math.acos(
            intersectionRatio);

    const startAngle =
        -halfArcAngle;

    const endAngle =
        halfArcAngle;

    const startX =
        VINYL_RING_CENTRE +
        VINYL_RING_RADIUS *
        Math.cos(
            startAngle);

    const startY =
        VINYL_RING_CENTRE +
        VINYL_RING_RADIUS *
        Math.sin(
            startAngle);

    const endX =
        VINYL_RING_CENTRE +
        VINYL_RING_RADIUS *
        Math.cos(
            endAngle);

    const endY =
        VINYL_RING_CENTRE +
        VINYL_RING_RADIUS *
        Math.sin(
            endAngle);

    const largeArcFlag =
        (
            halfArcAngle *
            2
        ) >
        Math.PI
            ? 1
            : 0;

    /*
        Travel clockwise from the upper sleeve boundary,
        around only the exposed side of the record, to the
        lower sleeve boundary.
    */
    const path =
        [
            "M",
            startX.toFixed(3),
            startY.toFixed(3),
            "A",
            VINYL_RING_RADIUS,
            VINYL_RING_RADIUS,
            0,
            largeArcFlag,
            1,
            endX.toFixed(3),
            endY.toFixed(3)
        ].join(
            " ");

    vinylProgressTrack.setAttribute(
        "d",
        path);

    vinylProgressArc =
        {
            startAngle,
            endAngle
        };
}


function updateVinylPlayedProgress(
    percentage)
{
    const safePercentage =
        Math.max(
            0,
            Math.min(
                100,
                Number(
                    percentage) ||
                0));

    if (!vinylProgressArc ||
        safePercentage <= 0)
    {
        vinylProgressPlayed.setAttribute(
            "d",
            "");

        vinylProgressPlayed.style.opacity =
            "0";

        return;
    }

    const progressFraction =
        safePercentage /
        100;

    const totalAngle =
        vinylProgressArc.endAngle -
        vinylProgressArc.startAngle;

    const playedAngle =
        totalAngle *
        progressFraction;

    const currentAngle =
        vinylProgressArc.startAngle +
        playedAngle;

    const startX =
        VINYL_RING_CENTRE +
        VINYL_RING_RADIUS *
        Math.cos(
            vinylProgressArc.startAngle);

    const startY =
        VINYL_RING_CENTRE +
        VINYL_RING_RADIUS *
        Math.sin(
            vinylProgressArc.startAngle);

    const currentX =
        VINYL_RING_CENTRE +
        VINYL_RING_RADIUS *
        Math.cos(
            currentAngle);

    const currentY =
        VINYL_RING_CENTRE +
        VINYL_RING_RADIUS *
        Math.sin(
            currentAngle);

    const largeArcFlag =
        playedAngle >
        Math.PI
            ? 1
            : 0;

    const playedPath =
        [
            "M",
            startX.toFixed(3),
            startY.toFixed(3),
            "A",
            VINYL_RING_RADIUS,
            VINYL_RING_RADIUS,
            0,
            largeArcFlag,
            1,
            currentX.toFixed(3),
            currentY.toFixed(3)
        ].join(
            " ");

    vinylProgressPlayed.setAttribute(
        "d",
        playedPath);

    vinylProgressPlayed.style.opacity =
        "1";
}


function hexToRgb(
    hex)
{
    const value =
        String(
            hex || "")
            .replace(
                "#",
                "")
            .trim();

    if (!/^[0-9a-fA-F]{6}$/.test(
            value))
    {
        return {
            r: 36,
            g: 26,
            b: 54
        };
    }

    return {
        r:
            parseInt(
                value.substring(
                    0,
                    2),
                16),

        g:
            parseInt(
                value.substring(
                    2,
                    4),
                16),

        b:
            parseInt(
                value.substring(
                    4,
                    6),
                16)
    };
}


function getWatermarkColour(
    backgroundColour,
    style)
{
    const rgb =
        hexToRgb(
            backgroundColour);

    const luminance =
        (
            0.299 * rgb.r +
            0.587 * rgb.g +
            0.114 * rgb.b
        ) / 255;

    const opacity =
        String(
            style || "")
            .toLowerCase() ===
            "embossed"
            ? 0.055
            : 0.035;

    if (luminance > 0.55)
    {
        return `rgba(0, 0, 0, ${opacity})`;
    }

    return `rgba(255, 255, 255, ${opacity})`;
}


function getImageClass(
    value)
{
    switch (
        String(
            value || "")
            .toLowerCase())
    {
        case "right":
            return "image-right";

        case "off":
            return "image-off";

        default:
            return "image-left";
    }
}


function getLabelClass(
    value,
    imageClass)
{
    switch (
        String(
            value || "")
            .toLowerCase())
    {
        case "left":
            return "label-left";

        case "center":
            return "label-center";

        case "right":
            return "label-right";

        case "off":
            return "label-off";

        case "auto":
        default:
            return imageClass === "image-right"
                ? "label-left"
                : "label-right";
    }
}


function applyBackground(
    state)
{
    const style =
        String(
            state.backgroundStyle ||
            "Colour")
            .toLowerCase();

    const opacity =
        Math.max(
            0,
            Math.min(
                100,
                Number(
                    state.backgroundOpacityPercent ??
                    92))) /
        100;

    backgroundLayer.style.backgroundImage =
        "none";

    backgroundLayer.style.backgroundColor =
        "transparent";

    backgroundLayer.style.opacity =
        "1";

    card.classList.remove(
        "background-transparent");

    if (style === "transparent")
    {
        card.classList.add(
            "background-transparent");

        return;
    }

    if (
        style === "image" &&
        state.backgroundImageUrl)
    {
        backgroundLayer.style.backgroundImage =
            `url("${state.backgroundImageUrl}")`;

        backgroundLayer.style.opacity =
            String(opacity);

        return;
    }

    const background =
        hexToRgb(
            state.backgroundColor);

    backgroundLayer.style.backgroundColor =
        `rgba(${background.r}, ${background.g}, ${background.b}, ${opacity})`;
}


function getWatermarkPositionClass(
    labelClass)
{
    if (labelClass === "label-right")
    {
        return "watermark-left";
    }

    return "watermark-right";
}


function applyProgressStyle(
    state)
{
    const style =
        String(
            state.progressStyle ||
            "Wave")
            .trim()
            .toLowerCase();

    const isWave =
        style ===
        "wave";

    const isEcg =
        style ===
            "ecg / pulse" ||
        style ===
            "ecg" ||
        style ===
            "pulse";

    const usesSvg =
        isWave ||
        isEcg;

    waveProgress.classList.toggle(
        "off",
        !usesSvg);

    waveProgress.classList.toggle(
        "is-ecg",
        isEcg);

    const playbackState =
        String(
            state.playback?.state ||
            "")
            .toLowerCase();

    waveProgress.classList.toggle(
        "is-playing",
        playbackState ===
            "playing");

    const progressSvg =
        waveProgress.querySelector(
            "svg");

    if (progressSvg)
    {
        progressSvg.setAttribute(
            "preserveAspectRatio",
            isEcg
                ? "none"
                : "xMidYMid meet");
    }

    if (usesSvg)
    {
        setClassicProgressPath(
            isEcg
                ? "ECG / Pulse"
                : "Wave");
    }

    straightProgress.classList.toggle(
        "off",
        style !==
            "straight");

    const colour =
        state.progressBarColor ||
        "#76FF21";

    wavePlayed.style.stroke =
        colour;

    straightPlayed.style.backgroundColor =
        colour;
}


function applyPreviewOverrides(
    state)
{
    const params =
        new URLSearchParams(
            window.location.search);

    if (params.get("preview") !== "1")
    {
        return state;
    }

    const stringValue =
        (name, fallback) =>
            params.has(name)
                ? params.get(name)
                : fallback;

    const numberValue =
        (name, fallback) => {
            if (!params.has(name))
            {
                return fallback;
            }

            const value =
                Number(
                    params.get(name));

            return Number.isFinite(value)
                ? value
                : fallback;
        };

    const booleanValue =
        (name, fallback) =>
            params.has(name)
                ? params.get(name) === "true"
                : fallback;

    // OMSC_STAGE5F_MARKER
    if (params.has("visualiserAppearance"))
    {
        try
        {
            const supplied = JSON.parse(
                params.get("visualiserAppearance")
            );

            // OMSC_STAGE5H_MARKER
            // Preview layout selection takes priority over saved layout.
            const selectedLayout = String(
                params.get("layout") || state.layout || ""
            ).toLowerCase();

            const key = selectedLayout === "waveformstrip"
                ? "waveformStrip"
                : selectedLayout === "equalisertower"
                    ? "equaliserTower"
                    : null;

            if (key && supplied &&
                typeof supplied === "object" &&
                !Array.isArray(supplied))
            {
                state.visualisers ||= {};
                state.visualisers[key] = {
                    ...(state.visualisers[key] || {}),
                    ...supplied
                };
            }
        }
        catch
        {
            // Invalid preview parameters must not
            // interrupt the main widget.
        }
    }
    state.enabled =
        booleanValue(
            "enabled",
            state.enabled);

    state.backgroundStyle =
        stringValue(
            "backgroundStyle",
            state.backgroundStyle);

    state.backgroundColor =
        stringValue(
            "backgroundColor",
            state.backgroundColor);

    state.backgroundOpacityPercent =
        numberValue(
            "backgroundOpacityPercent",
            state.backgroundOpacityPercent);

    state.artistImagePosition =
        stringValue(
            "artistImagePosition",
            state.artistImagePosition);

    state.nowPlayingLabelPosition =
        stringValue(
            "nowPlayingLabelPosition",
            state.nowPlayingLabelPosition);

    state.progressStyle =
        stringValue(
            "progressStyle",
            state.progressStyle);

    state.progressBarColor =
        stringValue(
            "progressBarColor",
            state.progressBarColor);

    state.watermarkStyle =
        "Embossed";

    state.displayDurationSeconds =
        numberValue(
            "displayDurationSeconds",
            state.displayDurationSeconds);

    state.textColor =
        stringValue(
            "textColor",
            state.textColor);

    state.artistFontSize =
        numberValue(
            "artistFontSize",
            state.artistFontSize);

    state.trackFontSize =
        numberValue(
            "trackFontSize",
            state.trackFontSize);

    state.showTimeRemaining =
        booleanValue(
            "showTimeRemaining",
            state.showTimeRemaining);

    state.layout =
        stringValue(
            "layout",
            state.layout ||
            "Classic");

    state.compactReveal =
        state.compactReveal ||
        {};

    state.compactReveal.revealDurationSeconds =
        numberValue(
            "compactRevealDurationSeconds",
            state.compactReveal.revealDurationSeconds);

    state.compactReveal.animationDurationMilliseconds =
        numberValue(
            "compactRevealAnimationMilliseconds",
            state.compactReveal.animationDurationMilliseconds);

    state.compactReveal.artworkSizePixels =
        numberValue(
            "compactRevealArtworkSizePixels",
            state.compactReveal.artworkSizePixels);

    state.compactReveal.panelWidthPixels =
        numberValue(
            "compactRevealPanelWidthPixels",
            state.compactReveal.panelWidthPixels);

    state.compactReveal.progressRingThicknessPixels =
        numberValue(
            "compactRevealRingThicknessPixels",
            state.compactReveal.progressRingThicknessPixels);

    state.compactReveal.progressRingColor =
        stringValue(
            "compactRevealRingColor",
            state.compactReveal.progressRingColor);

    state.compactReveal.backgroundColor =
        stringValue(
            "compactRevealBackgroundColor",
            state.compactReveal.backgroundColor);

    state.compactReveal.backgroundOpacityPercent =
        numberValue(
            "compactRevealBackgroundOpacityPercent",
            state.compactReveal.backgroundOpacityPercent);

    state.compactReveal.textColor =
        stringValue(
            "compactRevealTextColor",
            state.compactReveal.textColor);

    state.compactReveal.artistFontSize =
        numberValue(
            "compactRevealArtistFontSize",
            state.compactReveal.artistFontSize);

    state.compactReveal.trackFontSize =
        numberValue(
            "compactRevealTrackFontSize",
            state.compactReveal.trackFontSize);

    state.vinylPlayer =
        state.vinylPlayer ||
        {};

    state.vinylPlayer.sleeveSizePixels =
        numberValue(
            "vinylSleeveSizePixels",
            state.vinylPlayer.sleeveSizePixels);

    state.vinylPlayer.vinylExposurePixels =
        numberValue(
            "vinylExposurePixels",
            state.vinylPlayer.vinylExposurePixels);

    state.vinylPlayer.rotationRpm =
        numberValue(
            "vinylRotationRpm",
            state.vinylPlayer.rotationRpm);

    state.vinylPlayer.accentColor =
        stringValue(
            "vinylAccentColor",
            state.vinylPlayer.accentColor);

    state.vinylPlayer.panelColor =
        stringValue(
            "vinylPanelColor",
            state.vinylPlayer.panelColor);

    state.vinylPlayer.panelOpacityPercent =
        numberValue(
            "vinylPanelOpacityPercent",
            state.vinylPlayer.panelOpacityPercent);

    state.vinylPlayer.textColor =
        stringValue(
            "vinylTextColor",
            state.vinylPlayer.textColor);

    state.vinylPlayer.artistFontSize =
        numberValue(
            "vinylArtistFontSize",
            state.vinylPlayer.artistFontSize);

    state.vinylPlayer.trackFontSize =
        numberValue(
            "vinylTrackFontSize",
            state.vinylPlayer.trackFontSize);

    state.vinylPlayer.showAlbum =
        booleanValue(
            "vinylShowAlbum",
            state.vinylPlayer.showAlbum);

    state.vinylPlayer.showTimeRemaining =
        booleanValue(
            "vinylShowTimeRemaining",
            state.vinylPlayer.showTimeRemaining);

    state.mixtape =
        state.mixtape ||
        {};

    state.mixtape.bodyColor =
        stringValue(
            "mixtapeBodyColor",
            state.mixtape.bodyColor);

    state.mixtape.labelColor =
        stringValue(
            "mixtapeLabelColor",
            state.mixtape.labelColor);

    state.mixtape.accentColor =
        stringValue(
            "mixtapeAccentColor",
            state.mixtape.accentColor);

    state.mixtape.textColor =
        stringValue(
            "mixtapeTextColor",
            state.mixtape.textColor);

    state.hiFiDeck =
        state.hiFiDeck ||
        {};

    state.hiFiDeck.chassisColor =
        stringValue(
            "hiFiChassisColor",
            state.hiFiDeck.chassisColor);

    state.hiFiDeck.displayColor =
        stringValue(
            "hiFiDisplayColor",
            state.hiFiDeck.displayColor);

    state.hiFiDeck.accentColor =
        stringValue(
            "hiFiAccentColor",
            state.hiFiDeck.accentColor);

    state.hiFiDeck.textColor =
        stringValue(
            "hiFiTextColor",
            state.hiFiDeck.textColor);

    state.hiFiDeck.showAlbumArtwork =
        booleanValue(
            "hiFiShowArtwork",
            state.hiFiDeck.showAlbumArtwork);

    state.hiFiDeck.showAlbum =
        booleanValue(
            "hiFiShowAlbum",
            state.hiFiDeck.showAlbum);

    state.hiFiDeck.showTimeRemaining =
        booleanValue(
            "hiFiShowTimeRemaining",
            state.hiFiDeck.showTimeRemaining);

    state.recordShelf =
        state.recordShelf ||
        {};

    state.recordShelf.shelfColor =
        stringValue(
            "recordShelfShelfColor",
            state.recordShelf.shelfColor);

    state.recordShelf.cardColor =
        stringValue(
            "recordShelfCardColor",
            state.recordShelf.cardColor);

    state.recordShelf.accentColor =
        stringValue(
            "recordShelfAccentColor",
            state.recordShelf.accentColor);

    state.recordShelf.textColor =
        stringValue(
            "recordShelfTextColor",
            state.recordShelf.textColor);

    state.recordShelf.showAlbum =
        booleanValue(
            "recordShelfShowAlbum",
            state.recordShelf.showAlbum);

    state.recordShelf.showTimeRemaining =
        booleanValue(
            "recordShelfShowTimeRemaining",
            state.recordShelf.showTimeRemaining);

    state.playback =
        state.playback ||
        {};

    if (!state.playback.title)
    {
        state.playback.state =
            "Playing";

        state.playback.title =
            "Midnight Drive";

        state.playback.artist =
            "The Old FARKs";

        state.playback.album =
            "Live Preview Sessions";

        state.playback.durationSeconds =
            245;

        state.playback.positionSeconds =
            96;

        state.playback.trackStartedAtUtc =
            "preview-track";

        state.playback.updatedAtUtc =
            new Date().toISOString();

        state.playback.artistArtworkUrl =
            "";

        state.playback.albumArtworkUrl =
            "";
    }

    state.visible =
        state.enabled !== false &&
        Boolean(
            state.playback.title);

    return state;
}


function getDisplayTrackKey(
    state)
{
    const playback =
        state.playback ||
        {};

    return [
        playback.trackStartedAtUtc || "",
        playback.title || "",
        playback.artist || "",
        playback.album || ""
    ].join("|");
}


function applyDisplayVisibility(
    state)
{
    if (displayHideTimer !== null)
    {
        clearTimeout(
            displayHideTimer);

        displayHideTimer =
            null;
    }

    const baseVisible =
        state.visible === true;

    if (!baseVisible)
    {
        lastBaseVisible =
            false;

        card.classList.remove(
            "visible");

        return;
    }

    if (isPreview)
    {
        card.classList.add(
            "visible");

        return;
    }

    const duration =
        Math.max(
            0,
            Number(
                state.displayDurationSeconds ||
                0));

    const trackKey =
        getDisplayTrackKey(
            state);

    const now =
        performance.now();

    const trackChanged =
        trackKey !==
        displayedTrackKey;

    const durationChanged =
        lastDisplayDurationSeconds === null ||
        duration !==
        lastDisplayDurationSeconds;

    const becameVisible =
        !lastBaseVisible;

    if (
        trackChanged ||
        durationChanged ||
        becameVisible)
    {
        displayedTrackKey =
            trackKey;

        displayStartedAt =
            now;
    }

    lastDisplayDurationSeconds =
        duration;

    lastBaseVisible =
        true;

    if (duration === 0)
    {
        card.classList.add(
            "visible");

        return;
    }

    const elapsedMilliseconds =
        now -
        displayStartedAt;

    const remainingMilliseconds =
        duration * 1000 -
        elapsedMilliseconds;

    if (remainingMilliseconds <= 0)
    {
        card.classList.remove(
            "visible");

        return;
    }

    card.classList.add(
        "visible");

    displayHideTimer =
        setTimeout(
            () =>
            {
                card.classList.remove(
                    "visible");

                displayHideTimer =
                    null;
            },
            remainingMilliseconds);
}


function normaliseWidgetLayout(
    value)
{
    const normalised =
        String(
            value ||
            "Classic")
            .trim()
            .toLowerCase();

    if (normalised ===
        "compactreveal")
    {
        return "CompactReveal";
    }

    if (normalised ===
        "vinylplayer")
    {
        return "VinylPlayer";
    }

    if (normalised ===
        "mixtape")
    {
        return "Mixtape";
    }

    if (normalised ===
        "hifideck")
    {
        return "HiFiDeck";
    }

    if (normalised === "waveformstrip") return "WaveformStrip";

    if (normalised === "equalisertower") return "EqualiserTower";

    if (normalised === "splitpanelduo")
    {
        return "SplitPanelDuo";
    }

    if (normalised === "spectrumring")
    {
        return "SpectrumRing";
    }

    if (normalised === "turntableminimal")
    {
        return "TurntableMinimal";
    }

    // OMSC_STAGE6E_MARKER
    // Legacy RecordShelf routes to Turntable Minimal.
    if (normalised ===
        "recordshelf")
    {
        return "TurntableMinimal";
    }

    return "Classic";
}


function getCompactRevealSettings(
    state)
{
    const source =
        state.compactReveal ||
        {};

    return {
        revealDurationSeconds:
            Math.max(
                0,
                Math.min(
                    120,
                    Number(
                        source.revealDurationSeconds ??
                        15))),

        animationDurationMilliseconds:
            Math.max(
                150,
                Math.min(
                    1200,
                    Number(
                        source.animationDurationMilliseconds ??
                        450))),

        artworkSizePixels:
            180,

        panelWidthPixels:
            470,

        backgroundColor:
            source.backgroundColor ||
            "#241A36",

        backgroundOpacityPercent:
            Math.max(
                0,
                Math.min(
                    100,
                    Number(
                        source.backgroundOpacityPercent ??
                        92))),

        textColor:
            source.textColor ||
            "#FFFFFF",

        artistFontSize:
            Math.max(
                8,
                Math.min(
                    36,
                    Number(
                        source.artistFontSize ??
                        24))),

        trackFontSize:
            Math.max(
                8,
                Math.min(
                    36,
                    Number(
                        source.trackFontSize ??
                        20))),

        progressRingColor:
            source.progressRingColor ||
            "#76FF21",

        progressRingThicknessPixels:
            Math.max(
                2,
                Math.min(
                    12,
                    Number(
                        source.progressRingThicknessPixels ??
                        6)))
    };
}


function getMixtapeSettings(
    state)
{
    const source =
        state.mixtape ||
        {};

    return {
        bodyColor:
            source.bodyColor ||
            "#C8B58A",

        labelColor:
            source.labelColor ||
            "#F4ECD8",

        accentColor:
            source.accentColor ||
            "#76FF21",

        textColor:
            source.textColor ||
            "#241A36"
    };
}


function getHiFiDeckSettings(
    state)
{
    const source =
        state.hiFiDeck ||
        {};

    return {
        chassisColor:
            source.chassisColor ||
            "#181B20",

        displayColor:
            source.displayColor ||
            "#76FF21",

        accentColor:
            source.accentColor ||
            "#76FF21",

        textColor:
            source.textColor ||
            "#EAFBE5",

        showAlbumArtwork:
            source.showAlbumArtwork !== false,

        showAlbum:
            source.showAlbum !== false,

        showTimeRemaining:
            source.showTimeRemaining !== false
    };
}


function getRecordShelfSettings(
    state)
{
    const source =
        state.recordShelf ||
        {};

    return {
        shelfColor:
            source.shelfColor ||
            "#563723",

        cardColor:
            source.cardColor ||
            "#17191E",

        accentColor:
            source.accentColor ||
            "#76FF21",

        textColor:
            source.textColor ||
            "#FFFFFF",

        showAlbum:
            source.showAlbum !== false,

        showTimeRemaining:
            source.showTimeRemaining !== false
    };
}


function resetCompactRevealLayoutState()
{
    if (compactDrawerHideTimer !== null)
    {
        clearTimeout(
            compactDrawerHideTimer);

        compactDrawerHideTimer =
            null;
    }

    compactReveal.classList.remove(
        "visible",
        "expanded");

    compactDisplayedTrackKey =
        "";

    compactLastRevealDurationSeconds =
        null;

    compactLastBaseVisible =
        false;
}


function applyCompactRevealVisibility(
    state,
    settings)
{
    if (compactDrawerHideTimer !== null)
    {
        clearTimeout(
            compactDrawerHideTimer);

        compactDrawerHideTimer =
            null;
    }

    const baseVisible =
        state.visible === true;

    if (!baseVisible)
    {
        compactLastBaseVisible =
            false;

        compactReveal.classList.remove(
            "visible",
            "expanded");

        return;
    }

    compactReveal.classList.add(
        "visible");

    if (isPreview)
    {
        compactReveal.classList.add(
            "expanded");

        return;
    }

    const duration =
        settings.revealDurationSeconds;

    const trackKey =
        getDisplayTrackKey(
            state);

    const now =
        performance.now();

    const trackChanged =
        trackKey !==
        compactDisplayedTrackKey;

    const durationChanged =
        compactLastRevealDurationSeconds === null ||
        duration !==
        compactLastRevealDurationSeconds;

    const becameVisible =
        !compactLastBaseVisible;

    if (
        trackChanged ||
        durationChanged ||
        becameVisible)
    {
        compactDisplayedTrackKey =
            trackKey;

        compactRevealStartedAt =
            now;
    }

    compactLastRevealDurationSeconds =
        duration;

    compactLastBaseVisible =
        true;

    if (duration === 0)
    {
        compactReveal.classList.add(
            "expanded");

        return;
    }

    const elapsedMilliseconds =
        now -
        compactRevealStartedAt;

    const remainingMilliseconds =
        duration * 1000 -
        elapsedMilliseconds;

    if (remainingMilliseconds <= 0)
    {
        compactReveal.classList.remove(
            "expanded");

        return;
    }

    compactReveal.classList.add(
        "expanded");

    compactDrawerHideTimer =
        setTimeout(
            () =>
            {
                compactReveal.classList.remove(
                    "expanded");

                compactDrawerHideTimer =
                    null;
            },
            remainingMilliseconds);
}


function applyCompactRevealState(
    state)
{
    const settings =
        getCompactRevealSettings(
            state);

    const artworkSize =
        settings.artworkSizePixels;

    const drawerHeight =
        artworkSize;

    compactReveal.style.setProperty(
        "--compact-artwork-size",
        `${artworkSize}px`);

    compactReveal.style.setProperty(
        "--compact-panel-width",
        `${settings.panelWidthPixels}px`);

    compactReveal.style.setProperty(
        "--compact-drawer-height",
        `${drawerHeight}px`);

    compactReveal.style.setProperty(
        "--compact-animation-duration",
        `${settings.animationDurationMilliseconds}ms`);

    compactArtworkShell.style.width =
        `${artworkSize}px`;

    compactArtworkShell.style.height =
        `${artworkSize}px`;

    compactDrawerClip.style.width =
        `${settings.panelWidthPixels}px`;

    compactDrawerClip.style.height =
        `${drawerHeight}px`;

    compactDrawerClip.style.marginLeft =
        `${-(artworkSize / 2)}px`;

    compactDrawer.style.height =
        `${drawerHeight}px`;

    compactDrawer.style.paddingLeft =
        `${(artworkSize / 2) + 24}px`;

    const background =
        hexToRgb(
            settings.backgroundColor);

    compactDrawer.style.backgroundColor =
        `rgba(${background.r}, ${background.g}, ${background.b}, ${settings.backgroundOpacityPercent / 100})`;

    compactDrawer.style.color =
        settings.textColor;

    compactArtistName.style.fontSize =
        `${settings.artistFontSize}px`;

    compactTrackName.style.fontSize =
        `${settings.trackFontSize}px`;

    compactProgressTrack.style.strokeWidth =
        String(
            settings.progressRingThicknessPixels);

    compactProgressPlayed.style.strokeWidth =
        String(
            settings.progressRingThicknessPixels);

    compactProgressPlayed.style.stroke =
        settings.progressRingColor;

    const playback =
        state.playback ||
        {};

    compactArtistName.textContent =
        playback.artist ||
        "";

    compactTrackName.textContent =
        playback.title ||
        "";

    if (playback.artistArtworkUrl)
    {
        compactArtworkFallback.style.display =
            "none";

        compactArtistImage.style.display =
            "block";

        if (
            compactArtistImage.src !==
            playback.artistArtworkUrl)
        {
            compactArtistImage.src =
                playback.artistArtworkUrl;
        }
    }
    else
    {
        compactArtistImage.style.display =
            "none";

        compactArtistImage.removeAttribute(
            "src");

        compactArtworkFallback.style.display =
            "flex";
    }

    applyCompactRevealVisibility(
        state,
        settings);
}


function getVinylPlayerSettings(
    state)
{
    const source =
        state.vinylPlayer ||
        {};

    return {
        sleeveSizePixels:
            Math.max(
                100,
                Math.min(
                    160,
                    Number(
                        source.sleeveSizePixels ??
                        160))),

        vinylExposurePixels:
            Math.max(
                30,
                Math.min(
                    90,
                    Number(
                        source.vinylExposurePixels ??
                        80))),

        rotationRpm:
            Math.max(
                20,
                Math.min(
                    60,
                    Number(
                        source.rotationRpm ??
                        33))),

        accentColor:
            source.accentColor ||
            "#76FF21",

        panelColor:
            source.panelColor ||
            "#241A36",

        panelOpacityPercent:
            Math.max(
                0,
                Math.min(
                    100,
                    Number(
                        source.panelOpacityPercent ??
                        92))),

        textColor:
            source.textColor ||
            "#FFFFFF",

        artistFontSize:
            Math.max(
                8,
                Math.min(
                    36,
                    Number(
                        source.artistFontSize ??
                        22))),

        trackFontSize:
            Math.max(
                8,
                Math.min(
                    36,
                    Number(
                        source.trackFontSize ??
                        18))),

        showAlbum:
            source.showAlbum !== false,

        showTimeRemaining:
            source.showTimeRemaining !== false
    };
}


function resetVinylPlayerLayoutState()
{
    vinylPlayer.classList.remove(
        "visible",
        "is-paused");
}


function applyVinylPlayerState(
    state)
{
    const settings =
        getVinylPlayerSettings(
            state);

    vinylPlayer.style.setProperty(
        "--vinyl-sleeve-size",
        `${settings.sleeveSizePixels}px`);

    vinylPlayer.style.setProperty(
        "--vinyl-exposure",
        `${settings.vinylExposurePixels}px`);

    updateVinylProgressArc(
        settings.sleeveSizePixels,
        settings.vinylExposurePixels);

    vinylPlayer.style.setProperty(
        "--vinyl-rotation-duration",
        `${(60 / settings.rotationRpm).toFixed(3)}s`);

    vinylPlayer.style.setProperty(
        "--vinyl-accent",
        settings.accentColor);

    const panelBackground =
        hexToRgb(
            settings.panelColor);

    vinylInfoPanel.style.backgroundColor =
        `rgba(${panelBackground.r}, ${panelBackground.g}, ${panelBackground.b}, ${settings.panelOpacityPercent / 100})`;

    vinylInfoPanel.style.color =
        settings.textColor;

    vinylArtistName.style.fontSize =
        `${settings.artistFontSize}px`;

    vinylTrackName.style.fontSize =
        `${settings.trackFontSize}px`;

    vinylProgressPlayed.style.stroke =
        settings.accentColor;

    const playback =
        state.playback ||
        {};

    vinylArtistName.textContent =
        playback.artist ||
        "";

    vinylTrackName.textContent =
        playback.title ||
        "";

    vinylAlbumName.textContent =
        playback.album ||
        "";

    vinylAlbumName.classList.toggle(
        "hidden",
        !settings.showAlbum ||
        !playback.album);

    vinylTimeRemaining.classList.toggle(
        "hidden",
        !settings.showTimeRemaining);

    if (playback.artistArtworkUrl)
    {
        vinylArtworkFallback.style.display =
            "none";

        vinylArtistImage.style.display =
            "block";

        if (
            vinylArtistImage.src !==
            playback.artistArtworkUrl)
        {
            vinylArtistImage.src =
                playback.artistArtworkUrl;
        }
    }
    else
    {
        vinylArtistImage.style.display =
            "none";

        vinylArtistImage.removeAttribute(
            "src");

        vinylArtworkFallback.style.display =
            "flex";
    }

    const playing =
        String(
            playback.state ||
            "")
            .toLowerCase() ===
        "playing";

    vinylPlayer.classList.toggle(
        "is-paused",
        !playing);

    vinylPlayer.classList.toggle(
        "visible",
        state.visible === true);
}


function clampPosition(
    position,
    duration)
{
    let result =
        Math.max(
            0,
            Number(
                position ||
                0));

    if (duration > 0)
    {
        result =
            Math.min(
                duration,
                result);
    }

    return result;
}


function getAnchoredPositionSeconds(
    duration,
    now = performance.now())
{
    let position =
        progressAnchorPositionSeconds;

    if (progressPlaybackState ===
        "playing")
    {
        position +=
            (
                now -
                progressAnchorAt
            ) /
            1000;
    }

    return clampPosition(
        position,
        duration);
}


function reconcilePlaybackSnapshot(
    state)
{
    const playback =
        state.playback ||
        {};

    const now =
        performance.now();

    const duration =
        Math.max(
            0,
            Number(
                playback.durationSeconds ||
                0));

    const incomingPosition =
        clampPosition(
            Number(
                playback.positionSeconds ||
                0),
            duration);

    const incomingState =
        String(
            playback.state ||
            "stopped")
            .toLowerCase();

    const incomingTrackKey =
        getDisplayTrackKey(
            state);

    const incomingUpdatedAt =
        String(
            playback.updatedAtUtc ||
            "");

    const firstSnapshot =
        !progressTrackKey;

    const trackChanged =
        incomingTrackKey !==
        progressTrackKey;

    const stateChanged =
        incomingState !==
        progressPlaybackState;

    const snapshotChanged =
        incomingUpdatedAt !==
        progressSnapshotUpdatedAt;

    if (firstSnapshot ||
        trackChanged)
    {
        progressAnchorPositionSeconds =
            incomingPosition;

        progressAnchorAt =
            now;

        progressTrackKey =
            incomingTrackKey;

        progressPlaybackState =
            incomingState;

        progressSnapshotUpdatedAt =
            incomingUpdatedAt;

        return;
    }

    if (!snapshotChanged &&
        !stateChanged)
    {
        return;
    }

    const projectedPosition =
        getAnchoredPositionSeconds(
            duration,
            now);

    let acceptedPosition =
        incomingPosition;

    const backwardsCorrection =
        projectedPosition -
        incomingPosition;

    if (!stateChanged &&
        incomingState ===
            "playing" &&
        backwardsCorrection > 0 &&
        backwardsCorrection <=
            SMALL_BACKWARD_CORRECTION_SECONDS)
    {
        acceptedPosition =
            projectedPosition;
    }

    progressAnchorPositionSeconds =
        acceptedPosition;

    progressAnchorAt =
        now;

    progressTrackKey =
        incomingTrackKey;

    progressPlaybackState =
        incomingState;

    progressSnapshotUpdatedAt =
        incomingUpdatedAt;
}


function getCurrentPositionSeconds()
{
    if (!latestState)
    {
        return 0;
    }

    const playback =
        latestState.playback ||
        {};

    const duration =
        Math.max(
            0,
            Number(
                playback.durationSeconds ||
                0));

    return getAnchoredPositionSeconds(
        duration);
}


function resetMixtapeLayoutState()
{
    if (mixtapeChangeTimer !== null)
    {
        clearTimeout(
            mixtapeChangeTimer);

        mixtapeChangeTimer =
            null;
    }

    mixtapePlayer.classList.remove(
        "visible",
        "is-paused",
        "changing");

    mixtapeDisplayedTrackKey =
        "";
}


function updateMixtapeProgress(
    percentage)
{
    const safePercentage =
        Math.max(
            0,
            Math.min(
                100,
                Number(
                    percentage ||
                    0)));

    const progress =
        safePercentage /
        100;

    const leftScale =
        1.14 -
        (
            0.30 *
            progress
        );

    const rightScale =
        0.84 +
        (
            0.30 *
            progress
        );

    mixtapePlayer.style.setProperty(
        "--mixtape-left-scale",
        leftScale.toFixed(
            3));

    mixtapePlayer.style.setProperty(
        "--mixtape-right-scale",
        rightScale.toFixed(
            3));

    mixtapeProgressPlayed.style.width =
        `${safePercentage}%`;
}


function applyMixtapeState(
    state)
{
    const settings =
        getMixtapeSettings(
            state);

    mixtapePlayer.style.setProperty(
        "--mixtape-body",
        settings.bodyColor);

    mixtapePlayer.style.setProperty(
        "--mixtape-label",
        settings.labelColor);

    mixtapePlayer.style.setProperty(
        "--mixtape-accent",
        settings.accentColor);

    mixtapePlayer.style.setProperty(
        "--mixtape-text",
        settings.textColor);

    const playback =
        state.playback ||
        {};

    const nextTrackKey =
        getDisplayTrackKey(
            state);

    if (
        mixtapeDisplayedTrackKey &&
        nextTrackKey &&
        nextTrackKey !==
            mixtapeDisplayedTrackKey)
    {
        mixtapePlayer.classList.remove(
            "changing");

        void mixtapePlayer.offsetWidth;

        mixtapePlayer.classList.add(
            "changing");

        if (mixtapeChangeTimer !== null)
        {
            clearTimeout(
                mixtapeChangeTimer);
        }

        mixtapeChangeTimer =
            setTimeout(
                () =>
                {
                    mixtapePlayer.classList.remove(
                        "changing");

                    mixtapeChangeTimer =
                        null;
                },
                340);
    }

    if (nextTrackKey)
    {
        mixtapeDisplayedTrackKey =
            nextTrackKey;
    }

    mixtapeArtistName.textContent =
        playback.artist ||
        "";

    mixtapeTrackName.textContent =
        playback.title ||
        "";

    mixtapeAlbumName.textContent =
        playback.album ||
        "";

    if (playback.albumArtworkUrl)
    {
        mixtapeArtworkFallback.style.display =
            "none";

        mixtapeAlbumImage.style.display =
            "block";

        if (
            mixtapeAlbumImage.src !==
            playback.albumArtworkUrl)
        {
            mixtapeAlbumImage.src =
                playback.albumArtworkUrl;
        }
    }
    else
    {
        mixtapeAlbumImage.style.display =
            "none";

        mixtapeAlbumImage.removeAttribute(
            "src");

        mixtapeArtworkFallback.style.display =
            "flex";
    }

    const playing =
        String(
            playback.state ||
            "")
            .toLowerCase() ===
        "playing";

    mixtapePlayer.classList.toggle(
        "is-paused",
        !playing);

    mixtapePlayer.classList.toggle(
        "visible",
        state.visible === true);
}


function resetHiFiDeckLayoutState()
{
    if (hiFiChangeTimer !== null)
    {
        clearTimeout(
            hiFiChangeTimer);

        hiFiChangeTimer =
            null;
    }

    hiFiDeck.classList.remove(
        "visible",
        "is-paused",
        "changing",
        "artwork-off");

    hiFiDisplayedTrackKey =
        "";
}


function updateHiFiProgress(
    percentage)
{
    const safePercentage =
        Math.max(
            0,
            Math.min(
                100,
                Number(
                    percentage ||
                    0)));

    hiFiProgressPlayed.style.width =
        `${safePercentage}%`;
}


function applyHiFiDeckState(
    state)
{
    const settings =
        getHiFiDeckSettings(
            state);

    hiFiDeck.style.setProperty(
        "--hi-fi-chassis",
        settings.chassisColor);

    hiFiDeck.style.setProperty(
        "--hi-fi-display",
        settings.displayColor);

    hiFiDeck.style.setProperty(
        "--hi-fi-accent",
        settings.accentColor);

    hiFiDeck.style.setProperty(
        "--hi-fi-text",
        settings.textColor);

    const playback =
        state.playback ||
        {};

    const trackKey =
        getDisplayTrackKey(
            state);

    if (
        hiFiDisplayedTrackKey &&
        trackKey &&
        trackKey !==
            hiFiDisplayedTrackKey)
    {
        hiFiDeck.classList.remove(
            "changing");

        void hiFiDeck.offsetWidth;

        hiFiDeck.classList.add(
            "changing");

        if (hiFiChangeTimer !== null)
        {
            clearTimeout(
                hiFiChangeTimer);
        }

        hiFiChangeTimer =
            setTimeout(
                () =>
                {
                    hiFiDeck.classList.remove(
                        "changing");

                    hiFiChangeTimer =
                        null;
                },
                280);
    }

    if (trackKey)
    {
        hiFiDisplayedTrackKey =
            trackKey;
    }

    hiFiArtistName.textContent =
        playback.artist ||
        "";

    hiFiTrackName.textContent =
        playback.title ||
        "";

    hiFiAlbumName.textContent =
        playback.album ||
        "";

    hiFiAlbumName.classList.toggle(
        "hidden",
        !settings.showAlbum ||
        !playback.album);

    hiFiTimeRemaining.classList.toggle(
        "hidden",
        !settings.showTimeRemaining);

    hiFiDeck.classList.toggle(
        "artwork-off",
        !settings.showAlbumArtwork);

    if (
        settings.showAlbumArtwork &&
        playback.albumArtworkUrl)
    {
        hiFiArtworkFallback.style.display =
            "none";

        hiFiAlbumImage.style.display =
            "block";

        if (
            hiFiAlbumImage.src !==
            playback.albumArtworkUrl)
        {
            hiFiAlbumImage.src =
                playback.albumArtworkUrl;
        }
    }
    else
    {
        hiFiAlbumImage.style.display =
            "none";

        hiFiAlbumImage.removeAttribute(
            "src");

        hiFiArtworkFallback.style.display =
            settings.showAlbumArtwork
                ? "flex"
                : "none";
    }

    const playbackState =
        String(
            playback.state ||
            "")
            .toLowerCase();

    const playing =
        playbackState ===
        "playing";

    hiFiDeck.classList.toggle(
        "is-paused",
        !playing);

    hiFiPlayState.textContent =
        playing
            ? "PLAY"
            : playbackState === "paused"
                ? "PAUSE"
                : "STOP";

    hiFiStatus.textContent =
        playing
            ? "SIGNAL LOCK"
            : playbackState === "paused"
                ? "HOLD"
                : "STANDBY";

    hiFiDeck.classList.toggle(
        "visible",
        state.visible === true);
}


function resetRecordShelfLayoutState()
{
    if (recordShelfChangeTimer !== null)
    {
        clearTimeout(
            recordShelfChangeTimer);

        recordShelfChangeTimer =
            null;
    }

    recordShelf.classList.remove(
        "visible",
        "is-paused",
        "changing");

    recordShelfDisplayedTrackKey =
        "";
}


function updateRecordShelfProgress(
    percentage)
{
    const safePercentage =
        Math.max(
            0,
            Math.min(
                100,
                Number(
                    percentage ||
                    0)));

    recordShelfProgressPlayed.style.width =
        `${safePercentage}%`;
}


function applyRecordShelfState(
    state)
{
    const settings =
        getRecordShelfSettings(
            state);

    recordShelf.style.setProperty(
        "--record-shelf-wood",
        settings.shelfColor);

    recordShelf.style.setProperty(
        "--record-shelf-card",
        settings.cardColor);

    recordShelf.style.setProperty(
        "--record-shelf-accent",
        settings.accentColor);

    recordShelf.style.setProperty(
        "--record-shelf-text",
        settings.textColor);

    const playback =
        state.playback ||
        {};

    const trackKey =
        getDisplayTrackKey(
            state);

    if (
        recordShelfDisplayedTrackKey &&
        trackKey &&
        trackKey !==
            recordShelfDisplayedTrackKey)
    {
        recordShelf.classList.remove(
            "changing");

        void recordShelf.offsetWidth;

        recordShelf.classList.add(
            "changing");

        if (recordShelfChangeTimer !== null)
        {
            clearTimeout(
                recordShelfChangeTimer);
        }

        recordShelfChangeTimer =
            setTimeout(
                () =>
                {
                    recordShelf.classList.remove(
                        "changing");

                    recordShelfChangeTimer =
                        null;
                },
                360);
    }

    if (trackKey)
    {
        recordShelfDisplayedTrackKey =
            trackKey;
    }

    recordShelfTrackName.textContent =
        playback.title ||
        "";

    recordShelfArtistName.textContent =
        playback.artist ||
        "";

    recordShelfAlbumName.textContent =
        playback.album ||
        "";

    recordShelfAlbumName.classList.toggle(
        "hidden",
        !settings.showAlbum ||
        !playback.album);

    recordShelfTimeRemaining.classList.toggle(
        "hidden",
        !settings.showTimeRemaining);

    if (playback.albumArtworkUrl)
    {
        recordShelfArtworkFallback.style.display =
            "none";

        recordShelfAlbumImage.style.display =
            "block";

        if (
            recordShelfAlbumImage.src !==
            playback.albumArtworkUrl)
        {
            recordShelfAlbumImage.src =
                playback.albumArtworkUrl;
        }
    }
    else
    {
        recordShelfAlbumImage.style.display =
            "none";

        recordShelfAlbumImage.removeAttribute(
            "src");

        recordShelfArtworkFallback.style.display =
            "flex";
    }

    const playbackState =
        String(
            playback.state ||
            "")
            .toLowerCase();

    recordShelf.classList.toggle(
        "is-paused",
        playbackState !==
            "playing");

    recordShelf.classList.toggle(
        "visible",
        state.visible === true);
}


function applyState(
    state)
{
    reconcilePlaybackSnapshot(
        state);

    latestState =
        state;


    applyBackground(
        state);


    card.style.color =
        state.textColor ||
        "#FFFFFF";


    artistName.style.fontSize =
        `${Number(
            state.artistFontSize ??
            24)}px`;

    trackName.style.fontSize =
        `${Number(
            state.trackFontSize ??
            20)}px`;


    const imageClass =
        getImageClass(
            state.artistImagePosition);

    content.className =
        `widget-content ${imageClass}`;


    const labelClass =
        getLabelClass(
            state.nowPlayingLabelPosition,
            imageClass);

    const watermarkPositionClass =
        getWatermarkPositionClass(
            labelClass);

    watermark.classList.remove(
        "watermark-left",
        "watermark-right");

    watermark.classList.add(
        watermarkPositionClass);

    label.className =
        `now-playing-label ${labelClass}`;

    card.classList.toggle(
        "label-off",
        labelClass ===
            "label-off");


    const watermarkStyle =
        "embossed";

    watermark.className =
        `watermark ${watermarkStyle} ${watermarkPositionClass}`;

    watermark.style.color =
        getWatermarkColour(
            state.backgroundColor,
            watermarkStyle);


    applyProgressStyle(
        state);


    const playback =
        state.playback ||
        {};

    artistName.textContent =
        playback.artist ||
        "";

    trackName.textContent =
        playback.title ||
        "";


    if (
        imageClass === "image-off" ||
        !playback.artistArtworkUrl)
    {
        artistImageContainer.style.display =
            "none";

        artistImage.removeAttribute(
            "src");
    }
    else
    {
        artistImageContainer.style.display =
            "";

        if (
            artistImage.src !==
            playback.artistArtworkUrl)
        {
            artistImage.src =
                playback.artistArtworkUrl;
        }
    }


    const layout =
        normaliseWidgetLayout(
            state.layout);

    const compactRevealActive =
        layout ===
        "CompactReveal";

    const vinylPlayerActive =
        layout ===
        "VinylPlayer";

    const mixtapeActive =
        layout ===
        "Mixtape";

    const hiFiDeckActive =
        layout ===
        "HiFiDeck";

    const recordShelfActive =
        layout ===
        "RecordShelf";

    const alternateLayoutActive =
        compactRevealActive ||
        vinylPlayerActive ||
        mixtapeActive ||
        hiFiDeckActive ||
        recordShelfActive ||
        layout === "SplitPanelDuo" ||
        layout === "SpectrumRing" ||
        layout === "TurntableMinimal" ||
        layout === "WaveformStrip" ||
        layout === "EqualiserTower";

    card.classList.toggle(
        "layout-inactive",
        alternateLayoutActive);

    compactReveal.classList.toggle(
        "layout-inactive",
        !compactRevealActive);

    vinylPlayer.classList.toggle(
        "layout-inactive",
        !vinylPlayerActive);

    mixtapePlayer.classList.toggle(
        "layout-inactive",
        !mixtapeActive);

    hiFiDeck.classList.toggle(
        "layout-inactive",
        !hiFiDeckActive);

    recordShelf.classList.toggle(
        "layout-inactive",
        !recordShelfActive);

    // OMSC_STAGE6B_MARKER
    window.OMSCSplitPanelDuo?.setActive(
        layout === "SplitPanelDuo",
        state
    );

    window.OMSCSpectrumRing?.setActive(
        layout === "SpectrumRing",
        state
    );

    window.OMSCTurntableMinimal?.setActive(
        layout === "TurntableMinimal",
        state
    );

    if (window.OMSCAudioVisualiserLayouts) {
        window.OMSCAudioVisualiserLayouts.apply(state);
    }

    if (layout === "WaveformStrip" ||
        layout === "EqualiserTower") {

        if (displayHideTimer !== null) {
            clearTimeout(displayHideTimer);
            displayHideTimer = null;
        }

        card.classList.remove("visible");
        compactReveal.classList.remove("visible", "expanded");
        vinylPlayer.classList.remove("visible");
        mixtapePlayer.classList.remove("visible");
        hiFiDeck.classList.remove("visible");
        recordShelf.classList.remove("visible");

        resetCompactRevealLayoutState();
        resetVinylPlayerLayoutState();
        resetMixtapeLayoutState();
        resetHiFiDeckLayoutState();
        resetRecordShelfLayoutState();

        return;
    }

    if (layout === "SplitPanelDuo")
    {
        if (displayHideTimer !== null)
        {
            clearTimeout(displayHideTimer);
            displayHideTimer = null;
        }
        card.classList.remove("visible");
        compactReveal.classList.remove("visible", "expanded");
        vinylPlayer.classList.remove("visible");
        mixtapePlayer.classList.remove("visible");
        hiFiDeck.classList.remove("visible");
        recordShelf.classList.remove("visible");
        lastBaseVisible = false;

        resetCompactRevealLayoutState();
        resetVinylPlayerLayoutState();
        resetMixtapeLayoutState();
        resetHiFiDeckLayoutState();
        resetRecordShelfLayoutState();
        return;
    }
    if (layout === "SpectrumRing")
    {
        if (displayHideTimer !== null)
        {
            clearTimeout(displayHideTimer);
            displayHideTimer = null;
        }

        card.classList.remove("visible");
        compactReveal.classList.remove("visible", "expanded");
        vinylPlayer.classList.remove("visible");
        mixtapePlayer.classList.remove("visible");
        hiFiDeck.classList.remove("visible");
        recordShelf.classList.remove("visible");
        lastBaseVisible = false;

        resetCompactRevealLayoutState();
        resetVinylPlayerLayoutState();
        resetMixtapeLayoutState();
        resetHiFiDeckLayoutState();
        resetRecordShelfLayoutState();

        return;
    }
    if (layout === "TurntableMinimal")
    {
        if (displayHideTimer !== null)
        {
            clearTimeout(displayHideTimer);
            displayHideTimer = null;
        }

        card.classList.remove("visible");
        lastBaseVisible = false;

        resetCompactRevealLayoutState();
        resetVinylPlayerLayoutState();
        resetMixtapeLayoutState();
        resetHiFiDeckLayoutState();
        resetRecordShelfLayoutState();

        return;
    }

    if (compactRevealActive)
    {
        if (displayHideTimer !== null)
        {
            clearTimeout(
                displayHideTimer);

            displayHideTimer =
                null;
        }

        card.classList.remove(
            "visible");

        lastBaseVisible =
            false;

        resetVinylPlayerLayoutState();
        resetMixtapeLayoutState();
        resetHiFiDeckLayoutState();
        resetRecordShelfLayoutState();

        applyCompactRevealState(
            state);

        return;
    }

    if (vinylPlayerActive)
    {
        if (displayHideTimer !== null)
        {
            clearTimeout(
                displayHideTimer);

            displayHideTimer =
                null;
        }

        card.classList.remove(
            "visible");

        lastBaseVisible =
            false;

        resetCompactRevealLayoutState();
        resetMixtapeLayoutState();
        resetHiFiDeckLayoutState();
        resetRecordShelfLayoutState();

        applyVinylPlayerState(
            state);

        return;
    }

    if (mixtapeActive)
    {
        if (displayHideTimer !== null)
        {
            clearTimeout(
                displayHideTimer);

            displayHideTimer =
                null;
        }

        card.classList.remove(
            "visible");

        lastBaseVisible =
            false;

        resetCompactRevealLayoutState();
        resetVinylPlayerLayoutState();
        resetHiFiDeckLayoutState();
        resetRecordShelfLayoutState();

        applyMixtapeState(
            state);

        return;
    }

    if (hiFiDeckActive)
    {
        if (displayHideTimer !== null)
        {
            clearTimeout(
                displayHideTimer);

            displayHideTimer =
                null;
        }

        card.classList.remove(
            "visible");

        lastBaseVisible =
            false;

        resetCompactRevealLayoutState();
        resetVinylPlayerLayoutState();
        resetMixtapeLayoutState();
        resetRecordShelfLayoutState();

        applyHiFiDeckState(
            state);

        return;
    }

    if (recordShelfActive)
    {
        if (displayHideTimer !== null)
        {
            clearTimeout(
                displayHideTimer);

            displayHideTimer =
                null;
        }

        card.classList.remove(
            "visible");

        lastBaseVisible =
            false;

        resetCompactRevealLayoutState();
        resetVinylPlayerLayoutState();
        resetMixtapeLayoutState();
        resetHiFiDeckLayoutState();

        applyRecordShelfState(
            state);

        return;
    }

    resetCompactRevealLayoutState();
    resetVinylPlayerLayoutState();
    resetMixtapeLayoutState();
    resetHiFiDeckLayoutState();
    resetRecordShelfLayoutState();

    applyDisplayVisibility(
        state);
}


function getCurrentPercentage()
{
    if (!latestState)
    {
        return 0;
    }

    const playback =
        latestState.playback ||
        {};

    const duration =
        Number(
            playback.durationSeconds ||
            0);

    if (duration <= 0)
    {
        return 0;
    }

    return (
        getCurrentPositionSeconds() /
        duration
    ) * 100;
}


function updateProgress()
{
    const percentage =
        getCurrentPercentage();

    waveClipRect.setAttribute(
        "width",
        String(
            percentage * 10));

    straightPlayed.style.width =
        `${percentage}%`;

    const safePercentage =
        Math.max(
            0,
            Math.min(
                100,
                percentage));

    compactProgressPlayed.style.strokeDashoffset =
        String(
            COMPACT_RING_CIRCUMFERENCE *
            (
                1 -
                safePercentage /
                100
            ));

    updateVinylPlayedProgress(
        safePercentage);

    updateMixtapeProgress(
        safePercentage);

    updateHiFiProgress(
        safePercentage);

    updateRecordShelfProgress(
        safePercentage);

    window.OMSCSplitPanelDuo?.tick(
        safePercentage,
        latestState
    );

    window.OMSCSpectrumRing?.tick(
        safePercentage,
        latestState
    );

    window.OMSCTurntableMinimal?.tick(
        safePercentage,
        latestState
    );

    if (
        latestState &&
        normaliseWidgetLayout(
            latestState.layout) ===
            "VinylPlayer"
    )
    {
        const vinylSettings =
            getVinylPlayerSettings(
                latestState);

        const playback =
            latestState.playback ||
            {};

        const duration =
            Math.max(
                0,
                Number(
                    playback.durationSeconds ||
                    0));

        const showTime =
            vinylSettings.showTimeRemaining &&
            duration > 0;

        vinylTimeRemaining.classList.toggle(
            "hidden",
            !showTime);

        if (showTime)
        {
            vinylTimeRemaining.textContent =
                formatRemainingTime(
                    duration -
                    getCurrentPositionSeconds());
        }
    }

    if (
        latestState &&
        normaliseWidgetLayout(
            latestState.layout) ===
            "Mixtape"
    )
    {
        const playback =
            latestState.playback ||
            {};

        const duration =
            Math.max(
                0,
                Number(
                    playback.durationSeconds ||
                    0));

        mixtapeTimeRemaining.textContent =
            duration > 0
                ? formatRemainingTime(
                    duration -
                    getCurrentPositionSeconds())
                : "";
    }

    if (
        latestState &&
        normaliseWidgetLayout(
            latestState.layout) ===
            "HiFiDeck"
    )
    {
        const hiFiSettings =
            getHiFiDeckSettings(
                latestState);

        const playback =
            latestState.playback ||
            {};

        const duration =
            Math.max(
                0,
                Number(
                    playback.durationSeconds ||
                    0));

        const showTime =
            hiFiSettings.showTimeRemaining &&
            duration > 0;

        hiFiTimeRemaining.classList.toggle(
            "hidden",
            !showTime);

        if (showTime)
        {
            hiFiTimeRemaining.textContent =
                formatRemainingTime(
                    duration -
                    getCurrentPositionSeconds());
        }
    }

    if (
        latestState &&
        normaliseWidgetLayout(
            latestState.layout) ===
            "RecordShelf"
    )
    {
        const settings =
            getRecordShelfSettings(
                latestState);

        const playback =
            latestState.playback ||
            {};

        const duration =
            Math.max(
                0,
                Number(
                    playback.durationSeconds ||
                    0));

        const showTime =
            settings.showTimeRemaining &&
            duration > 0;

        recordShelfTimeRemaining.classList.toggle(
            "hidden",
            !showTime);

        if (showTime)
        {
            recordShelfTimeRemaining.textContent =
                formatRemainingTime(
                    duration -
                    getCurrentPositionSeconds());
        }
    }

    requestAnimationFrame(
        updateProgress);
}


function formatRemainingTime(
    seconds)
{
    const safeSeconds =
        Math.max(
            0,
            Math.ceil(
                seconds));

    const minutes =
        Math.floor(
            safeSeconds /
            60);

    const remainder =
        safeSeconds %
        60;

    return `-${minutes}:${String(
        remainder)
        .padStart(
            2,
            "0")}`;
}


function updateTimeRemaining()
{
    if (!latestState)
    {
        card.classList.remove(
            "time-remaining-visible");

        requestAnimationFrame(
            updateTimeRemaining);

        return;
    }

    const progressStyle =
        String(
            latestState.progressStyle ||
            "Wave")
            .toLowerCase();

    const playback =
        latestState.playback ||
        {};

    const duration =
        Number(
            playback.durationSeconds ||
            0);

    const showTimer =
        latestState.showTimeRemaining !== false &&
        progressStyle !== "off" &&
        duration > 0;

    card.classList.toggle(
        "time-remaining-visible",
        showTimer);

    if (!showTimer)
    {
        requestAnimationFrame(
            updateTimeRemaining);

        return;
    }

    const position =
        getCurrentPositionSeconds();

    timeRemaining.textContent =
        formatRemainingTime(
            duration - position);

    requestAnimationFrame(
        updateTimeRemaining);
}


async function refreshWidget()
{
    try
    {
        const previewParams =
            new URLSearchParams(
                window.location.search);

        const previewLayout =
            String(
                previewParams.get("layout") ||
                "")
                .toLowerCase();

        const previewRequiresArtistArtwork =
            isPreview &&
            (
                previewLayout ===
                    "compactreveal" ||
                previewLayout ===
                    "vinylplayer"
            );

        const previewRequiresAlbumArtwork =
            isPreview &&
            (
                previewLayout ===
                    "splitpanelduo" ||
                previewLayout ===
                    "spectrumring" ||
                previewLayout ===
                    "turntableminimal" ||
                previewLayout ===
                    "mixtape" ||
                previewLayout ===
                    "hifideck" ||
                previewLayout ===
                    "recordshelf" ||
                previewLayout ===
                    "waveformstrip" ||
                previewLayout ===
                    "equalisertower"
            );

        let stateEndpoint =
            STATE_ENDPOINT;

        if (previewRequiresArtistArtwork)
        {
            stateEndpoint =
                `${STATE_ENDPOINT}?includeArtwork=1`;
        }
        else if (previewRequiresAlbumArtwork)
        {
            stateEndpoint =
                `${STATE_ENDPOINT}?includeAlbumArtwork=1`;
        }

        const response =
            await fetch(
                stateEndpoint,
                {
                    cache:
                        "no-store"
                });

        if (!response.ok)
        {
            throw new Error(
                `Widget state returned HTTP ${response.status}.`);
        }

        const state =
            applyPreviewOverrides(
                await response.json());

        applyState(
            state);
    }
    catch
    {
        window.OMSCSplitPanelDuo?.hide();
        window.OMSCSpectrumRing?.hide();
        window.OMSCTurntableMinimal?.hide();

        card.classList.remove(
            "visible");

        compactReveal.classList.remove(
            "visible",
            "expanded");

        vinylPlayer.classList.remove(
            "visible");

        mixtapePlayer.classList.remove(
            "visible");

        hiFiDeck.classList.remove(
            "visible");

        recordShelf.classList.remove(
            "visible");

        // OMSC_STAGE5E_MARKER
        window.OMSCAudioVisualiserLayouts?.apply({
            layout: "",
            visible: false
        });
    }
}


artistImage.addEventListener(
    "error",
    () =>
    {
        artistImageContainer.style.display =
            "none";
    });


compactArtistImage.addEventListener(
    "error",
    () =>
    {
        compactArtistImage.style.display =
            "none";

        compactArtworkFallback.style.display =
            "flex";
    });


vinylArtistImage.addEventListener(
    "error",
    () =>
    {
        vinylArtistImage.style.display =
            "none";

        vinylArtworkFallback.style.display =
            "flex";
    });


mixtapeAlbumImage.addEventListener(
    "error",
    () =>
    {
        mixtapeAlbumImage.style.display =
            "none";

        mixtapeArtworkFallback.style.display =
            "flex";
    });


hiFiAlbumImage.addEventListener(
    "error",
    () =>
    {
        hiFiAlbumImage.style.display =
            "none";

        hiFiArtworkFallback.style.display =
            "flex";
    });


recordShelfAlbumImage.addEventListener(
    "error",
    () =>
    {
        recordShelfAlbumImage.style.display =
            "none";

        recordShelfArtworkFallback.style.display =
            "flex";
    });


refreshWidget();

setInterval(
    refreshWidget,
    POLL_INTERVAL_MS);

requestAnimationFrame(
    updateProgress);

requestAnimationFrame(
    updateTimeRemaining);
