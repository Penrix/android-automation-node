# K20 Root Runner

K20 的 Magisk `service.d` 守护。它只做两件事：等 Android 完成开机；在 AutoJs6
或其 `azur-supervisor.js` 心跳缺失时，重新请求 AutoJs6 前台服务与主管脚本。

它**不**维护任何业务定时表，也不直接启动钱包、Epic 或拼多多脚本。它们仍由 AutoJs6
自己的定时任务执行；`azur-supervisor.js` 观察这些任务，任务结束后恢复碧蓝航线。

部署目标：

```text
/data/adb/service.d/penrix-root-runner.sh
```

运行记录：

```text
/sdcard/Node01-RootRunner/events.jsonl
/sdcard/Node01-RootRunner/autojs-launch.log
```

只有在 `autojs_launch_requested` 之后重新出现
`/sdcard/Node01-Azur/supervisor-heartbeat`，才说明恢复链路真的重新运行；单纯写出启动请求
不等于业务脚本成功。

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const runner = path.join(__dirname, '..', 'root-runner.sh');

test('root runner owns only AutoJs bootstrap, never the daily schedules', () => {
  const source = fs.readFileSync(runner, 'utf8');

  assert.match(source, /azur-supervisor\.js/);
  assert.match(source, /RunIntentActivity/);
  assert.match(source, /supervisor-heartbeat/);
  assert.doesNotMatch(source, /wallet-daily\.js/);
  assert.doesNotMatch(source, /epic-claim\.js/);
  assert.doesNotMatch(source, /pdd-coupon\.js/);
  assert.doesNotMatch(source, /schedule\.json/);
});

test('root runner records a launch request but does not claim the script succeeded', () => {
  const source = fs.readFileSync(runner, 'utf8');

  assert.match(source, /autojs_launch_requested/);
  assert.doesNotMatch(source, /autojs_launch_succeeded/);
});

test('root runner preserves the observed once-per-day recovery for a DEAD AutoJs accessibility binding', () => {
  const source = fs.readFileSync(runner, 'utf8');

  assert.match(source, /accessibility-reboot-day/);
  assert.match(source, /DEAD\.\*AccessibilityServiceUsher/);
  assert.match(source, /dumpsys accessibility/);
  assert.match(source, /reboot/);
});

test('deployment uses Android shell utilities rather than a Magisk PATH-dependent busybox command', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'deploy-root-runner.sh'), 'utf8');

  assert.match(source, /\/system\/bin\/nohup/);
  assert.match(source, /\/system\/bin\/sh/);
  assert.doesNotMatch(source, /busybox nohup/);
});

