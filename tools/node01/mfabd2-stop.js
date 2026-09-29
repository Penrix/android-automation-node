/**
 * MFABD2 stop probe for the FINAL LIVE GATE.
 *
 * PREPARED ONLY. This has an external side effect and must not be run before
 * the MFABD2 live step.
 *
 * Source basis:
 * - MFABD2 release package: io.github.sunyink.mfabd2
 * - MaaFwApp states that when the app process dies, the privileged watchdog
 *   exits and releases the virtual display.
 *
 * Runtime truth still requires Node-01 verification.
 */

(function () {
    var packageName = "io.github.sunyink.mfabd2";
    var result = shell("am force-stop " + packageName, true);

    var receipt = {
        schema: 1,
        observed_at: new Date().toISOString(),
        action: "am force-stop",
        package_name: packageName,
        code: result.code,
        stdout: String(result.result || ""),
        stderr: String(result.error || "")
    };

    console.log(JSON.stringify(receipt, null, 2));

    if (result.code !== 0) {
        throw new Error("MFABD2_FORCE_STOP_FAILED");
    }
})();
