// Runs in AutoJs6 on the K20. All website interaction stays in Penrix Browser.
var policy;
var packageName = "app.penrix.browser";
var outputPath = "/sdcard/Penrix-Epic/last-run.json";
var runId = new Date().toISOString().replace(/[:.]/g, "-");
var runDir = "/sdcard/Penrix-Epic/runs/" + runId;
files.ensureDir(runDir + "/");
var power = require("/sdcard/Node01-PDD/pdd-power.js");
var result = { started_at: new Date().toISOString(), package: packageName, offers: [], actions: [], status: "started" };
result.run_id = runId;
var loginAttempted = false;
function event(name, data) {
    files.append(runDir + "/events.jsonl", JSON.stringify({ at: new Date().toISOString(), event: name, data: data || {} }) + "\n");
}
function capture(name) {
    shell("screencap -p " + runDir + "/" + name + ".png", true);
    files.write(runDir + "/" + name + ".json", JSON.stringify(snapshot().map(function (item) {
        return { text: item.text, desc: item.desc, id: item.id };
    }), null, 2));
}

function snapshot() {
    var nodes = [];
    function visit(node) {
        if (!node || nodes.length >= 2500) return;
        // Password children can expose plaintext even when only their parent has the password flag.
        if (node.password()) {
            nodes.push({ text: "", desc: "", id: String(node.id() || ""), node: node });
            return;
        }
        nodes.push({ text: String(node.text() || ""), desc: String(node.desc() || ""), id: String(node.id() || ""), node: node });
        for (var i = 0; i < node.childCount(); i++) visit(node.child(i));
    }
    visit(auto.rootInActiveWindow);
    return nodes;
}

function waitForPage(states, timeout, title) {
    var until = Date.now() + timeout;
    var nodes, state, previous = "";
    do {
        if (currentPackage() !== packageName) throw Error("Private browser is not foreground");
        nodes = snapshot();
        state = policy.pageState(nodes);
        if (state !== previous) { event("page_state", { state: state, title: title || "" }); previous = state; }
        if (state === "loading" && title && states.indexOf("product") >= 0 && policy.isOwned(nodes, title)) state = "product";
        if (states.indexOf(state) >= 0 &&
            (state !== "checkout" || !title || policy.canAddToLibrary(nodes, title))) {
            return { nodes: nodes, state: state };
        }
        sleep(1000);
    } while (Date.now() < until);
    if (state === "challenge") throw Error("Epic security check is blocking the catalog or checkout");
    return { nodes: nodes, state: state };
}

function tap(node) {
    // Android ACTION_SHOW_ON_SCREEN was live verified with the real Get button.
    if (!node.performAction(16908342)) throw Error("Cannot bring target into view");
    sleep(500);
    if (!node.click()) throw Error("Accessibility click failed");
}

function openCatalog() {
    var launch = shell("am start -W -f 0x14000000 -n app.penrix.browser/.BrowserActivity --es url https://store.epicgames.com/en-US/free-games", true);
    if (launch.code !== 0) throw Error("Cannot open Epic in private browser");
    var page = waitForPage(["catalog", "login"], 120000);
    if (page.state === "login") {
        signIn();
        page = waitForPage(["catalog"], 90000);
    }
    if (page.state !== "catalog") throw Error("Catalog not ready: " + page.state);
    return page;
}

function ensureNetwork() {
    function connected() {
        return /\[type: VPN\[\], state: CONNECTED\/CONNECTED/.test(String(shell("dumpsys connectivity | grep -m 1 'type: VPN'", true).result));
    }
    if (connected()) return;
    event("start_existing_vpn");
    shell("am start -W -n com.follow.clash.penrix/com.follow.clash.MainActivity", true);
    var until = Date.now() + 20000;
    while (!connected()) {
        if (Date.now() > until) throw Error("Existing phone VPN did not connect");
        sleep(1000);
    }
    event("vpn_connected");
}

function signIn() {
    if (loginAttempted) throw Error("Login did not complete; no second password submission this run");
    loginAttempted = true;
    require("/sdcard/Penrix-Epic/epic-login.js").signIn();
    result.actions.push("submit_saved_login_on_phone");
}

function exactButton(label) {
    var node = text(label).packageName(packageName).findOne(5000);
    if (!node) throw Error("Required action unavailable: " + label);
    tap(node);
}

function getOffer(product, title) {
    if (!policy.isFreeProduct(product.nodes) || !policy.hasTitle(product.nodes, title)) {
        throw Error("Target product or 100-percent promotion not verified");
    }
    var button = textMatches(/^(获取|Get)$/).packageName(packageName).findOne(5000);
    if (!button) throw Error("No Get button on verified target");
    tap(button);
    result.actions.push("get_offer:" + title);
}

try {
    files.write("/sdcard/Node01-Azur/daily-resume.json", JSON.stringify({ path: "/sdcard/Penrix-Epic/epic-claim.js", started: Date.now() }));
    policy = require("/sdcard/Penrix-Epic/epic-ui.js");
    engines.all().forEach(function (engine) {
        if (String(engine.getSource()).indexOf("/Node01-Azur/azur-main.js") >= 0) engine.forceStop();
    });
    power.start();
    require("/sdcard/Node01-PDD/pdd-accessibility.js")(event);
    event("started");
    ensureNetwork();
    var catalog = openCatalog();
    result.actions.push("open_private_browser_epic");
    var offers = policy.freeOffers(catalog.nodes);
    for (var i = 0; i < offers.length; i++) {
        var offer = offers[i];
        var outcome = { title: offer.title, status: "started" };
        result.offers.push(outcome);
        if (i > 0) catalog = openCatalog();
        var card = catalog.nodes.filter(function (item) { return item.desc === offer.description; })[0];
        if (!card) throw Error("Current giveaway card changed: " + offer.title);
        tap(card.node);
        result.actions.push("open_offer:" + offer.title);
        var product = waitForPage(["product", "login"], 60000, offer.title);
        if (product.state === "login") {
            signIn();
            product = waitForPage(["product"], 90000, offer.title);
        }
        if (policy.isOwned(product.nodes, offer.title)) {
            outcome.status = "already_owned";
            if (product.nodes.some(function (item) { return /通过\s*Epic Games Store\s*登录游戏.*免费领取/.test(item.text); })) {
                outcome.promotion = "requires_in_game_login";
            }
            continue;
        }
        if (product.state !== "product") throw Error("Product not ready: " + product.state);
        getOffer(product, offer.title);
        var checkout = waitForPage(["checkout", "login"], 90000, offer.title);
        if (checkout.state === "login") {
            signIn();
            checkout = waitForPage(["checkout", "product"], 90000, offer.title);
            if (checkout.state === "product") {
                getOffer(checkout, offer.title);
                checkout = waitForPage(["checkout"], 90000, offer.title);
            }
        }
        if (!policy.canAddToLibrary(checkout.nodes, offer.title)) {
            outcome.checkout_state = checkout.state;
            outcome.checkout_prices = checkout.nodes.map(function (item) { return item.text; }).filter(function (label) { return /^[¥￥$€£]/.test(label); });
            throw Error("Matching zero-total checkout not verified: " + checkout.state);
        }
        outcome.zero_total_verified = true;
        exactButton("添加到库");
        result.actions.push("add_to_library:" + offer.title);
        var completed = waitForPage(["success"], 90000);
        if (completed.state !== "success") throw Error("Purchase result not confirmed: " + completed.state);
        outcome.purchase_confirmed = true;
        // Leave the optional publisher email-sharing checkbox untouched.
        exactButton("继续浏览");
        var owned = waitForPage(["product"], 60000, offer.title);
        if (!policy.isOwned(owned.nodes, offer.title)) throw Error("Server library state not confirmed");
        outcome.status = "claimed_and_owned";
        outcome.verified_at = new Date().toISOString();
    }
    result.status = "completed";
    capture("completed");
} catch (error) {
    result.status = "error";
    result.error = String(error);
    event("error", { message: result.error });
    try { capture("error"); } catch (captureError) { result.capture_error = String(captureError); }
} finally {
    files.remove("/sdcard/Node01-Azur/daily-resume.json");
    try { power.finish(); } catch (powerError) { result.power_error = String(powerError); }
    result.finished_at = new Date().toISOString();
    files.ensureDir(outputPath);
    files.write(outputPath, JSON.stringify(result, null, 2));
    files.write(runDir + "/summary.json", JSON.stringify(result, null, 2));
    event("finished", result);
    toastLog("Penrix Epic: " + result.status);
}
