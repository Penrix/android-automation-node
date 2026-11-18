const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('completed ad retries log the daily limit without waking the phone', () => {
  const source = fs.readFileSync('autojs/wallet-ad.js', 'utf8');
  const date = '2026-11-18';
  const writes = {};
  let powerStarts = 0;
  let accessibilityStarts = 0;
  vm.runInNewContext(source, {
    files: {
      ensureDir() {}, append() {},
      exists: () => true,
      read: () => JSON.stringify([{ date }, { date }, { date }]),
      write: (path, value) => { writes[path] = JSON.parse(value); }
    },
    engines: { myEngine: () => ({}) },
    require: path => path.endsWith('power.js')
      ? { start: () => { powerStarts++; }, finish() {} }
      : () => { accessibilityStarts++; },
    java: { time: { LocalDate: { now: () => date } } },
    toastLog() {}
  });
  assert.equal(powerStarts, 0);
  assert.equal(accessibilityStarts, 0);
  const result = writes['/sdcard/Node01-Wallet/last-run.json'];
  assert.equal(result.status, 'daily_limit_reached');
  assert.equal(result.today_confirmed, 3);
});
