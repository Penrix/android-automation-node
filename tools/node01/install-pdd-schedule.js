/**
 * Register the three daily PDD entry points using AutoJs6 TimedTask.
 *
 * PREPARED ONLY. Do not run until runtime/pdd/live.js exists and has passed
 * the final-live page evidence step.
 *
 * AutoJs6 source evidence:
 * - tasks.addDailyTask({ time, path })
 * - tasks.queryTimedTasks({ path })
 * - tasks.removeTimedTask(id)
 */

(function () {
    var target = files.path("./runtime/pdd/live.js");
    var times = ["09:00", "16:00", "21:00"];

    if (!files.exists(target)) {
        throw new Error(
            "PDD_LIVE_HANDLER_MISSING: " + target +
            " — collect final-live evidence before creating runtime/pdd/live.js"
        );
    }

    // Persistent scheduled tasks are an external side effect. Make this installer
    // idempotent for this exact target path so rerunning it cannot create duplicate
    // redemption attempts.
    var existing = tasks.queryTimedTasks({ path: target });
    existing.forEach(function (task) {
        if (!tasks.removeTimedTask(task.id)) {
            throw new Error("FAILED_TO_REMOVE_EXISTING_PDD_TASK: " + task.id);
        }
    });

    var created = [];
    times.forEach(function (time) {
        var task = tasks.addDailyTask({
            time: time,
            path: target
        });
        if (!task) {
            throw new Error("FAILED_TO_ADD_PDD_TASK: " + time);
        }
        created.push({
            id: task.id,
            time: time,
            next_time: task.nextTime,
            script_path: task.scriptPath
        });
    });

    console.log(JSON.stringify({
        schema: 1,
        target: target,
        removed_count: existing.length,
        created: created
    }, null, 2));
})();
