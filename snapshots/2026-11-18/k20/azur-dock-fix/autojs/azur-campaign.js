function clearInterrupted(r){
 if(!r.find(/自律寻敌/)||!r.find(/^撤退$/))return false;
 r.save('interrupted-sortie');r.word(/^撤退$/);r.scan();
 if(r.find(/^取消$/)&&r.find(/^确定$/)){r.word(/^确定$/);r.scan();}
 if(r.find(/自律寻敌/) && r.find(/^撤退$/))throw Error('Interrupted sortie withdrawal not completed');
 r.log('interrupted_sortie_withdrawn',{counted_as_success:false});return true;
}
function enter(r){
 r.scan();if(r.find(/^立刻前往$/)&&r.find(/^2[-－—]4(?:救援约克城)?$/)){r.tap(1226,178,'close_stage_detail');r.scan();}
 clearInterrupted(r);
 if(!r.find(/^第2章$/)&&!r.find(/^主线$/)){
  require('./azur-navigation.js').home(r);
  if(!r.word(/^出击$/)&&!r.button('MAIN_GOTO_CAMPAIGN'))throw Error('Campaign entry missing');r.scan();clearInterrupted(r);
 }
 if(!r.find(/^第2章$/)){if(!r.word(/^主线$/))throw Error('Main story entry missing');r.scan();}
 if(r.find(/^普通$/)){r.word(/^普通$/);r.scan();}
 if(!r.find(/^困难$/))throw Error('Normal map mode not confirmed');r.save('stage-page');
 if(!r.word(/^2\s*[-－—]\s*4(?:救援约克城)?$/))throw Error('Stage 2-4 not visible');r.scan();r.save('stage-detail');
}
function checkCapacity(r){
 if(r.find(/船坞.*已满|船坞.*不足/)){
  r.save('sortie-dock-full');
  var organize=r.find(/^信息$/)&&r.find(/^(?:拓展|扩展)$/)&&r.find(/^强化$/);
  if(!(organize&&r.word(/^整理$/))&&!r.word(/^取消$/))throw Error('Dock full without a recognized Organize or Cancel button');
  var error=Error('Dock full before continuing 2-4');error.code='DOCK_FULL';throw error;
 }
 if(r.find(/物资.*上限|物资已满/)){
  r.save('sortie-coins-full');
  if(!r.find(/继续出击/)||!r.find(/^取消$/)||!r.word(/^(确定|继续出击)$/))throw Error('Coin capacity prompt not recognized');
  r.log('sortie_continued_at_coin_cap',{});r.scan();
 }
}
function begin(r){
 r.scan();checkCapacity(r);
 if(r.find(/^舰队选择$/)){if(!r.word(/^立刻前往$/))throw Error('Fleet start missing');r.scan();checkCapacity(r);r.save('sortie-start');return;}
 enter(r);if(!r.find(/^立刻前往$/)||!r.find(/安全海域/))throw Error('Safe 2-4 stage detail missing');
 var p=images.pixel(r.image(),1068,596);
 if(!(colors.green(p)>170&&colors.red(p)<190&&colors.blue(p)<170)){
  r.tap(1068,596,'enable_auto_search');r.scan();p=images.pixel(r.image(),1068,596);
  if(!(colors.green(p)>170&&colors.red(p)<190&&colors.blue(p)<170))throw Error('Auto search checkbox not enabled');
 }
 if(!r.word(/^立刻前往$/))throw Error('Immediate start missing');r.scan();checkCapacity(r);r.save('fleet-preparation');
 if(!r.find(/^舰队选择$/)||!r.word(/^立刻前往$/))throw Error('Fleet start missing');r.scan();checkCapacity(r);r.save('sortie-start');
}
function run(r){
 begin(r);var began=Date.now();
 for(var step=0;Date.now()-began<15*60*1000;step++){
  var items=r.scan();if(step%10===0){r.save('sortie-watch-'+step);r.log('sortie_watch',{elapsed_ms:Date.now()-began,text:items.map(function(n){return n.text;}).join(' ')});}
  checkCapacity(r);
  if(r.find(/自律战斗时可能出现/) && r.word(/^知道了$/)){r.log('auto_battle_notice_closed',{});continue;}
  var exit=r.match('AUTO_SEARCH_MENU_EXIT'),again=r.match('AUTO_SEARCH_MENU_CONTINUE');
  if(exit&&again){r.save('sortie-complete');r.log('sortie_complete',{stage:'2-4',elapsed_ms:Date.now()-began});r.tap(exit.x,exit.y,'auto_search_exit');return {stage:'2-4',elapsed_ms:Date.now()-began};}
  if(r.find(/获得道具/)&&r.word(/点击继续/))continue;
  if(r.find(/获得角色|获得新角色/)&&r.word(/点击继续/))continue;
  sleep(4000);
 }
 var error=Error('2-4 sortie timed out');error.code='GAME_STUCK';throw error;
}
module.exports={enter:enter,begin:begin,run:run,checkCapacity:checkCapacity};
