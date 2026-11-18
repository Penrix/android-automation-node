function deviceShell(command) { return shizuku(command); }
// AutoJs6 6.7.0, rooted K20. This phone script is the coupon executor.
var policy = require('./pdd-policy.js');
var focusedUi = require('./pdd-ui.js');
var power = require('./pdd-power.js');
var base = '/sdcard/Node01-PDD';
var pkg = 'com.xunmeng.pinduoduo';
var args = engines.myEngine().execArgv || {};
var dryRun = !!args.dryRun;
var started = Date.now();
var runId = new Date(started).toISOString().replace(/[:.]/g, '-') + (dryRun ? '-dry' : '-live');
var dir = base + '/runs/' + runId;
files.ensureDir(dir + '/');
var summary = { version: '20261107.1', run_id: runId, dry_run: dryRun, started_at: new Date(started).toISOString(), timezone: String(java.util.TimeZone.getDefault().getID()), status: 'started', redemption_taps: 0, confirmation_taps: 0 };
var claimsPath = base + '/claims.json';
var claims = files.exists(claimsPath) ? JSON.parse(files.read(claimsPath)) : [];
var toasts = [];
var critical = false, deferredEvents = [], deferredFrames = {};

function event(name, data) {
    var line = JSON.stringify({ at: new Date().toISOString(), elapsed_ms: Date.now() - started, event: name, data: data || {} }) + '\n';
    if (critical) deferredEvents.push(line);
    else files.append(dir + '/events.jsonl', line);
}
function ensureAccessibility() { require('./pdd-accessibility.js')(event); }
function today() {
    var d = new Date();
    function pad(n) { return n < 10 ? '0' + n : String(n); }
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
function slot() {
    var now = Date.now(), d = new Date(now);
    var hours = [9, 10, 16, 21];
    for (var i = 0; i < hours.length; i++) {
        var due = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours[i], 0, 0).getTime();
        if (now >= due - 90000 && now <= due + 15000) return { hour: hours[i], due: due };
    }
    return null;
}
function frame() {
    var begin = Date.now(), count = 0, cards = [];
    var root = auto.rootInActiveWindow;
    function visit(n) {
        if (!n || count >= 2500) return null;
        count++;
        var b = n.bounds();
        var item = { text: n.password() ? '' : String(n.text() || ''), desc: n.password() ? '' : String(n.desc() || ''), id: String(n.id() || ''), bounds: { left: b.left, top: b.top, right: b.right, bottom: b.bottom }, children: [] };
        if (!n.password()) for (var i = 0; i < n.childCount(); i++) { var child = visit(n.child(i)); if (child) item.children.push(child); }
        if (policy.matches(item) && !item.children.some(policy.matches)) cards.push(item);
        return item;
    }
    var tree = visit(root);
    return { at: new Date().toISOString(), package: root ? String(root.packageName()) : '', tree: tree, cards: cards, labels: policy.labels(tree), nodes: count, truncated: count >= 2500, capture_ms: Date.now() - begin };
}
function checkpoint(name, view) {
    files.write(dir + '/' + name + '.json', JSON.stringify(view, null, 2));
    var capture = deviceShell('screencap -p ' + dir + '/' + name + '.png', true);
    event('checkpoint', { name: name, screenshot_code: capture.code, nodes: view.nodes, tree_ms: view.capture_ms });
}
function tapBounds(b, label) {
    var x = Math.round((b.left + b.right) / 2), y = Math.round((b.top + b.bottom) / 2);
    if (b.bottom <= b.top || x < 0 || x >= device.width || y < 96 || y >= device.height) throw Error('Target outside viewport: ' + label);
    var shortPress = label === '5yuan_no_minimum_100points' || label === 'confirm_5yuan_100points';
    var at = Date.now(), ok = shortPress ? press(x, y, 16) : click(x, y);
    event('tap', { label: label, x: x, y: y, ok: ok, click_ms: Date.now() - at, input: shortPress ? 'press16' : 'click' });
    if (!ok) throw Error('Input failed: ' + label);
}
function navigate() {
    var command = deviceShell('am start -f 0x14000000 -n com.xunmeng.pinduoduo/.ui.activity.MainFrameActivity', true);
    if (command.code !== 0) throw Error('PDD launch failed');
    event('launch_pdd');
    var until = Date.now() + 35000, openedMember = false, lastState = '';
    while (Date.now() < until) {
        var view = frame();
        var homeEntry = view.package === pkg ? policy.homeSubsidyEntry(view.tree) : null;
        var state = { package: view.package, member: view.labels.indexOf('百亿补贴会员') >= 0, consumption_promotion: view.labels.indexOf('消费券') >= 0, search_header: view.labels.indexOf('搜索框') >= 0, subsidy_text: view.labels.indexOf('百亿补贴') >= 0, subsidy_home_image: !!homeEntry };
        var stateKey = JSON.stringify(state);
        if (stateKey !== lastState) { event('navigation_state', state); lastState = stateKey; }
        if (view.package !== pkg) { sleep(300); continue; }
        var homePopup = policy.homePopupClose(view.tree);
        var popupClose = homePopup || policy.subsidyPopupClose(view.tree);
        if (popupClose) {
            checkpoint('navigation-popup', view);
            tapBounds(popupClose.bounds, homePopup ? 'close_observed_home_promotion' : 'close_observed_lucky_bag_popup');
            sleep(300); continue;
        }
        if (view.labels.indexOf('百亿补贴会员') >= 0) {
            if (openedMember) return view;
            // MainFrameActivity can retain the old WebView/scroll position (live observed).
            back(); event('reopen_member_at_top'); sleep(600); continue;
        }
        if (view.labels.indexOf('消费券') >= 0) {
            back(); event('close_observed_consumption_promotion'); sleep(800); continue;
        }
        var search = text('搜索框').packageName(pkg).findOnce();
        if (search && view.labels.indexOf('百亿补贴') >= 0) {
            // Live verified: gold member image has no text; it is this header sibling.
            var button = search.parent().child(1).child(0);
            if (!button.clickable()) throw Error('Member header structure changed');
            var r = button.bounds();
            tapBounds({ left: r.left, top: r.top, right: r.right, bottom: r.bottom }, 'member_header_image');
            openedMember = true;
            sleep(1200); continue;
        }
        var subsidy = text('百亿补贴').packageName(pkg).findOnce();
        if (subsidy) {
            var b = subsidy.bounds();
            tapBounds({ left: b.left, top: b.top, right: b.right, bottom: b.bottom }, 'subsidy_entry');
            sleep(1200); continue;
        }
        if (homeEntry) {
            tapBounds(homeEntry.bounds, 'subsidy_home_image');
            sleep(1200); continue;
        }
        sleep(300);
    }
    event('navigation_timeout', { last_state: lastState ? JSON.parse(lastState) : null });
    throw Error('Member navigation timed out');
}
function locateVisible() {
    for (var i = 0; i < 6; i++) {
        var view = frame();
        if (view.package !== pkg) throw Error('PDD lost foreground');
        var target = policy.target(view.cards);
        if (target) {
            // The card can be offscreen even though WebView exposes its text.
            var exchange = target.children.filter(function (c) { return c.text === '积分兑换'; })[0];
            if (exchange && exchange.bounds.bottom > exchange.bounds.top && exchange.bounds.top < device.height - 100) return view;
        }
        swipe(device.width * 0.5, device.height * 0.78, device.width * 0.5, device.height * 0.43, 240);
        event('scroll_to_coupon', { index: i }); sleep(200);
    }
    throw Error('Target card not visible');
}
function run() {
    event('accessibility_check_start');
    if (!auto.service) throw Error('Accessibility unavailable');
    event('accessibility_ready');
    if (summary.timezone !== 'Asia/Shanghai') throw Error('Unexpected phone timezone: ' + summary.timezone);
    var limit = policy.quota(claims, today());
    if (limit) { summary.status = limit; event('quota_skip', { reason: limit }); return; }
    var release = slot();
    if (!dryRun && !release) { summary.status = 'outside_window'; return; }
    if (release) { summary.slot = release.hour + ':00'; summary.release_at = new Date(release.due).toISOString(); summary.trigger_offset_ms = started - (release.due - 60000); }
    power.check();
    var prep = Date.now();
    var ready = navigate();
    summary.prepare_ms = Date.now() - prep;
    event('member_ready', { prepare_ms: summary.prepare_ms, cards: ready.cards.map(policy.labels) });
    checkpoint('prepared', ready);
    // Do navigation, scrolling and selector warm-up before the release, never after it.
    var staged = locateVisible();
    var preflight = focusedUi.couponFrame();
    event('target_preflight', { capture_ms: preflight.capture_ms, cards: preflight.cards.map(policy.labels) });
    if (dryRun) {
        var preview = staged;
        summary.preview = policy.decision(preview.cards, claims, today(), false);
        delete summary.preview.card;
        summary.target_labels = policy.labels(policy.target(preview.cards));
        summary.status = 'dry_run_complete';
        checkpoint('dry-target', preview);
        return;
    }
    var confirmWarmup = focusedUi.responseFrame(true);
    event('confirmation_preflight', { capture_ms: confirmWarmup.capture_ms });
    if (Date.now() > release.due + 15000) { summary.status = 'preparation_too_late'; return; }
    while (Date.now() < release.due) sleep(Math.min(100, release.due - Date.now()));
    power.check();
    critical = true;
    summary.strategy = 'refresh_then_updated_card';
    summary.release_check_offset_ms = Date.now() - release.due;
    event('release_start', { offset_ms: summary.release_check_offset_ms, strategy: summary.strategy });
    // 2026-10-29 21:00: a retained gray card rejected the tap before confirmation and
    // stayed stale until refresh. Clock time alone cannot make it redeemable.
    var refreshAt = Date.now();
    var refreshed = swipe(device.width * 0.5, device.height * 0.30, device.width * 0.5, device.height * 0.70, 120);
    summary.refresh_offset_ms = refreshAt - release.due;
    event('release_refresh', { ok: refreshed, gesture_ms: Date.now() - refreshAt, offset_ms: summary.refresh_offset_ms });
    if (!refreshed) throw Error('Release refresh gesture failed');
    var releaseBadge = (release.hour < 10 ? '0' : '') + release.hour + ':00抢';
    var until = release.due + 15000, lastReason = '', view, scrolls = 0;
    while (Date.now() < until) {
        view = focusedUi.couponFrame();
        // A temporarily missing card is not evidence it is below the viewport.
        var visibleTarget = policy.target(view.cards);
        if (visibleTarget && view.cards.length === 1) {
            var exchange = visibleTarget.children.filter(function (c) { return c.text === '积分兑换'; })[0];
            if (!exchange || exchange.bounds.bottom <= exchange.bounds.top || exchange.bounds.top < 96 || exchange.bounds.bottom > device.height - 100) {
                if (scrolls < 2 && exchange && exchange.bounds.top >= device.height - 100) {
                    swipe(device.width * 0.5, device.height * 0.78, device.width * 0.5, device.height * 0.43, 240);
                    event('scroll_to_coupon', { index: scrolls++, capture_ms: view.capture_ms });
                }
                sleep(16); continue;
            }
        }
        var action = policy.decision(view.cards, claims, today(), Date.now() >= release.due && Date.now() <= release.due + 15000, releaseBadge);
        if (action.reason !== lastReason) { event('coupon_state', { reason: action.reason || 'available', values: policy.labels(policy.target(view.cards)), capture_ms: view.capture_ms, elapsed_after_release_ms: Date.now() - release.due }); lastReason = action.reason; }
        if (action.action === 'tap') {
            var b = { left: action.x - 1, right: action.x + 1, top: action.y - 1, bottom: action.y + 1 };
            summary.target_labels = policy.labels(action.card);
            summary.first_tap_offset_ms = Date.now() - release.due;
            tapBounds(b, '5yuan_no_minimum_100points');
            summary.redemption_taps = 1;
            // Retain the decision tree after input, without delaying input for a screenshot.
            deferredFrames.decision = view;
            var responseDeadline = Date.now() + 10000;
            while (Date.now() < responseDeadline) {
                var after = focusedUi.responseFrame(summary.confirmation_taps === 0);
                var confirm = summary.confirmation_taps === 0 && policy.confirmation(after.tree, summary.redemption_taps === 1, false, Date.now() <= release.due + 15000);
                if (confirm) {
                    summary.confirmation_offset_ms = Date.now() - release.due;
                    tapBounds(confirm.bounds, 'confirm_5yuan_100points');
                    summary.confirmation_taps = 1;
                    summary.confirmation_scan_ms = after.capture_ms;
                    deferredFrames.confirmation = after;
                    responseDeadline = Date.now() + 10000;
                    continue;
                }
                var response = after.labels.concat(toasts);
                var outcome = policy.outcome(response, true);
                if (outcome.status !== 'unconfirmed') {
                    summary.status = outcome.status;
                    summary.response_labels = response;
                    if (outcome.status === 'confirmed_success') {
                        claims.push({ date: today(), at: new Date().toISOString(), run_id: runId, proof: response.filter(function (t) { return /兑换成功|领取成功/.test(t); }) });
                        files.write(claimsPath, JSON.stringify(claims, null, 2));
                    }
                    checkpoint('result', frame());
                    return;
                }
                sleep(16);
            }
            summary.status = 'result_unconfirmed';
            summary.response_labels = focusedUi.responseFrame(false).labels.concat(toasts);
            return;
        }
        if (action.reason === 'claimed_today' || action.reason === 'weekly_limit') { summary.status = action.reason; return; }
        if (action.reason === 'sold_out') { summary.status = 'sold_out'; return; }
        sleep(16);
    }
    summary.status = lastReason === 'not_open' ? (policy.labels(policy.target(view.cards)).indexOf(releaseBadge) >= 0 ? 'page_state_not_refreshed' : 'different_release_slot') : lastReason || 'target_not_ready';
}
try {
    event('started', { version: summary.version, dry_run: dryRun });
    if ((dryRun || slot()) && !policy.quota(claims, today())) event('root_power_ready', power.start());
    if (dryRun || slot()) ensureAccessibility();
    event('toast_observer_start');
    events.observeToast();
    event('toast_observer_ready');
    events.onToast(function (toast) { if (String(toast.getPackageName()) === pkg) { var message = String(toast.getText()); toasts.push(message); event('pdd_toast', { text: message }); } });
    run();
} catch (error) {
    summary.status = 'error'; summary.error = String(error); event('error', { message: summary.error });
} finally {
    critical = false;
    if (deferredEvents.length) files.append(dir + '/events.jsonl', deferredEvents.join(''));
    Object.keys(deferredFrames).forEach(function (name) { files.write(dir + '/' + name + '.json', JSON.stringify(deferredFrames[name], null, 2)); });
    summary.finished_at = new Date().toISOString();
    summary.duration_ms = Date.now() - started;
    var reasons = { sold_out: '页面或Toast提示券已抢光；不单凭Toast认定服务端库存或有效提交', page_state_not_refreshed: '整点刷新后本场时间标签仍未更新；没有点击旧卡片', different_release_slot: '目标券标注的场次与本场不同，不点击其他场次', result_unconfirmed: '已点精确目标但未捕获成功；先检查结果截图/提示，不能计作已领取', error: '按 error 与最后检查点修复导航/节点/权限问题', preparation_too_late: '准备阶段超过本场窗口；根据 prepare_ms 调整提前量' };
    summary.analysis = reasons[summary.status] || summary.status;
    try {
        if (summary.prepare_ms !== undefined || summary.error) {
            var last = frame();
            if (last.package === pkg) checkpoint('final', last);
            else event('final_capture_skipped', { package: last.package });
        }
    } catch (captureError) { summary.evidence_error = String(captureError); }
    files.write(dir + '/summary.json', JSON.stringify(summary, null, 2));
    files.write(base + '/last-run.json', JSON.stringify(summary, null, 2));
    event('finished', { status: summary.status, duration_ms: summary.duration_ms });
    events.removeAllListeners();
    try { power.finish(); } catch (powerError) { event('power_restore_error', { message: String(powerError) }); }
    toastLog('PDD: ' + summary.status);
}
// observeToast keeps an AutoJs engine alive after all work and cleanup finish.
exit();
