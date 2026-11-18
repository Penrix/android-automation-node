function start() {
    device.wakeUpIfNeeded();
    device.keepScreenOn(240000);
    sleep(300);
    if (context.getSystemService('keyguard').isDeviceLocked()) throw Error('K80 locked. Unlock before running.');
    return {screen_on:device.isScreenOn(),timeout_ms:240000};
}
function check() {
    if (!device.isScreenOn()) throw Error('Screen turned off during coupon window');
}
function finish() { device.cancelKeepingAwake(); }
module.exports = {start:start,check:check,finish:finish};
