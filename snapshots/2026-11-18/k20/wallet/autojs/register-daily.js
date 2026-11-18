var base = '/sdcard/Node01-Wallet';
var primary = base + '/wallet-daily.js';
var ad = base + '/wallet-ad.js';
var slots = [
    { time: '08:30', path: ad },
    { time: '11:05', path: primary },
    { time: '14:30', path: ad },
    { time: '19:30', path: ad }
];

function dailyAt(slot) {
    var parts = slot.time.split(':');
    var millis = (Number(parts[0]) * 60 + Number(parts[1])) * 60000;
    return tasks.queryTimedTasks({ path: slot.path }).filter(function (task) {
        var details = String(task);
        return /mTimeFlag=127,/.test(details) && details.indexOf('mMillis=' + millis + ',') >= 0;
    });
}

var registered = slots.map(function (slot) {
    if (!files.exists(slot.path)) throw Error('Script missing: ' + slot.path);
    if (!dailyAt(slot).length) tasks.addDailyTask({ path: slot.path, time: slot.time });
    var matches = dailyAt(slot);
    if (matches.length !== 1) throw Error('Expected one daily task for ' + slot.time);
    return { id: Number(matches[0].id), time: slot.time, path: slot.path, details: String(matches[0]) };
});
var main = registered[1];
files.write(base + '/schedule.json', JSON.stringify({
    path: primary,
    times: slots.map(function (slot) { return slot.time; }),
    timezone: String(java.util.TimeZone.getDefault().getID()),
    registered_at: new Date().toISOString(),
    tasks: registered,
    time: main.time,
    local_time: main.time,
    id: main.id,
    task_id: main.id
}, null, 2));
