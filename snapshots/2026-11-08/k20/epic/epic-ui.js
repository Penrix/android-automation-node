// Shared by the AutoJs6 task and offline tests. Labels come from the K20's real WebView tree.
function freeOffers(nodes) {
    var result = [];
    nodes.forEach(function (node) {
        var label = String(node.desc || "");
        var match = /^Free Games, \d+ of \d+, Free Now, (.+), Free Now - /.exec(label);
        if (match && !result.some(function (item) { return item.title === match[1]; })) {
            result.push({ title: match[1], description: label });
        }
    });
    return result;
}

function pageState(nodes) {
    var labels = nodes.map(function (node) { return String(node.text || "") + " " + String(node.desc || ""); }).join("\n");
    if (/请完成安全检查以继续|请验证您是真人|Please complete a security check|Verify you are human/i.test(labels)) return "challenge";
    if (nodes.some(function (node) { return node.text === "全归您啦"; }) && nodes.some(function (node) { return node.text === "谢谢您的购买。"; })) return "success";
    if (nodes.some(function (node) { return node.text === "结账"; }) && /Payment by Epic Games/.test(labels)) return "checkout";
    if (nodes.some(function (node) { return node.id === "email"; }) && /登录 Epic Games|Sign in to Epic Games/i.test(labels)) return "login";
    if (nodes.some(function (node) { return node.id === "password"; }) && nodes.some(function (node) { return node.id === "sign-in"; }) && /输入密码/.test(labels)) return "login";
    if (freeOffers(nodes).length) return "catalog";
    if (isFreeProduct(nodes)) return "product";
    return "loading";
}

function isFreeProduct(nodes) {
    return nodes.some(function (node) {
        return /^免费，原价为 .+，-100%。优惠截止于/.test(String(node.text || ""));
    });
}

function hasTitle(nodes, title) {
    var localized = title === "Flotsam" ? "浮游世界" : title;
    return nodes.some(function (node) {
        var text = String(node.text || "").trim().replace(/^《(.+)》$/, "$1");
        return text === title || text === localized;
    });
}

function canAddToLibrary(nodes, title) {
    var texts = nodes.map(function (node) { return String(node.text || "").trim(); });
    var prices = texts.filter(function (text) { return /^[¥￥$€£]/.test(text); });
    return pageState(nodes) === "checkout" && hasTitle(nodes, title) &&
        texts.indexOf("这是免费内容。添加到库即可开始体验。") >= 0 && texts.indexOf("添加到库") >= 0 &&
        prices.length > 0 && prices.every(function (price) { return /^[¥￥$€£]\s*0\.00$/.test(price); });
}

function isOwned(nodes, title) {
    return hasTitle(nodes, title) &&
        nodes.some(function (node) { return node.text === "已在库中"; });
}

module.exports = { freeOffers: freeOffers, pageState: pageState, isFreeProduct: isFreeProduct, hasTitle: hasTitle, canAddToLibrary: canAddToLibrary, isOwned: isOwned };
