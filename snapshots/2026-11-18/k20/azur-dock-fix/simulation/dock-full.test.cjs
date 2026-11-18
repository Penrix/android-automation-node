const { test } = require('node:test');
const assert = require('node:assert/strict');
const campaign = require('../autojs/azur-campaign.js');
const dialog = require('../evidence/20261118-dock-full/dock-full.json');

test('dock full dialog opens 整理 and transfers to the existing retirement routine', () => {
    const clicks = [];
    const find = re => dialog.find(item => re.test(item.text));
    const r = {
        scan() {}, save() {}, find,
        word(re) {
            const item = find(re);
            if (item) clicks.push(item.text);
            return !!item;
        }
    };
    assert.throws(() => campaign.begin(r), { code: 'DOCK_FULL' });
    assert.deepEqual(clicks, ['整理']);
});
