/**
 * Node-01 baseline collector.
 *
 * PREPARED ONLY: this file has not yet been executed on the K20 Pro.
 * Target runtime: AutoJs6 v6.7.0+
 */

(function () {
    var outputDir = files.join(files.cwd(), "evidence");
    files.ensureDir(outputDir);

    function safe(name, fn) {
        try {
            return { ok: true, value: fn() };
        } catch (e) {
            return { ok: false, error: String(e) };
        }
    }

    var rootProbe = safe("root", function () {
        var r = shell("id", true);
        return {
            code: r.code,
            result: String(r.result || ""),
            error: String(r.error || ""),
        };
    });

    var evidence = {
        schema: 1,
        observed_at: new Date().toISOString(),
        runtime: {
            autojs_version_name: safe("autojs.versionName", function () { return app.autojs.versionName; }),
            autojs_version_code: safe("autojs.versionCode", function () { return app.autojs.versionCode; }),
        },
        android: {
            release: safe("device.release", function () { return device.release; }),
            sdk_int: safe("device.sdkInt", function () { return device.sdkInt; }),
            incremental: safe("device.incremental", function () { return device.incremental; }),
            build_id: safe("device.buildId", function () { return device.buildId; }),
            brand: safe("device.brand", function () { return device.brand; }),
            model: safe("device.model", function () { return device.model; }),
            product: safe("device.product", function () { return device.product; }),
            board: safe("device.board", function () { return device.board; }),
        },
        display: {
            width: safe("device.width", function () { return device.width; }),
            height: safe("device.height", function () { return device.height; }),
        },
        foreground: {
            package_name: safe("currentPackage", function () { return currentPackage(); }),
            activity: safe("currentActivity", function () { return currentActivity(); }),
        },
        accessibility: {
            service_present: safe("auto.service", function () { return !!auto.service; }),
        },
        root: rootProbe,
    };

    var path = files.join(outputDir, "node01-baseline.json");
    files.write(path, JSON.stringify(evidence, null, 2));
    console.log("WROTE " + path);
})();
