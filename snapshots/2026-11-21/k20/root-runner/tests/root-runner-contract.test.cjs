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

