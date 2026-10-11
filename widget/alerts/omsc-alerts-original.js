
        (() => {
            const stage =
                document.getElementById(
                    "alerts-stage");

            let activeSequence =
                null;

            let activeMedia =
                null;

            let cancelChromaRendering =
                null;

            let completionPending =
                false;

            let completionTimer =
                null;

            const defaultPresentation =
                {
                    mediaScalePercent:
                        100,

                    position:
                        "Center",

                    entranceAnimation:
                        "None",

                    showAlertName:
                        false,

                    captionColour:
                        "#FFFFFF"
                };

            function clearCompletionTimer() {
                if (completionTimer === null) {
                    return;
                }

                window.clearTimeout(
                    completionTimer);

                completionTimer =
                    null;
            }

            function stopActiveMedia() {
                clearCompletionTimer();

                if (cancelChromaRendering) {
                    cancelChromaRendering();
                    cancelChromaRendering = null;
                }

                if (activeMedia) {
                    try {
                        activeMedia.pause();
                    }
                    catch {
                    }

                    activeMedia =
                        null;
                }

                stage.replaceChildren();
            }

            function normalisePresentation(
                alerts) {

                const configuredScale =
                    Number(
                        alerts
                            ?.mediaScalePercent);

                const scale =
                    Number.isFinite(
                        configuredScale)
                        ? Math.min(
                            100,
                            Math.max(
                                25,
                                configuredScale))
                        : 100;

                const positions =
                    [
                        "Center",
                        "TopLeft",
                        "TopRight",
                        "BottomLeft",
                        "BottomRight"
                    ];

                const animations =
                    [
                        "None",
                        "Fade",
                        "Pop",
                        "SlideUp"
                    ];

                const captionColour =
                    String(
                        alerts
                            ?.captionColour
                        ?? "#FFFFFF")
                        .toUpperCase();

                return {
                    mediaScalePercent:
                        scale,

                    position:
                        positions.includes(
                            alerts?.position)
                            ? alerts.position
                            : "Center",

                    entranceAnimation:
                        animations.includes(
                            alerts?.entranceAnimation)
                            ? alerts.entranceAnimation
                            : "None",

                    showAlertName:
                        alerts?.showAlertName ===
                        true,

                    captionColour:
                        /^#[0-9A-F]{6}$/.test(
                            captionColour)
                            ? captionColour
                            : "#FFFFFF"
                };
            }

            async function getPresentationSettings() {
                try {
                    const response =
                        await fetch(
                            "/api/configuration/",
                            {
                                cache:
                                    "no-store"
                            });

                    if (!response.ok) {
                        return {
                            ...defaultPresentation
                        };
                    }

                    const configuration =
                        await response.json();

                    return normalisePresentation(
                        configuration
                            ?.settings
                            ?.alerts);
                }
                catch {
                    return {
                        ...defaultPresentation
                    };
                }
            }

            function getPositionClass(
                position) {

                switch (position) {

                    case "TopLeft":
                        return "position-top-left";

                    case "TopRight":
                        return "position-top-right";

                    case "BottomLeft":
                        return "position-bottom-left";

                    case "BottomRight":
                        return "position-bottom-right";

                    default:
                        return "position-center";
                }
            }

            function getAnimationClass(
                animation) {

                switch (animation) {

                    case "Fade":
                        return "animation-fade";

                    case "Pop":
                        return "animation-pop";

                    case "SlideUp":
                        return "animation-slide-up";

                    default:
                        return "";
                }
            }

            function startChromaRendering(video, container) {
                const canvas = document.createElement("canvas");
                canvas.className = "alert-chroma-canvas";
                container.appendChild(canvas);
                const context = canvas.getContext("2d", { willReadFrequently: true });
                if (!context) {
                    canvas.remove();
                    return;
                }

                video.style.display = "none";
                let stopped = false;
                let pending = null;
                let frameType = null;

                const render = () => {
                    pending = null;
                    if (stopped) return;
                    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
                        video.videoWidth > 0 && video.videoHeight > 0) {
                        try {
                            if (canvas.width !== video.videoWidth ||
                                canvas.height !== video.videoHeight) {
                                canvas.width = video.videoWidth;
                                canvas.height = video.videoHeight;
                            }
                            context.drawImage(video, 0, 0, canvas.width, canvas.height);
                            const frame = context.getImageData(0, 0, canvas.width, canvas.height);
                            const pixels = frame.data;
                            for (let i = 0; i < pixels.length; i += 4) {
                                const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
                                const dominance = g - Math.max(r, b);
                                if (g > 75 && dominance > 20) {
                                    pixels[i + 3] = Math.max(0, Math.min(255,
                                        Math.round(255 * (1 - (dominance - 20) / 65))));
                                }
                            }
                            context.putImageData(frame, 0, 0);
                        } catch {
                            // Preserve the alert if pixel readback is unavailable.
                            stopped = true;
                            canvas.remove();
                            video.style.display = "block";
                            return;
                        }
                    }
                    if (typeof video.requestVideoFrameCallback === "function") {
                        frameType = "video";
                        pending = video.requestVideoFrameCallback(render);
                    } else {
                        frameType = "animation";
                        pending = requestAnimationFrame(render);
                    }
                };
                render();
                cancelChromaRendering = () => {
                    stopped = true;
                    if (pending !== null) {
                        if (frameType === "video" &&
                            typeof video.cancelVideoFrameCallback === "function") {
                            video.cancelVideoFrameCallback(pending);
                        } else if (frameType === "animation") {
                            cancelAnimationFrame(pending);
                        }
                    }
                };
            }

            function createPresentation(
                item,
                settings,
                media) {

                const presentation =
                    document.createElement(
                        "div");

                presentation.className =
                    "alerts-presentation";

                presentation.classList.add(
                    getPositionClass(
                        settings.position));

                presentation.style.width =
                    `${settings.mediaScalePercent}%`;

                presentation.style.height =
                    `${settings.mediaScalePercent}%`;

                if (item.mediaType !== "video") {
                    presentation.classList.add(
                        "sound-only");
                }

                const inner =
                    document.createElement(
                        "div");

                inner.className =
                    "alerts-presentation-inner";

                const animationClass =
                    getAnimationClass(
                        settings
                            .entranceAnimation);

                if (animationClass) {
                    inner.classList.add(
                        animationClass);
                }

                if (
                    media &&
                    item.mediaType === "video"
                ) {
                    media.playsInline =
                        true;

                    inner.appendChild(media);
                    if (item.chromaKeyEnabled === true) {
                        startChromaRendering(media, inner);
                    }
                }

                if (settings.showAlertName) {

                    const caption =
                        document.createElement(
                            "div");

                    caption.className =
                        "alerts-caption";

                    caption.textContent =
                        item.name;

                    caption.style.color =
                        settings.captionColour;

                    inner.appendChild(
                        caption);
                }

                presentation.appendChild(
                    inner);

                return presentation;
            }

            async function complete(
                sequence) {

                if (
                    completionPending ||
                    activeSequence !== sequence
                ) {
                    return;
                }

                completionPending =
                    true;

                stopActiveMedia();

                try {
                    await fetch(
                        `/api/alerts/playback/complete/${sequence}`,
                        {
                            method:
                                "POST",

                            cache:
                                "no-store"
                        });
                }
                catch {
                }
                finally {
                    if (activeSequence === sequence) {
                        activeSequence =
                            null;
                    }

                    completionPending =
                        false;
                }
            }

            async function play(
                item) {

                if (
                    !item ||
                    activeSequence === item.sequence
                ) {
                    return;
                }

                stopActiveMedia();

                activeSequence =
                    item.sequence;

                completionPending =
                    false;

                const settings =
                    await getPresentationSettings();

                const media =
                    item.mediaType === "video"
                        ? document.createElement(
                            "video")
                        : new Audio();

                activeMedia =
                    media;

                media.src =
                    `${item.mediaUrl}?sequence=${item.sequence}`;

                media.preload =
                    "auto";

                media.autoplay =
                    true;

                media.volume =
                    Math.max(
                        0,
                        Math.min(
                            1,
                            Number(
                                item.volumePercent) /
                            100));

                if (
                    item.mediaType === "video" ||
                    settings.showAlertName
                ) {
                    stage.appendChild(
                        createPresentation(
                            item,
                            settings,
                            media));
                }

                media.addEventListener(
                    "ended",
                    () => {
                        complete(
                            item.sequence);
                    },
                    {
                        once:
                            true
                    });

                media.addEventListener(
                    "error",
                    () => {
                        complete(
                            item.sequence);
                    },
                    {
                        once:
                            true
                    });

                completionTimer =
                    window.setTimeout(
                        () => {
                            complete(
                                item.sequence);
                        },
                        (
                            Math.max(
                                1,
                                Number(
                                    item.durationSeconds)) +
                            3
                        ) *
                        1000);

                try {
                    await media.play();
                }
                catch {
                    await complete(
                        item.sequence);
                }
            }

            async function poll() {
                try {
                    const response =
                        await fetch(
                            "/api/alerts/playback/state",
                            {
                                cache:
                                    "no-store"
                            });

                    if (!response.ok) {
                        return;
                    }

                    const state =
                        await response.json();

                    if (
                        !state.active ||
                        !state.current
                    ) {
                        if (activeSequence !== null) {
                            stopActiveMedia();

                            activeSequence =
                                null;

                            completionPending =
                                false;
                        }

                        return;
                    }

                    await play(
                        state.current);
                }
                catch {
                }
            }

            poll();

            window.setInterval(
                poll,
                250);
        })();
    