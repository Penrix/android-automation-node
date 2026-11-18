// K20 PDD's observed coupon/dialog parents only. No taps, whole-page scan or disk I/O.
var policy = require('./pdd-policy.js');
var pkg = 'com.xunmeng.pinduoduo';
function snapshot(node, depth) {
    if (!node || depth > 6 || node.childCount() > 20) return null;
    var b = node.bounds();
    var result = { text: String(node.text() || ''), bounds: { left: b.left, top: b.top, right: b.right, bottom: b.bottom }, children: [] };
    for (var i = 0; i < node.childCount(); i++) {
        var child = snapshot(node.child(i), depth + 1);
        if (!child) return null;
        result.children.push(child);
    }
    return result;
}
function parents(label) {
    var nodes = text(label).packageName(pkg).find(), result = [];
    for (var i = 0; i < nodes.size(); i++) {
        var tree = snapshot(nodes.get(i).parent(), 0);
        if (tree) result.push(tree);
    }
    return result;
}
function couponFrame() {
    var begin = Date.now();
    var cards = parents('无门槛券').filter(policy.matches);
    return { at: new Date().toISOString(), cards: cards, capture_ms: Date.now() - begin };
}
function responseFrame(includeConfirmation) {
    var begin = Date.now();
    // Other coupons already say 今日已抢光 on this page: those are not this submission's result.
    // One query sees both the confirmation and outcomes, avoiding a second page traversal.
    var nodes = textMatches(/^(?:确认兑换|兑换成功|领取成功|券已抢光|积分不足|今日已兑换|今日已领取|(?:今日|本周).*(?:上限|次数已用完))$/).packageName(pkg).find();
    var values = [], tree = { children: [] };
    for (var i = 0; i < nodes.size(); i++) {
        var node = nodes.get(i), value = String(node.text());
        if (value === '确认兑换') {
            if (includeConfirmation) {
                var parent = snapshot(node.parent(), 0);
                if (parent) tree.children.push(parent);
            }
        } else values.push(value);
    }
    return { at: new Date().toISOString(), tree: tree, labels: values, capture_ms: Date.now() - begin };
}
module.exports = { couponFrame: couponFrame, responseFrame: responseFrame };
