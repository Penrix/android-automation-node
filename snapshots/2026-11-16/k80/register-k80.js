var jobs = [
    { directory: 'Node01-PDD', script: 'pdd-coupon.js', times: ['08:59', '09:59', '15:59', '20:59'] },
    { directory: 'Penrix-Epic', script: 'epic-claim.js', times: ['10:05'] },
    { directory: 'Node01-Wallet', script: 'wallet-daily.js', times: ['11:05'] }
];
jobs.forEach(function (job) {
    var directory = '/sdcard/' + job.directory;
    var path = directory + '/' + job.script;
    if (!files.exists(path)) throw Error('Script not found: ' + path);
    tasks.queryTimedTasks({path:path}).forEach(function (task) { tasks.removeTimedTask(task.id); });
    job.times.forEach(function (time) { tasks.addDailyTask({path:path,time:time}); });
    var registered = tasks.queryTimedTasks({path:path});
    if (registered.length !== job.times.length) throw Error('Schedule registration failed: ' + path);
    files.write(directory + '/schedule.json', JSON.stringify({path:path, times:job.times, timezone:String(java.util.TimeZone.getDefault().getID()), tasks:registered.map(function (task) { return String(task); })}, null, 2));
});
