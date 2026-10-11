(function () {
    "use strict";

    function createWavePath(
        width = 1000,
        centre = 20,
        amplitude = 9,
        wavelength = 72,
        step = 4) {

        const points =
            [];

        for (
            let x = 0;
            x <= width;
            x += step) {

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

    function createEcgPath(
        width = 1000,
        centre = 20,
        beatWidth = 120) {

        const points =
            [];

        const addPoint =
            (x, y) => {

                const safeX =
                    Math.max(
                        0,
                        Math.min(
                            width,
                            x));

                points.push(
                    `${safeX.toFixed(2)},${y.toFixed(2)}`);
            };

        for (
            let start = 0;
            start <= width;
            start += beatWidth) {

            addPoint(start, centre);
            addPoint(start + beatWidth * 0.28, centre);
            addPoint(start + beatWidth * 0.37, centre - 3);
            addPoint(start + beatWidth * 0.42, centre + 4);
            addPoint(start + beatWidth * 0.47, centre);
            addPoint(start + beatWidth * 0.54, centre);
            addPoint(start + beatWidth * 0.59, centre - 18);
            addPoint(start + beatWidth * 0.625, centre + 20);
            addPoint(start + beatWidth * 0.67, centre - 9);
            addPoint(start + beatWidth * 0.73, centre);
            addPoint(start + beatWidth, centre);
        }

        return `M ${points.join(" L ")}`;
    }

    function createPath(
        style) {

        const normalised =
            String(
                style ||
                "Wave")
                .trim()
                .toLowerCase();

        if (
            normalised === "ecg / pulse" ||
            normalised === "ecg" ||
            normalised === "pulse") {

            return createEcgPath();
        }

        return createWavePath();
    }

    window.OMSCProgressPaths =
        Object.freeze(
            {
                createWavePath,
                createEcgPath,
                createPath
            });
})();