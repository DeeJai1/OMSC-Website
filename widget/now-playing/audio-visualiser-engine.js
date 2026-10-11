"use strict";

(function (root) {
    const BAR_COUNT = 48;
    const BAND_COUNT = 16;
    const SILENCE_HOLD_MS = 8000;

    function clamp(value) {
        const n = Number(value);
        return Number.isFinite(n)
            ? Math.max(0, Math.min(1, n))
            : 0;
    }

    function emptyFrame() {
        return {
            mode: "idle",
            rms: 0,
            waveform: new Array(BAR_COUNT).fill(0),
            spectrum: new Array(BAND_COUNT).fill(0)
        };
    }

    function hash(text) {
        let result = 2166136261;

        for (const char of String(text || "")) {
            result ^= char.charCodeAt(0);
            result = Math.imul(result, 16777619);
        }

        return result >>> 0;
    }

    function makeSimulation(trackKey, timeMs) {
        const seed = hash(trackKey);
        const t = timeMs / 1000;
        const frame = emptyFrame();
        frame.mode = "simulated";

        const beatSpeed = 1.6 + (seed % 80) / 100;
        const beat = Math.pow(
            Math.max(0, Math.sin(t * Math.PI * beatSpeed)),
            3
        );

        const movement = 0.45 + 0.55 * beat;

        frame.waveform = frame.waveform.map((_, i) => {
            const x = i / (BAR_COUNT - 1);
            const envelope = 0.35 +
                0.65 * Math.pow(Math.sin(Math.PI * x), 0.7);

            const a = Math.abs(
                Math.sin(t * 4.3 + i * 0.63 + seed * 0.001)
            );

            const b = Math.abs(
                Math.sin(t * 2.7 - i * 0.29 + seed * 0.003)
            );

            return clamp(
                envelope * movement * (0.18 + 0.47 * a + 0.27 * b)
            );
        });

        frame.spectrum = frame.spectrum.map((_, i) => {
            const lowFrequencyBias = Math.pow(
                1 - i / BAND_COUNT,
                0.65
            );

            const movementA = Math.abs(
                Math.sin(t * (2.1 + i * 0.07) + i * 0.9 + seed * 0.002)
            );

            const movementB = Math.abs(
                Math.cos(t * 3.7 - i * 0.43 + seed * 0.001)
            );

            return clamp(
                (0.12 + 0.55 * movementA + 0.22 * movementB) *
                (0.35 + 0.65 * lowFrequencyBias) *
                movement
            );
        });

        frame.rms = clamp(
            frame.waveform.reduce((a, b) => a + b, 0) / BAR_COUNT
        );

        return frame;
    }

    // Compress real audio's dynamic range; zero remains zero.
    function scaleRealLevel(value, exponent, gain) {
        const input = clamp(value);
        if (input <= 0.001) return 0;
        return clamp(Math.pow(input, exponent) * gain);
    }

    function normaliseRealFrame(analysis) {
        const frame = emptyFrame();
        frame.mode = "real";
        frame.rms = clamp(analysis.rms);

        frame.waveform = frame.waveform.map(
            (_, i) => scaleRealLevel(analysis.waveform?.[i], 0.72, 2.2)
        );

        frame.spectrum = frame.spectrum.map(
            (_, i) => scaleRealLevel(analysis.spectrum?.[i], 0.55, 2.4)
        );

        return frame;
    }

    function create() {
        let lastRealAudioAt = -Infinity;
        let lastMode = "idle";

        return {
            sample(options = {}) {
                const {
                    playing = false,
                    source = "unknown",
                    analysis = null,
                    trackKey = "",
                    timeMs = 0
                } = options;

                if (!playing) {
                    lastRealAudioAt = -Infinity;
                    lastMode = "idle";
                    return emptyFrame();
                }

                const now = Number.isFinite(Number(timeMs))
                    ? Number(timeMs)
                    : 0;

                // Only an explicitly confirmed desktop source may
                // consume process-loopback measurements.
                const desktop = source === "desktop";

                const available = desktop &&
                    analysis?.enabled === true &&
                    analysis?.status === "Capturing" &&
                    Number(analysis?.rootPid) > 0;

                const hasAudio = available &&
                    Number(analysis?.rms) > 0.001;

                if (hasAudio) {
                    lastRealAudioAt = now;
                }

                // Silence within an active desktop capture session
                // should remain silence, not become fake music.
                if (available &&
                    (hasAudio ||
                     (lastMode === "real" &&
                      now - lastRealAudioAt < SILENCE_HOLD_MS))) {
                    lastMode = "real";
                    return normaliseRealFrame(analysis);
                }

                lastMode = "simulated";
                return makeSimulation(trackKey, now);
            }
        };
    }

    const api = Object.freeze({
        create,
        makeSimulation,
        emptyFrame
    });

    root.OMSCAudioVisualiser = api;

    if (typeof module !== "undefined" && module.exports) {
        module.exports = api;
    }
})(typeof globalThis !== "undefined" ? globalThis : this);