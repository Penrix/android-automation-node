/**
 * PDD read-only evidence collector for the FINAL LIVE GATE.
 *
 * PREPARED ONLY. It does not tap, swipe, launch, stop, or redeem anything.
 * Target runtime: AutoJs6 v6.7.0+.
 */

(function () {
    var outputDir = files.join(files.cwd(), "evidence", "pdd");
    files.ensureDir(outputDir);

    function safeValue(fn) {
        try {
            return fn();
        } catch (e) {
            return null;
        }
    }

    function rectToObject(rect) {
        if (!rect) return null;
        return {
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.width(),
            height: rect.height()
        };
    }

    var MAX_NODES = 2500;
    var count = 0;

    function serializeNode(node, path) {
        if (!node || count >= MAX_NODES) return null;
        count += 1;

        var item = {
            path: path,
            text: safeValue(function () { return node.text(); }),
            desc: safeValue(function () { return node.desc(); }),
            content: safeValue(function () { return node.content(); }),
            id: safeValue(function () { return node.id(); }),
            class_name: safeValue(function () { return node.className(); }),
            package_name: safeValue(function () { return node.packageName(); }),
            clickable: safeValue(function () { return node.clickable(); }),
            enabled: safeValue(function () { return node.enabled(); }),
            visible_to_user: safeValue(function () { return node.visibleToUser(); }),
            bounds: safeValue(function () { return rectToObject(node.bounds()); }),
            children: []
        };

        var childCount = safeValue(function () { return node.childCount(); }) || 0;
        for (var i = 0; i < childCount && count < MAX_NODES; i += 1) {
            var child = safeValue(function () { return node.child(i); });
            var serialized = serializeNode(child, path.concat([i]));
            if (serialized) item.children.push(serialized);
        }
        return item;
    }

    var scriptStartedAt = Date.now();
    var observedAt = new Date().toISOString();

    var rootStartedAt = Date.now();
    var root = safeValue(function () { return auto.rootInActiveWindow; });
    var rootAcquiredAt = Date.now();

    var evidence = {
        schema: 1,
        observed_at: observedAt,
        package_name: safeValue(function () { return currentPackage(); }),
        activity: safeValue(function () { return currentActivity(); }),
        accessibility_service_present: safeValue(function () { return !!auto.service; }),
        root_present: !!root,
        node_count: 0,
        truncated: false,
        tree: null
    };

    var treeStartedAt = Date.now();
    if (root) {
        evidence.tree = serializeNode(root, []);
        evidence.node_count = count;
        evidence.truncated = count >= MAX_NODES;
    }
    var treeFinishedAt = Date.now();

    evidence.timing = {
        root_lookup_ms: rootAcquiredAt - rootStartedAt,
        tree_serialize_ms: treeFinishedAt - treeStartedAt
    };

    var treePath = files.join(outputDir, "accessibility-tree.json");

    var screenshotMeta = {
        schema: 1,
        observed_at: observedAt,
        requested: false,
        saved: false,
        error: null
    };

    try {
        screenshotMeta.requested = true;
        if (images.requestScreenCapture()) {
            var started = Date.now();
            var image = images.captureScreen();
            var captured = Date.now();
            if (image) {
                var pngPath = files.join(outputDir, "screen.png");
                images.save(image, pngPath, "png", 100);
                screenshotMeta.saved = true;
                screenshotMeta.path = pngPath;
                screenshotMeta.capture_ms = captured - started;
                screenshotMeta.width = image.width;
                screenshotMeta.height = image.height;
                image.recycle();
            } else {
                screenshotMeta.error = "SCREEN_CAPTURE_RETURNED_NULL";
            }
        } else {
            screenshotMeta.error = "SCREEN_CAPTURE_PERMISSION_NOT_GRANTED";
        }
    } catch (e) {
        screenshotMeta.error = String(e);
    }

    files.write(
        files.join(outputDir, "screen.json"),
        JSON.stringify(screenshotMeta, null, 2)
    );

    evidence.timing.total_probe_ms = Date.now() - scriptStartedAt;
    files.write(treePath, JSON.stringify(evidence, null, 2));

    console.log("WROTE " + treePath);
})();
