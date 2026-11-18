const { test } = require('node:test');
const assert = require('node:assert/strict');
const commission = require('../autojs/azur-commission.js');
const boot = require('../autojs/azur-startup.js');
const confirmation = require('../evidence/20261118-commission-loop/confirm.json');

function replay() {
    const clicks = [];
    const next = [{ text: '0/4' }];
    const find = re => confirmation.find(item => re.test(item.text));
    const r = {
        find, log() {}, save() {}, scan: () => next,
        word(re) {
            const item = find(re);
            if (item) clicks.push(item.text);
            return !!item;
        }
    };
    return { clicks, next, r };
}

test('the real 10-oil prompt is accepted only after matching the chosen commission price', () => {
    const { clicks, next, r } = replay();
    assert.equal(commission.confirmOil(r, 10, confirmation), next);
    assert.deepEqual(clicks, ['确定']);
});

test('price mismatch cancels and the same dialog can be recognized on startup', () => {
    const { clicks, r } = replay();
    assert.throws(() => commission.confirmOil(r, 20, confirmation), { code: 'COMMISSION_UI' });
    assert.deepEqual(clicks, ['取消']);
    assert.equal(boot.classify(confirmation), 'commission_confirmation');
});

test('rare commission re-identification tolerates the screenshot OCR prefix', () => {
    const choice = { name: 'NYB要员护卫', seconds: 7200, cube: false };
    assert.equal(commission.sameCandidate({ ...choice, name: '要员护卫', ready: true }, choice), true);
    assert.equal(commission.sameCandidate({ ...choice, seconds: 600, ready: true }, choice), false);
    assert.equal(commission.sameCandidate({ ...choice, ready: false }, choice), false);
});
