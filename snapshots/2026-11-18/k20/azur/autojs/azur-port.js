function label(n){return n.text.replace(/\s/g,'');}
function x(n){return (n.bounds.left+n.bounds.right)/2;}
function y(n){return (n.bounds.top+n.bounds.bottom)/2;}
function isPanel(r){return r.find(/海军食堂|^CANTEEN$/i)&&r.find(/军事委托|^DELEGATION$/i);}
function isMissions(r){return r.find(/^MISSIONS$/i)||r.find(/^TASKLIST$/i);}
function rewardVisible(r){return r.find(/获得道[具县]|^GETITEMS$/i)&&r.find(/点击继续/);}
function cruisePage(r){return r.find(/世界巡游[·・.第]|^WORLDCRUISE$/i)&&r.find(/基础巡游奖励|^REGULAR$/i);}
function panelAmount(items,center){
 return items.find(function(n){return /^[1-9]\d{0,5}$/.test(label(n))&&Math.abs(x(n)-center)<49&&y(n)>59&&y(n)<105;});
}
function openPanel(r){
 require('./azur-navigation.js').home(r);
 r.tap(83,230,'port_open',1200);
 return r.scan();
}
function collectBuildings(r){
 var items=openPanel(r);
 if(!isPanel(r)){r.save('port-panel-unrecognized');return;}
 var buildings=[{name:'oil',x:201},{name:'coins',x:372},{name:'exp',x:546}];
 buildings.forEach(function(building){
  var number=panelAmount(items,building.x);
  if(!number||!isPanel(r))return;
  var amount=Number(label(number));
  r.tap(building.x,47,'port_building_'+building.name,1100);items=r.scan();
  if(r.find(/资源.*上限.*无法领取/)){
   r.save('port-building-cap-'+building.name);
   r.log('port_building_capped',{building:building.name,amount:amount});
  }else if(rewardVisible(r)){
   r.save('port-building-'+building.name);r.word(/点击继续/);items=r.scan();
   r.log('port_building_reward',{building:building.name,amount:amount});
  }else if(isPanel(r)){
   var remaining=panelAmount(items,building.x);
   if(remaining&&Number(label(remaining))<amount){
    r.save('port-building-'+building.name);
    r.log('port_building_reward',{building:building.name,amount:amount-(remaining?Number(label(remaining)):0)});
   }else r.log('port_building_unconfirmed',{building:building.name,amount:amount});
  }
 });
}
function handleTactical(r){
 var started=0;
 for(var step=0;step<22;step++){
  var items=r.scan(),text=items.map(label).join('');
  if(!items.length)continue;
  if(/学习完成/.test(text)&&/继续学习/.test(text)){
   r.save('port-tactical-complete-'+step);
   r.word(/^确定$/);continue;
  }
  if(/选择技能/.test(text)&&r.find(/^开始课程$/)){
   var skill=items.find(function(n){return /\d+\/\d+$/.test(label(n))&&x(n)>920&&x(n)<1080&&y(n)>195&&y(n)<530;});
   if(skill){r.tap(685,y(skill)-35,'port_tactical_unfinished_skill');r.word(/^开始课程$/);continue;}
  }
  if(/获得技能经验/.test(text)&&r.find(/^开始课程$/)){
   var books=items.filter(function(n){return /EXP150[%％]/i.test(label(n))&&y(n)>270&&y(n)<435;});
   books.sort(function(a,b){return Math.abs(y(a)-y(b))>18?y(a)-y(b):x(b)-x(a);});
   if(books.length){
    r.tap(x(books[0]),y(books[0])+34,'port_tactical_matching_book');r.scan();
    if(r.find(/教材T[1-3]/)&&r.word(/^开始课程$/))continue;
   }
   r.word(/^取消$/);continue;
  }
  if(/消耗1本/.test(text)&&/教材T[1-3]/.test(text)&&/训练.*技能/.test(text)&&r.find(/^确定$/)){
   r.save('port-tactical-book-'+step);r.word(/^确定$/);started++;continue;
  }
  if(isPanel(r)||r.find(/^战术学院$|^TACTICAL$/i)){
   var timers=items.map(label).filter(function(t){return /^\d{1,2}:\d{2}:\d{2}$/.test(t);});
   r.save('port-tactical-end');r.log('port_tactical_end',{training_confirmations:started,timers:timers});return;
  }
  r.save('port-tactical-unrecognized');return;
 }
}
function collectTactical(r){
 var items=r.scan();
 if(!isPanel(r)||!r.find(/^战术学院$/))return;
 var ready=items.find(function(n){return /^完成$/.test(label(n))&&x(n)>440&&x(n)<610&&y(n)>389&&y(n)<442;});
 if(ready){r.tap(x(ready),y(ready),'port_tactical_complete');handleTactical(r);}
}
function collectResearch(r){
 var items=r.scan();
 if(!isPanel(r)||!r.find(/^军部研究室$/))return;
 var ready=items.find(function(n){return /^完成$/.test(label(n))&&x(n)>440&&x(n)<610&&y(n)>518&&y(n)<570;});
 if(!ready)return;
 r.tap(x(ready),y(ready),'port_research_complete');r.scan();
 if(r.find(/^军部研究室$/)){
  if(!r.word(/^领取奖励$/)){
   r.tap(89,272,'port_research_queue');r.scan();
   if(r.find(/^队列详情$/)&&r.find(/^(研发完成|已完成|已结束)$/))r.tap(1468,356,'port_research_queue_claim');
  }
  r.scan();
 }
 if(rewardVisible(r)){
  r.save('port-research-reward');r.word(/点击继续/);r.log('port_research_reward',{});
 }else r.save('port-research-unconfirmed');
}
function weeklyPack(r){
 var items=r.scan();
 var oil=items.find(function(n){return /^\d{3,5}$/.test(label(n))&&x(n)>750&&x(n)<835&&y(n)>25&&y(n)<49;});
 if(!oil||Number(label(oil))>=21000){
  r.log('port_weekly_pack_deferred',{oil:oil?Number(label(oil)):null});return;
 }
 if(!r.word(/^商店$/))return;
 r.scan();
 if(!r.word(/^优惠礼包$/))return;
 for(var i=0;i<3;i++){
  items=r.scan();
  var pack=items.find(function(n){return /^每周.*(?:补给|礼包|物资)/.test(label(n))&&y(n)>200&&y(n)<290;});
  var free=pack&&items.find(function(n){return /^免费(?:领取)?$/.test(label(n))&&Math.abs(x(n)-x(pack))<85&&y(n)>583&&y(n)<658;});
  if(free){
   r.tap(x(free),y(free),'port_weekly_free_pack');r.scan();
   if(r.find(/每周.*礼包/)&&r.find(/免费/)&&r.word(/^(确定|领取)$/))r.scan();
   if(rewardVisible(r)){r.save('port-weekly-pack-reward');r.word(/点击继续/);r.log('port_weekly_pack_reward',{});}
   else r.save('port-weekly-pack-unconfirmed');
   return;
  }
  if(i<2)r.swipe(1170,485,325,485,'port_pack_scroll');
 }
 r.log('port_weekly_pack_not_available',{});
}
function collectCruise(r){
 if(isPanel(r)){
  if(!r.word(/^世界巡游$/))return;
  r.scan();
 }
 if(!cruisePage(r))return;
 var claim=r.find(/^全部领取$/);
 if(claim&&x(claim)>1260&&y(claim)>565){
  r.tap(x(claim),y(claim),'port_cruise_free_rewards');
  for(var i=0;i<10;i++){
   r.scan();
   if(rewardVisible(r)){
    r.save('port-cruise-reward-'+i);r.word(/点击继续/);r.log('port_cruise_reward',{});continue;
   }
   if(r.find(/^SHIPTYPE$/i)){
    r.save('port-cruise-ship-'+i);r.tap(780,350,'port_cruise_ship_result');continue;
   }
   if(cruisePage(r))break;
   r.save('port-cruise-unrecognized');break;
  }
 }
 if(cruisePage(r))r.tap(1503,34,'port_cruise_home');
}
function sweepTacticalDialog(r){
 if(!r.find(/战术研修/)||!r.word(/^快速挑战[1-3]次$/))return;
 for(var i=0;i<5;i++){
  r.scan();
  if(rewardVisible(r)){
   r.save('port-daily-sweep-'+i);r.word(/点击继续/);r.log('port_daily_sweep_reward',{stage:'战术研修'});continue;
  }
  if(r.find(/是否.*快速挑战/)&&r.word(/^确定$/))continue;
  break;
 }
}
function sweepTactical(r){
 if(!r.word(/^出击$/))return;
 r.scan();if(!r.word(/^每日挑战$/))return;
 var items=r.scan();
 if(!r.find(/^(D?AILYRAID|LYRAID)$/i))return;
 var remaining=items.find(function(n){return /^[1-3]\/3$/.test(label(n))&&x(n)>655&&x(n)<730&&y(n)>106&&y(n)<151;});
 if(!remaining)return;
 r.tap(775,360,'port_daily_tactical');
 r.scan();
 if(!r.find(/战术研修/)||!r.find(/今日可挑战次数/))return;
 r.tap(680,230,'port_daily_top_difficulty');
 r.scan();sweepTacticalDialog(r);
}
function claimMissions(r,tab){
 for(var i=0;i<24;i++){
  var items=r.scan();
  if(r.find(/^SHIPTYPE$/i)&&r.find(/重复获得提示/)){
   r.save('port-mission-ship-'+tab+'-'+i);
   r.tap(780,350,'port_mission_ship_result');
   continue;
  }
  if(!isMissions(r)){r.save('port-missions-unrecognized-'+tab);return;}
  var claim=items.find(function(n){return /^全部领取$/.test(label(n))&&x(n)>1160&&y(n)<72;})||
            items.find(function(n){
             if(!/^领取$/.test(label(n))||x(n)<1170||y(n)<85||y(n)>683)return false;
             var color=images.pixel(r.image(),Math.round(x(n)),Math.round(y(n))+25);
             return colors.blue(color)-colors.red(color)>65;
            });
  if(!claim){r.save('port-missions-'+tab);return;}
  r.tap(x(claim),y(claim),'port_mission_claim_'+tab,1100);r.scan();
  if(rewardVisible(r)){
   r.save('port-mission-reward-'+tab+'-'+i);r.word(/点击继续/);
   r.log('port_mission_reward',{tab:tab});
  }else{
   r.save('port-mission-claim-unconfirmed-'+tab);
   return;
  }
 }
}
function run(r){
 var nav=require('./azur-navigation.js');
 collectBuildings(r);
 collectTactical(r);
 if(!isPanel(r))openPanel(r);
 collectResearch(r);
 if(!isPanel(r))openPanel(r);
 collectCruise(r);
 nav.home(r);
 sweepTactical(r);
 nav.home(r);
 r.scan();
 if(!r.word(/^任务$/)){r.save('port-mission-entry-unrecognized');return;}
 claimMissions(r,'all');
 var weekly=isMissions(r)&&r.scan().find(function(n){return /^每周$/.test(label(n))&&x(n)<165;});
 if(weekly){
  r.tap(x(weekly),y(weekly),'port_weekly_tab');
  claimMissions(r,'weekly');
 }
 nav.home(r);
 weeklyPack(r);
 nav.home(r);
}
module.exports={run:run,collectBuildings:collectBuildings,sweepTacticalDialog:sweepTacticalDialog};
