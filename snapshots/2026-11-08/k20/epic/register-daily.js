// Run on the K20 after the account's real acquisition path has been accepted.
var path = "/sdcard/Penrix-Epic/epic-claim.js";
tasks.queryTimedTasks({ path: path }).forEach(function (task) { tasks.removeTimedTask(task.id); });
var task = tasks.addDailyTask({ path: path, time: "10:00" });
var registered = tasks.queryTimedTasks({ path: path });
if (registered.length !== 1 || Number(registered[0].id) !== Number(task.id)) throw Error("Daily task registration not confirmed");
files.write("/sdcard/Penrix-Epic/schedule.json", JSON.stringify({
    task_id: Number(task.id), path: path, local_time: "10:00", timezone: String(java.util.TimeZone.getDefault().getID()),
    registered_at: new Date().toISOString(), registered_task: String(registered[0])
}, null, 2));
