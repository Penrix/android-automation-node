const {test}=require('node:test'),assert=require('node:assert/strict');
const boot=require('../autojs/azur-startup.js');
const frame=(...text)=>text.map(text=>({text}));
test('actual game clock screen is a screensaver, not unreadable resources',()=>{
 assert.equal(boot.classify(frame('06:12PM','自72%','SUNDAY / NOV / 08 /2026')),'screensaver');
});
test('recovers the live Daily Raid page instead of waiting on a loading screen',()=>{
 const fs=require('node:fs');
 const daily=JSON.parse(fs.readFileSync('evidence/20261106-recovery/startup-timeout.json','utf8'));
 assert.equal(boot.classify(daily),'menu');
 assert.equal(boot.recoverable({code:'STARTUP_TIMEOUT'}),true);
});
test('actual game title and monthly reward are startup states',()=>{
 assert.equal(boot.classify(frame('隐私政策','用户协议','服务器','触摸屏幕执行权限认证')),'login');
 assert.equal(boot.classify(frame('获得道具','心智魔方','点击继续')),'reward');
 assert.equal(boot.classify(frame('商店','建造','出击')),'home');
});
test('full dock after a previous attempt goes to retirement during startup',()=>{
 const dialog=require('../evidence/20261118-dock-full/dock-full.json');
 assert.equal(boot.classify(dialog),'dock_full_dialog');
});
test('upcoming maintenance announcement is closed rather than treated as current downtime',()=>{
 assert.equal(boot.classify(frame('系统公告','11月5日维护','服务器维护中')),'announcement');
 assert.equal(boot.classify(frame('服务器正在维护，请稍后重试')),'maintenance');
 assert.equal(boot.classify(frame('信息','服务器维护','确定')),'maintenance');
 assert.equal(boot.classify(frame('系统公告','港区建设升级中...','预计开服时间2026年11月5日15:00','X')),'maintenance');
});
test('resource download waits, confirmation starts update, client replacement stays distinct',()=>{
 assert.equal(boot.classify(frame('资源更新','下载中 48%','确定')),'updating');
 assert.equal(boot.classify(frame('资源更新，需要下载 200MB','确定')),'update_confirm');
 assert.equal(boot.classify(frame('更新提示irem','本次更新需要下载100MB的文件，是否继续更新？','取消','确定','正在下载资源配置文件:painting_filte/painting_filte_list_change')),'update_confirm');
 assert.equal(boot.classify(frame('客户端版本过低','前往更新')),'client_update');
 assert.equal(boot.classify(frame('信息','指挥官，当前客户端的游戏版本不是最新的，推荐您重','新打开游戏进行更新','确定')),'restart_update');
 assert.equal(boot.recoverable({code:'GAME_UPDATE_RESTART'}),true);
});
test('network failure can restart but unrelated foreground or coin fullness cannot',()=>{
 for(const code of ['GAME_NOT_RUNNING','GAME_STUCK','NETWORK_ERROR'])assert.equal(boot.recoverable({code}),true);
 for(const code of ['FOREGROUND_CHANGED',undefined])assert.equal(boot.recoverable({code}),false);
 assert.equal(boot.classify(frame('网络连接中断，请重新登录')),'network_error');
});
for(const maintenance of [frame('服务器维护','确定'),frame('系统公告','港区建设升级中...','X')])test('maintenance retries actual '+maintenance[0].text+' dialog then logs in and updates',()=>{
 const fs=require('node:fs'),vm=require('node:vm');let now=0,index=0;
 const frames=[maintenance,maintenance,frame('服务器','用户协议','触摸屏幕'),frame('资源更新，需要下载200MB','确定'),frame('资源更新','下载中48%'),frame('商店','建造')];
 const actions=[],events=[];class Clock extends Date{constructor(value){super(value===undefined?now:value);}static now(){return now;}}
 const ctx={module:{exports:{}},Date:Clock,shell(){},sleep(ms){now+=ms;}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../autojs/azur-startup.js'),'utf8'),ctx);
 let current;
 const r={resetProcess(){},focus:()=> 'u0 com.bilibili.azurlane/MainActivity',scan(){current=frames[index++];if(!current)throw Error('Unexpected scan');return current;},save(){},log:(event,data)=>events.push({event,data,at:now}),word(re){const found=current.find(n=>re.test(n.text));if(found)actions.push({text:found.text,at:now});return !!found;},button:()=>false};
 assert.equal(ctx.module.exports.start(r,false),'home');
 assert.equal(events.filter(e=>e.event==='maintenance_retry').length,1);
 assert.ok(actions[0].at>=300000);assert.equal(actions[0].text,maintenance[maintenance.length-1].text);
 assert.ok(actions.some(a=>a.text==='触摸屏幕'));assert.ok(actions.some(a=>a.text==='确定'));
});
