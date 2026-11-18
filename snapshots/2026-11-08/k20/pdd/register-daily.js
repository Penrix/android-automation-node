var path = '/sdcard/Node01-PDD/pdd-coupon.js';
tasks.queryTimedTasks({ path: path }).forEach(function (task) { tasks.removeTimedTask(task.id); });
['08:59', '09:59', '15:59', '20:59'].forEach(function (time) { tasks.addDailyTask({ path: path, time: time }); });
var registered = tasks.queryTimedTasks({ path: path });
if (registered.length !== 4) throw Error('PDD daily schedule registration not confirmed');
files.write('/sdcard/Node01-PDD/schedule.json', JSON.stringify({
    registered_at: new Date().toISOString(), timezone: String(java.util.TimeZone.getDefault().getID()),
    release_times: ['09:00', '10:00', '16:00', '21:00'], prepare_times: ['08:59', '09:59', '15:59', '20:59'],
    path: path, tasks: registered.map(function (task) { return { id: Number(task.id), details: String(task) }; })
}, null, 2));

var epicPath = '/sdcard/Penrix-Epic/epic-claim.js';
var epic = tasks.queryTimedTasks({path:epicPath});
if (epic.length === 1) {
    tasks.removeTimedTask(epic[0].id);
    var task = tasks.addDailyTask({path:epicPath, time:'10:05'});
    files.write('/sdcard/Penrix-Epic/schedule.json', JSON.stringify({task_id:Number(task.id),path:epicPath,local_time:'10:05',timezone:String(java.util.TimeZone.getDefault().getID()),registered_at:new Date().toISOString(),registered_task:String(task)},null,2));
} else throw Error('Unexpected Epic schedule count; inspect before changing');
