// K20 / AutoJs6 6.7.0: wallet's observed ten-second task only.
var base='/sdcard/Node01-Wallet',wallet='com.mipay.wallet',advertiser='com.kuaishou.nebula',advertisers=['com.kuaishou.nebula','com.ss.android.ugc.aweme.lite','com.ss.android.yumme.video','com.qidian.QDReader','com.phoenix.read'];
files.ensureDir(base+'/runs/');
var runId=new Date().toISOString().replace(/[:.]/g,'-'),dir=base+'/runs/'+runId;files.ensureDir(dir+'/');
var power=require('/sdcard/Node01-PDD/pdd-power.js');
var args=engines.myEngine().execArgv||{},audit=!!args.audit;
var summary={run_id:runId,started_at:new Date().toISOString(),audit:audit,status:'started',confirmed:0};
var date=String(java.time.LocalDate.now()),ledgerPath=base+'/claims.json';
var claims=files.exists(ledgerPath)?JSON.parse(files.read(ledgerPath)):[];
var widgetRoute=!!args.desktopWidget;
function todayCount(){return claims.filter(function(c){return c.date===date;}).length;}
function event(name,data){files.append(dir+'/events.jsonl',JSON.stringify({at:new Date().toISOString(),event:name,data:data||{}})+'\n');}
function capture(name){var result=shell('screencap -p '+dir+'/'+name+'.png',true);if(result.code!==0)throw Error('Screenshot failed');event('capture',{name:name});}
function nodes(){var c=textMatches(/.+/).packageName(wallet).find(),a=[];for(var i=0;i<c.size();i++){var n=c.get(i),b=n.bounds();if(b.width()>0&&b.height()>0&&b.top<device.height&&b.bottom>0)a.push({text:String(n.text()).replace(/\s/g,''),b:{left:b.left,top:b.top,right:b.right,bottom:b.bottom}});}return a;}
function pick(a,re){var found=a.filter(function(n){return re.test(n.text);});return found.length===1?found[0]:null;}
function tap(n,label){if(currentPackage()!==wallet)throw Error('Wallet lost foreground before '+label);var b=n.b;event('tap',{label:label,bounds:b});shell('input tap '+Math.round((b.left+b.right)/2)+' '+Math.round((b.top+b.bottom)/2),true);sleep(1200);}
function read(){var a=nodes();files.write(dir+'/last-tree.json',JSON.stringify(a,null,2));return a;}
function waitNode(re,ms){var end=Date.now()+ms;while(Date.now()<end){var a=read(),n=pick(a,re);if(n)return n;sleep(300);}return null;}
function ocrFrame(name){capture(name);var raw=images.read(dir+'/'+name+'.png'),factor=raw.getHeight()/1000,small=images.resize(raw,[Math.round(raw.getWidth()/factor),1000]);var result=ocr.rapid.detect(small),items=[];for(var i=0;i<result.length;i++){var v=result[i],b=v.bounds;items.push({text:String(v.label||v.text).replace(/\s/g,''),b:{left:b.left*factor,top:b.top*factor,right:b.right*factor,bottom:b.bottom*factor}});}raw.recycle();small.recycle();files.write(dir+'/'+name+'-ocr.json',JSON.stringify(items));return items;}
function openWidget(){
 for(var attempt=0;attempt<2;attempt++){
  if(attempt){event('widget_warm_wallet');shell('am force-stop '+wallet,true);shell('am start -W -n com.mipay.wallet/com.xiaomi.jr.app.MiFinanceActivity',true);sleep(3800);var refresh=shell('am broadcast -a miui.appwidget.action.APPWIDGET_UPDATE -n com.mipay.wallet/com.xiaomi.jr.widgets.video.VideoWidget --eia appWidgetIds 4',true);event('widget_refresh',{code:refresh.code});sleep(1000);}
  shell('input keyevent 3',true);sleep(750);
  var button=desc('去领会员').id('com.mipay.wallet:id/video_member_btn_layout').packageName(wallet).findOne(5000);
  if(!button||currentPackage()!=='com.miui.home')throw Error('玩家视界 desktop widget not found');
  var b=button.bounds();event('widget_entry',{attempt:attempt+1,x:b.centerX(),y:b.centerY()});
  shell('input tap '+b.centerX()+' '+b.centerY(),true);
  var until=Date.now()+8500,memberSeen=false;
  while(Date.now()<until){
   if(currentPackage()===wallet){
    var labels=read();
    if(labels.some(function(n){return /^(?:看10秒领会员|再看10秒继续领(?:时长|会员)|点击领会员|继续领取奖励|任务红包)$/.test(n.text);})){
     widgetRoute=true;summary.route='desktop_widget';capture('widget-entry');return;
    }
    memberSeen=memberSeen||labels.some(function(n){return /^(?:兑换会员|今日会员已领取|做任务领时长)$/.test(n.text);});
   }
   sleep(350);
  }
  capture('widget-timeout-'+attempt);event('widget_navigation_timeout',{reported:currentPackage(),focus:String(shell('dumpsys window windows | grep mCurrentFocus',true).result),labels:read().map(function(n){return n.text;})});
  if(attempt&&memberSeen){widgetRoute=true;summary.route='desktop_widget';capture('widget-no-task');return;}
 }
 throw Error('Desktop widget did not open membership after waking Wallet');
}
function navigate(fresh){shell('am start -W -n com.mipay.wallet/com.xiaomi.jr.app.MiFinanceActivity',true);sleep(3000);
 var a=read();if(pick(a,/^时长明细$/)){shell('input keyevent 4',true);sleep(1200);a=read();}
 var member=a.some(function(n){return /^(?:兑换会员|做任务领时长|看10秒领会员|再看10秒继续领时长|点击领会员|继续领取奖励|今日会员已领取)$/.test(n.text);});
 if(member){
  var panel=a.filter(function(n){return /^做任务领会员$/.test(n.text)&&n.b&&n.b.top>device.height*.4;})[0];
  if(panel)tap({b:{left:device.width*.92,right:device.width*.924,top:panel.b.top,bottom:panel.b.bottom}},'close_task_panel');
  if(!fresh||a.some(function(n){return /^(?:看10秒领会员|再看10秒继续领时长|继续领取奖励)$/.test(n.text);}))return;
  shell('input keyevent 4',true);sleep(1500);event('reload_membership');
 }
 if(widgetRoute){openWidget();return;}
 var chosen=null,end=Date.now()+12000;
 while(!chosen&&Date.now()<end){
  var entries=descContains('领视频会员').packageName(wallet).find();
  for(var i=0;i<entries.size();i++){var b=entries.get(i).bounds();if(b.width()>0&&b.width()<device.width*.8&&b.height()>0)chosen={b:{left:b.left,top:b.top,right:b.right,bottom:b.bottom}};}
  if(!chosen)sleep(400);
 }
 if(!chosen)throw Error('Wallet membership entry not found');tap(chosen,'membership_entry');sleep(3500);
}
function historyProof(since) {
 var a=ocrFrame('after-envelope');
 if(!a.some(function(n){return /你可以再领一次|桌面入口访问福利|专享再领一次/.test(n.text);})){
  sleep(2500);a=ocrFrame('reward-settled');
 }
 if(a.some(function(n){return /桌面入口访问福利|专享再领一次/.test(n.text);})){
  tap({b:{left:device.width*.49,right:device.width*.51,top:device.height*.687,bottom:device.height*.699}},'close_observed_desktop_promotion');sleep(1000);
 }else if(a.some(function(n){return /恭喜获得/.test(n.text);})&&a.some(function(n){return /你可以再领一次|做任务领时长/.test(n.text);})){
  var controls=clickable(true).packageName(wallet).find(),close=[];
  for(var j=0;j<controls.size();j++){var cb=controls.get(j).bounds();if(cb.width()>40&&cb.width()<120&&cb.height()>40&&cb.height()<120&&Math.abs(cb.centerX()-device.width/2)<80&&cb.top>device.height*.7&&cb.bottom<device.height*.85)close.push({b:{left:cb.left,top:cb.top,right:cb.right,bottom:cb.bottom}});}
  if(close.length!==1)throw Error('Reward result close button not uniquely found');tap(close[0],'close_reward_result');
 }
 var balance=pick(ocrFrame('balance').filter(function(n){return n.b.top>500&&n.b.bottom<800&&n.b.right<600;}),/^(?:\d+(?:\.\d+)?天[>〉]?|天[>〉])$/);
 if(!balance)throw Error('Balance entry unreadable');
 tap({b:{left:balance.b.right-30,right:balance.b.right-10,top:balance.b.top,bottom:balance.b.bottom}},'duration_history');
 if(!waitNode(/^时长明细$/,8000))throw Error('Duration history missing');capture('history');
 var items=read(),rows=[],seen={};
 items.forEach(function(n){var re=/获得玩家视界会员时长(\d{4}-\d\d-\d\d\d\d:\d\d:\d\d)(\+\d+(?:\.\d+)?天)/g,m;
 while((m=re.exec(n.text))!==null){var key=m[1]+m[2];if(seen[key])continue;seen[key]=true;var time=new java.text.SimpleDateFormat('yyyy-MM-ddHH:mm:ss').parse(m[1]).getTime();if(time>=since-2000)rows.push({timestamp:m[1],amount:m[2]});}
 });
 if(rows.length!==1)throw Error('New duration credit not uniquely confirmed');return rows[0];
}
function recordReward(proof){
 var words=JSON.stringify(proof);
 if(claims.some(function(c){return c.proof===words;}))return;
 var record={date:date,at:new Date().toISOString(),run_id:runId,route:widgetRoute?'desktop_widget':'wallet',proof:words};
 claims.push(record);files.write(ledgerPath,JSON.stringify(claims,null,2));summary.confirmed++;event('confirmed_reward',record);
}
function browse(claimReady){if(!args.claimReady&&!claimReady){
 var market='com.xiaomi.market',hongguo='com.phoenix.read',end=Date.now()+18000;
 while(Date.now()<end&&advertisers.indexOf(currentPackage())<0&&currentPackage()!==market)sleep(300);
 if(currentPackage()===wallet){var a=ocrFrame('jump-prompt'),promptText=a.map(function(n){return n.text;}).join(' ');if(!/浏览10秒/.test(promptText)||!/返回领取奖励/.test(promptText)||!/(快手极速版|抖音极速版)/.test(promptText))throw Error('Unrecognized advertiser prompt');var jump=pick(a,/点击立即跳转/);if(!jump)throw Error('Jump button missing');tap(jump,'observed_jump');}
 var until=Date.now()+15000;while(Date.now()<until&&advertisers.indexOf(currentPackage())<0&&currentPackage()!==market)sleep(300);
 if(currentPackage()===market){
  if(!text('红果免费短剧').packageName(market).findOne(8000)||!app.getAppName(hongguo))throw Error('Unexpected advertiser store detail');
  var openApp=desc('打开').packageName(market).findOne(5000);
  if(!openApp)throw Error('Installed advertiser open button missing');
  var targetBounds=openApp.bounds();event('open_advertiser_from_store',{package:hongguo});
  shell('input tap '+targetBounds.centerX()+' '+targetBounds.centerY(),true);
  until=Date.now()+15000;while(Date.now()<until&&currentPackage()!==hongguo)sleep(300);
  if(currentPackage()!==hongguo)throw Error('Hongguo did not open from store');
 }
 if(advertisers.indexOf(currentPackage())<0)throw Error('Observed advertiser foreground not reached');
 advertiser=currentPackage();
 if(text('个人信息保护指引').packageName(advertiser).exists()){var agree=text('同意').packageName(advertiser).findOnce();if(!agree)throw Error('Basic consent button missing');var b=agree.bounds();shell('input tap '+b.centerX()+' '+b.centerY(),true);sleep(1500);}
 event('ad_foreground',{package:advertiser});capture('ad-open');var began=Date.now(),deadline=began+45000,stableSince=0;
 while(!stableSince||Date.now()-stableSince<12000){
  if(Date.now()>deadline)throw Error('Advertiser did not stay foreground for twelve seconds');
  var focus=String(shell('dumpsys window windows | grep mCurrentFocus',true).result);
  var match=focus.match(/\bu\d+\s+([\w.]+)\//),active=match?match[1]:'';
  if(!active){stableSince=0;sleep(300);continue;}
  if(advertisers.indexOf(active)<0)throw Error('Ad interrupted by another app: '+active);
  if(active!==advertiser){advertiser=active;stableSince=0;event('advertiser_redirect',{package:active});}
  if(!stableSince)stableSince=Date.now();
  sleep(700);
 }
 event('ad_viewed',{package:advertiser,foreground_ms:Date.now()-stableSince});}
shell('am start -W -n com.mipay.wallet/com.xiaomi.jr.app.MiFinanceActivity',true);sleep(2000);navigate();
 var claimAt=Date.now();if(!pick(read(),/^任务红包$/)){var claim=waitNode(/^点击领会员$/,15000);if(!claim)throw Error('Return claim button not found');tap(claim,'claim_after_view');}
 var title=waitNode(/^领取奖励$/,8000);if(!title)throw Error('Reward envelope not shown');
 var open=waitNode(/^任务红包$/,3000);if(!open)throw Error('Observed envelope node not found');capture('envelope');tap(open,'open_reward');sleep(3000);
 recordReward(historyProof(claimAt));shell('input keyevent 4',true);sleep(1200);
}
try{
 event('started');
 if(!audit&&!args.verifyHistorySince&&todayCount()>=3){summary.status='daily_limit_reached';summary.today_confirmed=todayCount();}else{
  engines.all().forEach(function(engine){
   if(String(engine.getSource()).indexOf('/Node01-Azur/azur-main.js')>=0)engine.forceStop();
  });
  power.start();require('/sdcard/Node01-PDD/pdd-accessibility.js')(event);
 if(!args.resumeAdvertisement){
  if(!audit&&!args.claimReady&&!args.verifyHistorySince&&todayCount()>=2)openWidget();
  else navigate(!args.claimReady&&!args.verifyHistorySince&&!pick(read(),/^点击领会员$/)&&!(pick(read(),/^领取奖励$/)&&pick(read(),/^任务红包$/)));
 }
 capture('prepared');
 if(args.verifyHistorySince){summary.history_proof=historyProof(args.verifyHistorySince);if(args.recoverCredit)recordReward(summary.history_proof);summary.status='history_verified';}
 else if(args.resumeAdvertisement||args.claimReady){browse();summary.status='confirmed_success';}
 else if(audit){summary.status='audit_complete';}else{
  for(var round=todayCount();round<3;round++){
   if(round>=2&&!widgetRoute)openWidget();
   var a=read();if((pick(a,/^领取奖励$/)&&pick(a,/^任务红包$/))||pick(a,/^点击领会员$/)){browse(true);summary.status='confirmed_success';continue;}
   var start=pick(a,/^继续领取奖励$/)||pick(a,/^(?:看10秒领会员|再看10秒继续领(?:时长|会员))$/);
   if(!start&&!widgetRoute){openWidget();a=read();start=pick(a,/^(?:继续领取奖励|看10秒领会员|再看10秒继续领(?:时长|会员))$/);}
   if(!start){summary.status=pick(a,/^今日会员已领取$/)?'already_claimed':'entry_not_available';break;}
   tap(start,'ten_second_task');browse();summary.status='confirmed_success';
  }
  summary.today_confirmed=todayCount();
 }
}
}catch(e){summary.status='error';summary.error=String(e);event('error',{message:String(e)});try{capture('error');}catch(ignore){}}
finally{try{power.finish();}catch(e){summary.power_error=String(e);}summary.finished_at=new Date().toISOString();files.write(dir+'/summary.json',JSON.stringify(summary,null,2));files.write(base+'/last-run.json',JSON.stringify(summary,null,2));event('finished',summary);toastLog('Wallet: '+summary.status);}
