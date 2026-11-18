// Shared ES5 decisions for AutoJs6 and offline simulations. No Android calls here.
function labels(node) {
    var values = node && node.text ? [String(node.text).trim()] : [];
    (node && node.children || []).forEach(function (child) { values = values.concat(labels(child)); });
    return values;
}
function matches(card) {
    var values = labels(card);
    return ['5', '无门槛券', '100', '积分兑换'].every(function (v) { return values.indexOf(v) >= 0; }) &&
        !values.some(function (v) { return /^满\d/.test(v); }) &&
        values.filter(function (v) { return v === '积分兑换'; }).length === 1;
}
function target(cards) { return cards.filter(matches)[0] || null; }
function subsidyPopupClose(tree) {
    var found = [];
    // Actual 2026-10-30 lucky-bag overlay has no readable title: it is a
    // full-page sibling of main/portal-root, with one image panel and a small
    // separate X above its right edge. Never click the image/offer itself.
    if (labels(tree).indexOf('百亿补贴') < 0 || labels(tree).indexOf('搜索框') < 0) return null;
    function visit(node) {
        var children = node && node.children || [];
        var main = children.filter(function (c) { return c.id === 'main'; })[0];
        if (main && children.some(function (c) { return c.id === 'portal-root'; })) {
            children.forEach(function (overlay) {
                if (overlay.id || (overlay.children || []).length !== 1) return;
                var panel = overlay.children[0], parts = panel.children || [];
                if (parts.length !== 1) return;
                var close = parts[0], m = main.bounds, o = overlay.bounds, p = panel.bounds, b = close.bounds;
                if (!m || !o || !p || !b || (close.children || []).length || String(close.text || '').trim() || close.desc) return;
                var width = m.right - m.left, bw = b.right - b.left, bh = b.bottom - b.top;
                if (o.left !== m.left || o.top !== m.top || o.right !== m.right || o.bottom !== m.bottom) return;
                if (p.left <= m.left || p.right >= m.right || p.bottom <= p.top) return;
                if (bw < width * 0.04 || bw > width * 0.12 || bh < bw * 0.7 || bh > bw * 1.3) return;
                if (b.bottom >= p.top || b.left >= p.right || b.right <= p.right || b.top <= m.top) return;
                found.push(close);
            });
        }
        children.forEach(visit);
    }
    visit(tree);
    return found.length === 1 ? found[0] : null;
}
function homeSubsidyEntry(tree) {
    var values = labels(tree), found = [];
    if (values.indexOf('首页') < 0 || values.indexOf('个人中心') < 0) return null;
    function visit(node) {
        var children = node && node.children || [];
        if (children.length === 2) {
            var logo = children[0], heading = labels(children[1]);
            // 2026-10-28 failed-run tree + screenshot: the logo itself has no label.
            if (!logo.text && !logo.desc && !(logo.children || []).length &&
                heading.length === 2 && heading.indexOf('官方补贴') >= 0 && heading.indexOf('100%正品') >= 0) found.push(logo);
        }
        children.forEach(visit);
    }
    visit(tree);
    return found.length === 1 ? found[0] : null;
}
function weekStart(date) {
    var parts = date.split('-').map(Number);
    var d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7);
    return d.toISOString().slice(0, 10);
}
function quota(claims, today) {
    if (claims.some(function (c) { return c.date === today; })) return 'claimed_today';
    var dates = [];
    claims.forEach(function (c) {
        if (c.date <= today && weekStart(c.date) === weekStart(today) && dates.indexOf(c.date) < 0) dates.push(c.date);
    });
    return dates.length >= 2 ? 'weekly_limit' : null;
}
function findText(node, value) {
    if (node.text === value) return node;
    var children = node.children || [];
    for (var i = 0; i < children.length; i++) { var found = findText(children[i], value); if (found) return found; }
    return null;
}
function decision(cards, claims, today, inWindow, releaseBadge) {
    var limit = quota(claims, today);
    if (limit) return { action: 'skip', reason: limit };
    var found = cards.filter(matches);
    if (found.length !== 1) return { action: 'skip', reason: found.length ? 'target_ambiguous' : 'target_missing' };
    var values = labels(found[0]);
    if (values.some(function (v) { return /已抢光|已兑完|已领完/.test(v); })) return { action: 'skip', reason: 'sold_out' };
    if (values.some(function (v) { return /今日已兑换|今日已领取/.test(v); })) return { action: 'skip', reason: 'claimed_today' };
    if (values.some(function (v) { return /\d\d:\d\d抢/.test(v); })) return { action: 'skip', reason: 'not_open' };
    if (!inWindow) return { action: 'skip', reason: 'outside_window' };
    var button = findText(found[0], '积分兑换');
    var b = button.bounds;
    return { action: 'tap', x: (b.left + b.right) / 2, y: (b.top + b.bottom) / 2, card: found[0] };
}
function confirmation(tree, initialTapped, alreadyConfirmed, inWindow) {
    if (!initialTapped || alreadyConfirmed || !inWindow) return null;
    var found = [];
    function visit(node) {
        var children = node && node.children || [];
        var direct = children.map(function (child) { return child.text || ''; });
        // Exact dialog structure captured on K20 at 2026-10-28 21:00.
        if (['确认消耗', '100', '积分兑换吗？', '确认兑换'].every(function (v) { return direct.indexOf(v) >= 0; })) {
            var coupons = children.filter(function (child) {
                var values = labels(child);
                return ['5', '元', '百亿补贴无门槛券'].every(function (v) { return values.indexOf(v) >= 0; }) && !values.some(function (v) { return /^满\d/.test(v); });
            });
            var buttons = children.filter(function (child) { return child.text === '确认兑换'; });
            if (coupons.length === 1 && buttons.length === 1) found.push(buttons[0]);
        }
        children.forEach(visit);
    }
    visit(tree);
    return found.length === 1 ? found[0] : null;
}
function outcome(values, clicked) {
    var text = values.join('\n');
    if (/本周.*(?:达.*上限|次数已用完)/.test(text)) return { status: 'weekly_limit' };
    if (/今日已兑换|今日已领取|今日.*(?:上限|次数已用完)/.test(text)) return { status: 'daily_limit' };
    if (/积分不足/.test(text)) return { status: 'insufficient_points' };
    if (/已抢光|已兑完|已领完/.test(text)) return { status: 'sold_out' };
    if (clicked && /兑换成功|领取成功/.test(text)) return { status: 'confirmed_success' };
    return { status: 'unconfirmed' };
}
module.exports = { labels: labels, matches: matches, target: target, subsidyPopupClose: subsidyPopupClose, homeSubsidyEntry: homeSubsidyEntry, weekStart: weekStart, quota: quota, decision: decision, confirmation: confirmation, outcome: outcome };

// Observed Nov 1 native home promotion overlay, separate from the subsidy WebView popup.
function homePopupClose(tree) {
    var page = labels(tree), found = [];
    if (page.indexOf('首页') < 0 || page.indexOf('个人中心') < 0) return null;
    var overlay = (tree.children || [])[0], screen = tree.bounds;
    function graphicOffer(node) {
        return labels(node).every(function (label) { return /^(?:[¥￥]|\d+(?:\.\d{1,2})?)$/.test(label); });
    }
    if (!overlay || !screen || !graphicOffer(overlay)) return null;
    function visit(n) {
        var children = n.children || [];
        if (children.length === 2) {
            var close = children[0], panel = children[1], b = close.bounds, p = panel.bounds;
            var w = screen.right - screen.left;
            if (b && p && !labels(close).length && graphicOffer(panel) && !close.desc && !panel.desc &&
                b.right-b.left > w*.05 && b.right-b.left < w*.1 &&
                Math.abs((b.bottom-b.top)-(b.right-b.left)) < 5 &&
                p.right-p.left > w*.6 && p.right-p.left < w*.8 &&
                b.bottom < p.top && p.top-b.bottom < w*.1 &&
                b.left < p.right && b.right > p.right && p.bottom-p.top > w*.5) found.push(close);
        }
        children.forEach(visit);
    }
    visit(overlay);
    return found.length === 1 ? found[0] : null;
}
module.exports.homePopupClose = homePopupClose;
