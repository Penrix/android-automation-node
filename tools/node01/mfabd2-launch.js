/**
 * MFABD2 launch probe for the FINAL LIVE GATE.
 *
 * PREPARED ONLY. Launching the Android app is an external side effect.
 * This does not claim to resume an in-progress automation task.
 */

(function () {
    var packageName = "io.github.sunyink.mfabd2";
    var ok = app.launchPackage(packageName);

    console.log(JSON.stringify({
        schema: 1,
        observed_at: new Date().toISOString(),
        action: "app.launchPackage",
        package_name: packageName,
        accepted: !!ok
    }, null, 2));

    if (!ok) {
        throw new Error("MFABD2_LAUNCH_NOT_ACCEPTED");
    }
})();
