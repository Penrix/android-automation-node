/**
 * Register the three daily PDD PREPARE entry points using AutoJs6 TimedTask.
 *
 * PREPARED ONLY.
 *
 * IMPORTANT:
 * Do not schedule at 09:00 / 16:00 / 21:00 themselves. Owner requires the
 * game to yield BEFORE the coupon refresh. Final-live benchmarking must first
 * measure the preparation lead time, then create runtime/pdd/schedule.json.
 *
 * Expected runtime/pdd/schedule.json shape:
 * {
 *   "entries": ["08:59:40", "15:59:40", "20:59:40"]
 * }
 *
 * The example above is illustrative only. No lead time is accepted until
 * Node-01 live evidence measures it.
 */

(function () {
    var target = files.path("./runtime/pdd/live.js");
    var configPath = files.path("./runtime/pdd/schedule.json");

    if (!files.exists(target)) {
        throw new Error(
            "PDD_LIVE_HANDLER_MISSING: " + target +
            " — collect final-live page evidence before creating runtime/pdd/live.js"
        );
    }

    if (!files.exists(configPath)) {
        throw new Error(
            "PDD_SCHEDULE_CONFIG_MISSING: " + configPath +
            " — benchmark preparation lead time before registering persistent tasks"
        );
    }

    var config = JSON.parse(files.read(configPath));
    if (!config || !Array.isArray(config.entries) || config.entries.length !== 3) {
        throw new Error("PDD_SCHEDULE_CONFIG_INVALID: expected exactly 3 entries");
    }

    var expectedHours = [8, 15, 20];
    config.entries.forEach(function (time, index) {
        if (typeof time !== "string") {
            throw new Error("PDD_SCHEDULE_TIME_INVALID: " + time);
        }
        var parts = time.split(":");
        if (parts.length < 2 || parts.length > 3) {
            throw new Error("PDD_SCHEDULE_TIME_INVALID: " + time);
        }
        var hour = Number(parts[0]);
        if (hour !== expectedHours[index]) {
            throw new Error(
                "PDD_SCHEDULE_NOT_PREPARE_TIME: " + time +
                " — entries must be before 09:00 / 16:00 / 21:00"
            );
        }
    });

    var existing = tasks.queryTimedTasks({ path: target });
    existing.forEach(function (task) {
        if (!tasks.removeTimedTask(task.id)) {
            throw new Error("FAILED_TO_REMOVE_EXISTING_PDD_TASK: " + task.id);
        }
    });

    var created = [];
    config.entries.forEach(function (time) {
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
        schema: 2,
        target: target,
        schedule_config: configPath,
        removed_count: existing.length,
        created: created
    }, null, 2));
})();
