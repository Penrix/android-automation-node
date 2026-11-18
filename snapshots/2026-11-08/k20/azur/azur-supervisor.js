var base='/sdcard/Node01-Azur',game='com.bilibili.azurlane';
var main=base+'/azur-main.js',self=base+'/azur-supervisor.js',me=engines.myEngine();
if(engines.all().some(function(e){return e.id!==me.id&&String(e.getSource()).indexOf(self)>=0;}))exit();

var previous='',lastStart=0,taskWasRunning=false,resumeAfterTask=false;
var keyguard=context.getSystemService('keyguard');
function log(state,data){
 if(previous===state)return;previous=state;
 files.append(base+'/supervisor-events.jsonl',JSON.stringify({at:new Date().toISOString(),state:state,data:data||{}})+'\n');
}
function read(path){
 try{return JSON.parse(files.read(path));}catch(e){return {};}
}
function reserved(now){
 var seconds=now.getHours()*3600+now.getMinutes()*60+now.getSeconds();
 return ['/sdcard/Node01-PDD','/sdcard/Penrix-Epic','/sdcard/Node01-Wallet'].some(function(dir){
  var s=read(dir+'/schedule.json'),times=s.times||s.prepare_times||[s.local_time||s.time];
  return times.some(function(time){
   if(!/^\d\d:\d\d$/.test(time))return false;
   var pieces=time.split(':'),due=Number(pieces[0])*3600+Number(pieces[1])*60;
   var delta=(seconds-due+86415)%86400-15;
   return delta>=-15&&delta<=30;
  });
 });
}
function foreground(){
 var state=String(shell('dumpsys window windows | grep mCurrentFocus',true).result);
 var match=state.match(/\bu\d+\s+([\w.]+)\//);return match?match[1]:'';
}
function idle(){
 var state=String(shell('dumpsys power | grep mLastUserActivityTime=',true).result);
 var match=state.match(/\((\d+) ms ago\)/);
 return !!match&&Number(match[1])>=90000;
}
files.append(base+'/supervisor-events.jsonl',JSON.stringify({at:new Date().toISOString(),state:'supervisor_started'})+'\n');
// The root watchdog restarts this supervisor after Android kills AutoJs.
// Resume the interrupted daily job before farming; its own receipt checks skip completed work.
var pending=read(base+'/daily-resume.json');
if(['/sdcard/Node01-Wallet/wallet-daily.js','/sdcard/Penrix-Epic/epic-claim.js'].indexOf(pending.path)>=0&&
 !engines.all().some(function(e){return String(e.getSource())===pending.path;})){
 log('resume_interrupted_daily',{path:pending.path});engines.execScriptFile(pending.path);
}
while(true){
 try{
  files.write(base+'/supervisor-heartbeat',String(Math.floor(Date.now()/1000)));
  var azur=null,busy=false;
  engines.all().forEach(function(e){
   if(e.id===me.id)return;
   if(String(e.getSource()).indexOf(main)>=0)azur=e;else busy=true;
  });
  if(taskWasRunning&&!busy)resumeAfterTask=true;
  taskWasRunning=busy;
  var paused=files.exists(base+'/autofarm-paused'),scheduled=reserved(new Date());
  if(paused||busy||scheduled){
   if(azur)azur.forceStop();
   log(paused?'paused':busy?'daily_task_running':'scheduled_task_window');
  }else if(azur){log('farming');}
  else if(keyguard.isDeviceLocked()){
   if(!keyguard.isDeviceSecure()){
    shell('input keyevent 224; wm dismiss-keyguard',true);log('wake_unsecured_keyguard');
   }else log('waiting_unlock');
  }
  else{
   var last=read(base+'/last-run.json'),finished=Date.parse(last.finished_at||'');
   var retryAfter=last.status==='error'&&isFinite(finished)?finished+60000:0;
   var pkg=foreground();
   if(Date.now()<Math.max(lastStart+15000,retryAfter))log('restart_wait');
   else if(resumeAfterTask||pkg===game||pkg==='com.miui.home'||!device.isScreenOn()||idle()){
    log('start_farming',{previous_app:pkg,after_task:resumeAfterTask});
    resumeAfterTask=false;lastStart=Date.now();engines.execScriptFile(main);
   }else log('waiting_for_idle',{package:pkg});
  }
 }catch(e){log('supervisor_error',{message:String(e)});}
 sleep(5000);
}
