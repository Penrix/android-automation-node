var base='/sdcard/Node01-Wallet',wallet='com.mipay.wallet';
var trialTitle=/^(?:连续\d+天)?试用.+$/;
var claimAction=/^领取(?:奖励)?$/;
var openAction=/^(?:去完成|去试用|试用\d+s|打开|观看|去观看)$/;
var power=require('/sdcard/Node01-PDD/pdd-power.js');
var result={started:new Date().toISOString(),tasks:[],status:'started'};
files.ensureDir(base+'/');
var runDir=base+'/runs/download-'+new Date().toISOString().replace(/[:.]/g,'-');files.ensureDir(runDir+'/');
function log(name,data){files.append(runDir+'/events.jsonl',JSON.stringify({at:new Date().toISOString(),event:name,data:data||{}})+'\n');}
function ensureAccess(){require('/sdcard/Node01-PDD/pdd-accessibility.js')(log);}
function tap(n){if(!n)throw Error('Required button missing');var b=n.bounds();log('tap',{text:String(n.text()||n.desc()),x:b.centerX(),y:b.centerY()});shell('input tap '+b.centerX()+' '+b.centerY(),true);sleep(1200);}
function exact(value,timeout){return text(value).packageName(wallet).findOne(timeout||2000);}
function todayDone(){return textContains('今日试用已完成').packageName(wallet).exists()||textContains('明日再来可领').packageName(wallet).exists()||text('明天再来').packageName(wallet).exists();}
function taskEntry(){
 var row=textMatches(/^做任务(?:\s*加速领.*)?$/).packageName(wallet).find(),buttons=text('去领取').packageName(wallet).find(),matches=[];
 for(var i=0;i<buttons.size();i++){
  var button=buttons.get(i),y=button.bounds().centerY();
  for(var j=0;j<row.size();j++)if(Math.abs(row.get(j).bounds().centerY()-y)<85){matches.push(button);break;}
 }
 return matches.length===1?matches[0]:null;
}
function panel(){
 shell('am start -W -n com.mipay.wallet/com.xiaomi.jr.app.MiFinanceActivity',true);sleep(2500);
 if(exact('时长明细',300)){shell('input keyevent 4',true);sleep(1200);}
 if(exact('任务红包',300))throw Error('Pending ad envelope must be completed before trial');
 if(textMatches(trialTitle).packageName(wallet).exists())return;
 if(!taskEntry()){
  var shortcut=null,deadline=Date.now()+12000;
  while(!shortcut&&Date.now()<deadline){
   var list=descContains('领视频会员').packageName(wallet).find();
   for(var i=0;i<list.size();i++){
    var node=list.get(i),bounds=node.bounds();
    if(bounds.width()>0&&bounds.width()<device.width*.8&&bounds.height()>0)shortcut=node;
   }
   if(!shortcut)sleep(400);
  }
  if(!shortcut)throw Error('Wallet membership entry not found');
  tap(shortcut);sleep(2500);
 }
 var entry=taskEntry(),until=Date.now()+8000;
 while(!entry&&Date.now()<until){sleep(400);entry=taskEntry();}
 if(!entry)throw Error('Wallet trial entry is not beside the membership task row');
 tap(entry);
 textMatches(trialTitle).packageName(wallet).findOne(5000);
}
function taskRows(){
 var titles=textMatches(trialTitle).packageName(wallet).find();
 var buttons=textMatches(/^(?:去下载|下载|去完成|去试用|试用\d+s|打开|观看|去观看|领取|领取奖励)$/).packageName(wallet).find();
 var rows=[];
 for(var j=0;j<titles.size();j++){
  var title=titles.get(j),bounds=title.bounds(),matches=[];
  if(bounds.height()<=0)continue;
  for(var i=0;i<buttons.size();i++){
   var button=buttons.get(i),b=button.bounds();
   if(b.height()>0&&b.centerX()>bounds.centerX()&&Math.abs(b.centerY()-bounds.centerY())<100)matches.push(button);
  }
  if(matches.length===1)rows.push({title:String(title.text()),button:matches[0]});
 }
 return rows.filter(function(row){return rows.filter(function(other){return other.title===row.title;}).length===1;});
}
function rowButton(title){
 var row=taskRows().filter(function(row){return row.title===title;})[0];
 return row?row.button:null;
}
function foregroundPackage(){
 var focus=String(shell('dumpsys window windows | grep mCurrentFocus',true).result);
 var match=focus.match(/\bu\d+\s+([\w.]+)\//);
 return match?match[1]:'';
}
function isTrialApp(pkg){
 return !!pkg&&pkg!==wallet&&!/^(?:android|com\.miui\.(?:home|securitycenter)|com\.xiaomi\.market|com\.android\.(?:systemui|settings|launcher3|packageinstaller|permissioncontroller)|com\.(?:miui|google\.android)\.(?:packageinstaller|permissioncontroller)|org\.autojs\.autojs6)$/.test(pkg);
}
function trial(task,run){
  var button=task.button,action=String(button.text());
  if(claimAction.test(action)){tap(button);run.status='claim_clicked_check_receipt';return;}
  tap(button);
  var opened=openAction.test(action),target='',until=Date.now()+(opened?30000:180000);
  if(!opened){var download=exact('点击立即下载',1500);if(download)tap(download);}
  while(Date.now()<until){
   var pkg=foregroundPackage();
   if(isTrialApp(pkg)){target=pkg;break;}
   if(pkg===wallet){
    ensureAccess();
    var next=rowButton(task.title);
    if(next&&claimAction.test(String(next.text()))){tap(next);run.status='claim_clicked_check_receipt';return;}
    if(!opened&&next&&openAction.test(String(next.text()))){tap(next);opened=true;until=Date.now()+30000;}
   }
   sleep(800);
  }
  if(!target)throw Error('Wallet trial did not open an app: '+task.title);
  run.package=target;
  if(text('个人信息保护指引').packageName(target).exists()){
   var agree=text('同意').packageName(target).findOnce();
   if(!agree)throw Error('Trial basic consent button missing');
   tap(agree);sleep(1500);
  }
  var start=Date.now();log('trial_app_opened',{task:task.title,package:target});
  while(Date.now()-start<35000){
   var active=foregroundPackage();
   if(active!==target)throw Error('Trial interrupted by foreground change: '+active);
   sleep(700);
  }
  run.foreground_ms=Date.now()-start;log('trial_viewed',{task:task.title,ms:run.foreground_ms});ensureAccess();panel();sleep(2000);
  var claim=rowButton(task.title);
  if(claim&&claimAction.test(String(claim.text()))){tap(claim);run.status='claim_clicked_check_receipt';}
  else run.status=todayDone()?'today_completed_wait_tomorrow':'returned_check_reward';
}
try{
 power.start();ensureAccess();panel();
 var labels=textMatches(/.*(?:试用|下载|领取|完成).*/).packageName(wallet).find(),rows=[];
 for(var i=0;i<labels.size();i++){var n=labels.get(i),b=n.bounds();if(b.height()>0)rows.push({text:String(n.text()),y:b.centerY()});}
 log('trial_panel',{rows:rows});
 var seen={};
 for(var round=0;round<2;round++){
  var task=taskRows().filter(function(row){return !seen[row.title];})[0];
  if(!task)break;
  seen[task.title]=true;
  var run={task:task.title,status:'started'};result.tasks.push(run);
  trial(task,run);
 }
 result.status=result.tasks.length?'trial_flow_finished':(todayDone()?'today_completed_wait_tomorrow':'no_trial_available');
 var dismiss=text('关闭提醒我也能来').packageName(wallet).findOne(1500);
 if(dismiss){tap(dismiss);result.reminder_closed=!text('关闭提醒我也能来').packageName(wallet).exists();}
 var header=textMatches(/做任务.*领会员/).packageName(wallet).findOnce();
 if(header&&header.bounds().top>device.height*.4){shell('input tap '+Math.round(device.width*.922)+' '+header.bounds().centerY(),true);sleep(700);result.task_panel_closed=!textMatches(/做任务.*领会员/).packageName(wallet).exists();}
}catch(e){result.status='error';result.error=String(e);}
finally{shell('screencap -p '+runDir+'/result.png',true);power.finish();result.finished=new Date().toISOString();files.write(runDir+'/summary.json',JSON.stringify(result,null,2));files.write(base+'/download-last.json',JSON.stringify(result,null,2));log('finished',result);toastLog('Wallet trial: '+result.status);}
