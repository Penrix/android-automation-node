function home(r){
 for(var i=0;i<10;i++){
  var items=r.scan();
  if(!items.length){r.log('home_transition_wait',{attempt:i+1});sleep(2000);continue;}
  if(require('./azur-startup.js').classify(items)==='screensaver'){r.tap(780,360,'exit_game_screensaver');continue;}
  if(r.find(/^投食$/)&&r.find(/^无视$/)){r.word(/^无视$/);continue;}
  if(r.find(/食量.*\//)&&r.find(/^管理$/)){r.tap(110,45,'dorm_return_home',1800);continue;}
  if(r.find(/可派出舰队/)){r.tap(1444,34,'commission_home');continue;}
  if(r.find(/^(军事委托|DELEGATION)$/i)){r.tap(1050,340,'close_quick_panel');continue;}
  if(r.find(/世界巡游[·・.第]|^WORLDCRUISE$/i)){r.tap(1503,34,'port_cruise_home');continue;}
  if(r.find(/^商店$/)&&r.find(/^建造$/))return;
  if(r.find(/获得道[具县]/)&&r.word(/点击继续/))continue;
  if(r.find(/^SHIPTYPE$/i)&&r.find(/重复获得提示/)){r.tap(780,350,'dismiss_ship_reward');continue;}
  if(r.find(/系统公告|活动公告/)){if(r.word(/^[X×]$/)||r.button('LOGIN_ANNOUNCE')||r.button('LOGIN_ANNOUNCE_2'))continue;}
  if(r.find(/自律寻敌/)&&r.find(/^撤退$/)){r.tap(1444,34,'interrupted_map_home');continue;}
  if(r.find(/每日签到|活动总览|军火|舰船退役|已选中/)||r.find(/^(战术学院|军部研究室|队列详情|MISSIONS|TASKLIST|SETTING|D?AILYRAID|LYRAID)$/i)||r.find(/^第\d+章$/)||r.find(/^主线$/)||r.find(/^商店$/)||r.find(/^开始建造$/)){r.tap(1444,34,'menu_home');continue;}
  if(r.button('GOTO_MAIN'))continue;
  if(i===0)r.save('home-route-unknown');
  r.log('home_transition_wait',{attempt:i+1});sleep(2000);
 }
 r.save('home-route-timeout');var e=Error('Home route timed out');e.code='GAME_STUCK';throw e;
}
function shop(r){
 home(r);if(!r.word(/^商店$/))throw Error('Home shop missing');
 var until=Date.now()+20000;
 do{r.scan();if(r.word(/^补给道具$/))return;sleep(1200);}while(Date.now()<until);
 r.save('supply-shop-timeout');var e=Error('Supply shop did not load');e.code='GAME_STUCK';throw e;
}
function retire(r){home(r);if(!r.word(/^建造$/))throw Error('Build menu missing');r.scan();if(r.word(/^退役$/))return;if(r.find(/^开始建造$/)&&r.find(/^队列$/)){r.tap(112,478,'retire_tab');return;}throw Error('Retirement entry missing');}
module.exports={home:home,shop:shop,retire:retire};
