var game='com.bilibili.azurlane';
function failure(code,message){var e=Error(message);e.code=code;return e;}
function classify(items){
 var labels=items.map(function(n){return n.text.replace(/\s/g,'');}),s=labels.join(' ');
 function has(re){return labels.some(function(t){return re.test(t);});}
 if(has(/^(可派出舰队|军事委托|DELEGATION|军部研究室|队列详情|WORLDCRUISE)$/i)||has(/世界巡游[·・.第]/))return 'menu';
 if(has(/^委托大?成功$/))return 'commission_reward';
 if(has(/^商店$/)&&has(/^建造$/))return 'home';
 if(has(/^\d{1,2}:\d{2}\s*[AP]M$/i)&&has(/(?:MON|TUES|WEDNES|THURS|FRI|SATUR|SUN)DAY\s*\//i))return 'screensaver';
 if(/港区建设升级中/.test(s))return 'maintenance';
 if(/系统公告|活动公告/.test(s))return 'announcement';
 if(/服务器正在维护|服务器维护|维护期间无法登录|服务器尚未开放/.test(s))return 'maintenance';
 if(/游戏版本不是最新.*重新打开游戏.*更新/.test(labels.join('')))return 'restart_update';
 if(/客户端版本过低|请更新客户端|必须更新游戏|新版本客户端|前往更新/.test(s))return 'client_update';
 if(/是否继续更新/.test(s)&&has(/^取消$/)&&has(/^确定$/))return 'update_confirm';
 if(/资源.*更新|更新.*资源|下载资源/.test(s))return /下载中|正在下载|更新中|正在解压|正在校验|\d+[%％]/.test(s)?'updating':'update_confirm';
 if(/网络连接中断|连接服务器失败|服务器连接失败|NetworkDown|网络异常|请重新登录/.test(s))return 'network_error';
 if(/碧蓝航线.*停止运行|碧蓝航线.*无响应/.test(s))return 'crash';
 if(/获得道[具县]/.test(s)&&/点击继续/.test(s))return 'reward';
 if(has(/^SHIPTYPE$/i)&&has(/重复获得提示/))return 'menu';
 if(/触摸屏幕|PRESS.*START|TOUCH.*START|点击更换/.test(s)&&/服务器|用户协议|隐私政策/.test(s))return 'login';
 if(/用户协议|隐私政策/.test(s)&&has(/^(同意|同意并继续)$/))return 'agreement';
 if(/手机号|验证码|账号密码|输入密码/.test(s)&&has(/^登录$/))return 'authentication_required';
 if(/舰队选择/.test(s))return 'fleet_dialog';
 if(/2[-－—]4.*救援约克城/.test(s)&&has(/^立刻前往$/))return 'stage_dialog';
 if(/停止自律|自律寻敌/.test(s))return 'active_sortie';
 if(has(/^取消$/)&&has(/^兑换$/))return 'purchase_dialog';
 if(/每日签到|活动总览|已选中|军火|开始建造/.test(s)||has(/^(战术学院|MISSIONS|TASKLIST|SETTING|D?AILYRAID|LYRAID)$/i)||has(/^第\d+章$/)||has(/^主线$/)||has(/^商店$/))return 'menu';
 return 'loading';
}
function recoverable(error){return ['GAME_NOT_RUNNING','GAME_STUCK','NETWORK_ERROR','GAME_UPDATE_RESTART','STARTUP_TIMEOUT'].indexOf(error.code)>=0;}
function start(r,restart){
 shell('input keyevent 224',true);
 if(restart)shell('am force-stop '+game,true);
 r.resetProcess();
 shell('monkey -p '+game+' -c android.intent.category.LAUNCHER 1',true);
 var began=Date.now(),deadline=began+120000,updateWait=false,clientUpdate=false,last='',maintenanceRetryAt=0;
 while(Date.now()<deadline){
  var focus=r.focus(),m=focus.match(/\bu\d+\s+([\w.]+)\//),pkg=m?m[1]:'';
  var launcher=/^(com\.miui\.home|com\.android\.launcher3|android)$/.test(pkg);
  var installer=/^(com\.miui\.packageinstaller|com\.android\.packageinstaller|com\.google\.android\.packageinstaller|com\.xiaomi\.market|com\.xiaomi\.gamecenter)$/.test(pkg);
  if(pkg&&pkg!==game&&!launcher&&!(clientUpdate&&installer)){
   if(clientUpdate){r.scan(true);r.save('client-update-external');throw failure('CLIENT_UPDATE_REQUIRED','Game opened external updater '+pkg+'; inspect actual official download page');}
   throw failure('FOREGROUND_CHANGED','Other app took foreground: '+pkg);
  }
  if(maintenanceRetryAt&&Date.now()<maintenanceRetryAt){sleep(5000);continue;}
  var items=r.scan(true),action=classify(items);
  if(action!==last){r.save('startup-'+action);r.log('startup_state',{state:action,package:pkg});last=action;}
  if(pkg!==game){
   if(action==='crash')throw failure('GAME_NOT_RUNNING','Game crash dialog');
   if(clientUpdate&&installer){
    var text=items.map(function(n){return n.text;}).join('');
    if(/碧蓝航线/.test(text)){
     if(r.word(/^(更新|安装|继续安装)$/,pkg)){sleep(2000);continue;}
     if(r.word(/^打开$/,pkg)){sleep(2000);continue;}
     if(r.word(/^完成$/,pkg)){shell('monkey -p '+game+' -c android.intent.category.LAUNCHER 1',true);continue;}
    }
    sleep(3000);continue;
   }
   if(Date.now()-began>10000&&!/^\d/.test(String(shell('pidof '+game,true).result).trim()))throw failure('GAME_NOT_RUNNING','Game process did not remain running');
   sleep(1000);continue;
  }
  if(action==='home'){r.log('startup_ready',{elapsed_ms:Date.now()-began});return 'home';}
  if(action==='screensaver'){r.tap(780,360,'exit_game_screensaver');continue;}
  if(action==='reward'){r.word(/点击继续/);continue;}
  if(action==='commission_reward'){r.tap(780,665,'commission_exp_continue',1400);continue;}
  if(action==='announcement'){if(!r.word(/^[X×]$/)&&!r.button('LOGIN_ANNOUNCE')&&!r.button('LOGIN_ANNOUNCE_2'))throw failure('ANNOUNCEMENT_UNKNOWN','Announcement close button not recognized');continue;}
  if(action==='login'){
   if(!r.word(/触摸屏幕|PRESS.*START|TOUCH.*START/)&&!r.button('LOGIN_CHECK'))r.tap(1445,530,'observed_title_start');
   sleep(2000);continue;
  }
  if(action==='agreement'){r.word(/^(同意|同意并继续)$/);continue;}
  if(action==='network_error')throw failure('NETWORK_ERROR','Game reports network/login connection failure');
  if(action==='crash')throw failure('GAME_NOT_RUNNING','Game reports crash or ANR');
  if(action==='restart_update')throw failure('GAME_UPDATE_RESTART','Game requests a restart to update');
  if(action==='maintenance'){
   if(!maintenanceRetryAt){
    maintenanceRetryAt=Date.now()+5*60000;deadline=maintenanceRetryAt+120000;
    r.log('maintenance_wait',{retry_at:new Date(maintenanceRetryAt).toISOString()});
   }else{
    if(!r.word(/^(确定|确认)$/)&&!r.word(/^[X×]$/))throw failure('MAINTENANCE_DIALOG_UNKNOWN','Maintenance dismiss button not recognized');
    r.log('maintenance_retry',{});maintenanceRetryAt=0;deadline=Date.now()+120000;sleep(2000);
   }
   continue;
  }
  if(action==='client_update'){
   clientUpdate=true;if(!updateWait){deadline=Date.now()+30*60000;updateWait=true;}
   if(!r.word(/^(前往更新|立即更新|更新游戏)$/)&&!r.button('LOGIN_GAME_UPDATE'))throw failure('CLIENT_UPDATE_REQUIRED','Client update entry not recognized');
   sleep(3000);continue;
  }
  if(action==='updating'||action==='update_confirm'){
   if(!updateWait){deadline=Date.now()+30*60000;updateWait=true;}
   if(action==='update_confirm')r.word(/^(确定|确认|立即更新|开始下载|下载)$/);
   sleep(3000);continue;
  }
  if(action==='authentication_required')throw failure('AUTHENTICATION_REQUIRED','Game account login needs credentials or verification');
  if(action==='fleet_dialog'){r.tap(1298,123,'close_fleet_dialog');continue;}
  if(action==='stage_dialog'){r.tap(1226,178,'close_stage_dialog');continue;}
  if(action==='purchase_dialog'){r.word(/^取消$/);continue;}
  if(action==='menu'||action==='active_sortie'){require('./azur-navigation.js').home(r);continue;}
  sleep(1500);
 }
 throw failure(updateWait?'UPDATE_WAIT_TIMEOUT':'STARTUP_TIMEOUT','Startup did not reach home; see final startup frame');
}
module.exports={classify:classify,recoverable:recoverable,start:start};
