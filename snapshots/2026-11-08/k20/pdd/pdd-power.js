// MIUI disables AutoJs screen wake locks; use the actual system timeout.
var previous = null;
function command(value) {
    var result = shell(value, true);
    if (result.code !== 0) throw Error('Root power command failed: ' + result.error);
    return String(result.result || '').trim();
}
function start() {
    var saved = command('settings get system screen_off_timeout');
    if (!/^\d+$/.test(saved)) throw Error('Unreadable screen timeout');
    previous = saved;
    command('settings put system screen_off_timeout 180000');
    if (command('settings get system screen_off_timeout') !== '180000') throw Error('Screen timeout not applied');
    command('input keyevent 224');
    // Power transition is asynchronous: the cold-screen live test exposed this delay.
    for (var i = 0; i < 50 && !device.isScreenOn(); i++) sleep(20);
    if (!device.isScreenOn()) throw Error('Root wake did not turn screen on');
    return { previous_timeout_ms: Number(saved), timeout_ms: 180000, screen_on: true };
}
function check() {
    if (!device.isScreenOn()) throw Error('Screen turned off during coupon window');
}
function finish() {
    if (previous !== null) {
        command('settings put system screen_off_timeout ' + previous);
        previous = null;
    }
}
module.exports = { start: start, check: check, finish: finish };
