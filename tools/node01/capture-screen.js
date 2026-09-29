/**
 * Final-live screenshot collector.
 *
 * PREPARED ONLY: not yet run on Node-01.
 * It requests screen-capture permission and writes one PNG plus metadata.
 */

(function () {
    var outputDir = files.join(files.cwd(), "evidence");
    files.ensureDir(outputDir);

    if (!images.requestScreenCapture()) {
        throw new Error("SCREEN_CAPTURE_PERMISSION_NOT_GRANTED");
    }

    var started = Date.now();
    var image = images.captureScreen();
    var captured = Date.now();

    if (!image) {
        throw new Error("SCREEN_CAPTURE_RETURNED_NULL");
    }

    var png = files.join(outputDir, "screen.png");
    images.save(image, png, "png", 100);

    var meta = {
        schema: 1,
        observed_at: new Date().toISOString(),
        capture_ms: captured - started,
        width: image.width,
        height: image.height,
        package_name: currentPackage(),
        activity: currentActivity(),
        png: png,
    };

    files.write(
        files.join(outputDir, "screen.json"),
        JSON.stringify(meta, null, 2)
    );

    image.recycle();
    console.log("WROTE " + png);
})();
