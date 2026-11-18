const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');
const policy = require('../autojs/azur-policy.js');

test('low coins and OCR misses still allow two sorties with a reserved-slot commission check between them', () => {
    const actions = [];
    const ready = [];
    const now = Date.now();
    const runtime = {
        dir: '/mock/run',
        scan: () => [],
        log(event, data) {
            if (event === 'sortie_ready' || event === 'finished') ready.push(data);
        },
    };
    const engine = { execArgv: { maxSorties: 2 } };
    const modules = {
        'azur-runtime.js': runtime,
        'azur-startup.js': { start() {} },
        'azur-navigation.js': { home() {}, shop() { actions.push('shop'); } },
        'azur-policy.js': { ...policy, coins: () => actions.includes('sortie') ? null : 1703 },
        'azur-oil.js': { oil: () => ({ amount: 5100, cap: 18500 }) },
        'azur-port.js': { run() { actions.push('port'); } },
        'azur-commission.js': {
            run(_runtime, urgentOnly) {
                actions.push(urgentOnly ? 'urgent' : 'commissions');
                return { due: now + 600000, free: 1 };
            },
        },
        'azur-campaign.js': { run() { actions.push('sortie'); } },
    };

    runInNewContext(readFileSync(require.resolve('../autojs/azur-main.js'), 'utf8'), {
        engines: { myEngine: () => engine, all: () => [engine] },
        files: { write() {} },
        require: (path) => {
            const name = path.split('/').pop();
            assert.ok(modules[name], 'unexpected module: ' + name);
            return modules[name];
        },
    });

    assert.deepEqual(actions, ['commissions', 'sortie', 'urgent', 'port', 'sortie']);
    assert.deepEqual(ready.slice(0, 2).map((row) => row.coins), [1703, null]);
    assert.equal(ready[2].status, 'completed');
    assert.equal(ready[2].sorties, 2);
});
