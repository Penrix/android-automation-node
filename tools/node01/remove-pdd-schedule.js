/**
 * Remove all AutoJs6 timed tasks that point at runtime/pdd/live.js.
 *
 * PREPARED ONLY. This is the rollback partner for install-pdd-schedule.js.
 */

(function () {
    var target = files.path("./runtime/pdd/live.js");
    var existing = tasks.queryTimedTasks({ path: target });
    var removed = [];

    existing.forEach(function (task) {
        if (!tasks.removeTimedTask(task.id)) {
            throw new Error("FAILED_TO_REMOVE_PDD_TASK: " + task.id);
        }
        removed.push(task.id);
    });

    console.log(JSON.stringify({
        schema: 1,
        target: target,
        removed_ids: removed
    }, null, 2));
})();
