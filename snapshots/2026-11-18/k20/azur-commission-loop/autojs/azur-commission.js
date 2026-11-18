function text(node){return node.text.replace(/\s/g,'');}
function x(node){return (node.bounds.left+node.bounds.right)/2;}
function y(node){return (node.bounds.top+node.bounds.bottom)/2;}
function tap(r,node){r.tap(x(node),y(node),text(node),1400);}
function quickPanel(items){return items.some(function(n){return /军事委托|^DELEGATION$/i.test(text(n))&&x(n)<470&&y(n)<350;});}
function rowAction(items,re){
 return items.find(function(n){return re.test(text(n))&&x(n)>440&&x(n)<610&&y(n)>250&&y(n)<311;});
}
function listPage(items){
 return items.some(function(n){return /可派出舰队/.test(text(n))&&y(n)<55;});
}
function receive(r){
 var rewards=0,opened=false;
 for(var attempt=0;attempt<26;attempt++){
  var items=r.scan();
  if(r.match('OIL_MAXED')){
   r.save('commission-oil-maxed');r.log('commission_oil_maxed',{});
   if(!r.word(/^确定$/)&&!r.word(/^取消$/))throw unrecognized('Oil maxed notice cannot close');
   if(!require('./azur-oil.js').run(r,true))throw unrecognized('Oil headroom could not be confirmed');
   opened=false;continue;
  }
  var success=items.some(function(n){return /委托大?成功/.test(text(n))&&y(n)<220;});
  if(success){
   r.save('commission-exp-'+attempt);r.tap(780,665,'commission_exp_continue',1400);continue;
  }
  if(r.find(/获得道[具县]|GETITEMS/)&&r.find(/点击继续/)){
   r.save('commission-reward-'+rewards);r.word(/点击继续/);rewards++;r.log('commission_reward_received',{count:rewards});continue;
  }
  if(listPage(items))return rewards;
  if(quickPanel(items)){
   var action=rowAction(items,/^(完成|前往)$/);
   if(action){tap(r,action);opened=true;continue;}
  }else if(!opened&&r.find(/^商店$/)&&r.find(/^建造$/)){
   r.tap(83,230,'commission_quick_panel',1300);opened=true;continue;
  }
  sleep(600);
 }
 r.save('commission-receive-unrecognized');
 throw unrecognized('Commission reward or list not recognized');
}
function unrecognized(message){var error=Error(message);error.code='COMMISSION_UI';return error;}
function slots(items){
 var n=items.find(function(n){return /^\d\/\d$/.test(text(n))&&x(n)>1080&&x(n)<1225&&y(n)<55;});
 if(!n)throw unrecognized('Commission slot count not recognized');
 return Number(text(n)[0]);
}
function duration(n){
 var m=text(n).match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
 return m?(Number(m[1])*3600+Number(m[2])*60+Number(m[3])):0;
}
function title(name){return name.replace(/^(BIW|NYB)/i,'').replace(/[IVXⅠⅡⅢⅣⅤⅥⅦⅧ\d]+$/i,'');}
function rewardRank(name,cube){
 var type=title(name);
 if(/^(要员|度假|巡视)护卫$/.test(type))return 0;
 if(cube||/^(解救商船|敌袭|舰队.*演习)$/.test(type))return 1;
 if(/油田开发/.test(type))return 2;
 if(/^高阶战术研发$/.test(type))return 3;
 if(/^日常资源开发$/.test(type))return 4;
 if(/^(近海防卫巡逻|海域浮标检查作业|前沿基地防卫巡逻|远距离航行训练)$/.test(type))return 5;
 return 6;
}
function rareOil(name,seconds){
 var type=title(name),minutes=seconds/60;
 if(/^要员护卫$/.test(type)&&minutes===120)return 10;
 if(/^度假护卫$/.test(type)&&minutes===240)return 20;
 if(/^巡视护卫$/.test(type)&&minutes===480)return 30;
 if(type==='解救商船')return ({90:5,135:15,240:25})[minutes]||0;
 if(type==='敌袭')return ({105:10,180:20,360:30})[minutes]||0;
 return 0;
}
function oilCost(r,items,row){
 var label=items.find(function(n){return /^消耗[：:]?$/.test(text(n));});
 if(!label)return null;
 var expected=rareOil(row.name,row.seconds);
 var shown=items.find(function(n){return /^\d{1,4}$/.test(text(n))&&x(n)>1242&&x(n)<1292&&Math.abs(y(n)-y(label))<13;});
 if(shown){var value=Number(text(shown));return value===0||value===expected?value:null;}
 var frame=r.image(),middle=Math.round(y(label)),left=1292,right=1242,top=middle+14,bottom=middle-12;
 function stroke(px,py){
  var color=images.pixel(frame,px,py);
  return colors.red(color)>155&&colors.green(color)>155&&colors.blue(color)>155;
 }
 var glyphs=0,prior=false;
 for(var px=1242;px<=1292;px++){
  var ink=false;
  for(var py=middle-12;py<=middle+14;py++){
   if(stroke(px,py)){ink=true;left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);}
  }
  if(ink&&!prior)glyphs++;
  prior=ink;
 }
 if(bottom-top<11||bottom-top>17)return null;
 if(expected&&glyphs===String(expected).length&&left>=1248&&right<=1290)return expected;
 if(left<1264||right>1277||right-left<4||right-left>8)return null;
 var cx=Math.floor((left+right)/2),cy=Math.floor((top+bottom)/2);
 return stroke(cx,top)&&stroke(cx,bottom)&&stroke(left,cy)&&stroke(right,cy)&&!stroke(cx,cy)?0:null;
}
function rowsOnScreen(items,frame,cubeIcon){
 return items.reduce(function(rows,n){
  var name=text(n);
  if(!/^(?:BIW|NYB)?[\u4e00-\u9fff]{2,}[IVXⅠⅡⅢⅣⅤⅥⅦⅧ\d]*$/i.test(name)||x(n)<500||x(n)>740||y(n)<85||y(n)>650)return rows;
  var timer=items.find(function(t){return x(t)>605&&x(t)<742&&y(t)-y(n)>25&&y(t)-y(n)<65&&duration(t)>0;});
  if(!timer)return rows;
  var running=items.some(function(s){return /^进行中$/.test(text(s))&&x(s)>480&&x(s)<607&&Math.abs(y(s)-y(timer))<14;});
  var cube=false;
  if(cubeIcon&&!running&&/^日常资源开发|^高阶战术研发/.test(name)){
   var top=Math.max(0,Math.round(y(n))-30);
   cube=!!images.findImage(frame,cubeIcon,{region:[1185,top,120,Math.min(102,720-top)],threshold:0.88});
  }
  rows.push({name:name,node:n,seconds:duration(timer),running:running,ready:!running&&/:00$/.test(text(timer)),cube:cube});
  return rows;
 },[]);
}
function walkList(r,cubeIcon,visit){
 var previous='';
 for(var i=0;i<6;i++){
  var items=r.scan(),rows=rowsOnScreen(items,r.image(),cubeIcon),page=rows.map(function(row){return title(row.name)+':'+(row.running?'running':row.seconds)+':'+row.cube;}).join('|');
  var found=visit(items,rows);
  if(found)return found;
  if(!page||page===previous||i===5)break;
  previous=page;r.swipe(690,610,690,260,'commission_scroll');
 }
 return null;
}
function compare(a,b){
 var rank=rewardRank(a.name,a.cube),other=rewardRank(b.name,b.cube);
 if(rank!==other)return rank-other;
 if(rank===0)return b.seconds-a.seconds;
 if(a.tab!==b.tab&&rank===1)return a.tab==='urgent'?-1:1;
 return a.seconds-b.seconds;
}
function sameCandidate(row,choice){
 if(!row.ready||row.seconds!==choice.seconds||row.cube!==choice.cube)return false;
 return row.name===choice.name||(rewardRank(choice.name,choice.cube)===0&&title(row.name)===title(choice.name));
}
function confirmOil(r,cost,items){
 var message=r.find(/^本次委托需要花费(\d+)石油$/);
 if(!message)return items;
 var shown=Number(text(message).match(/(\d+)石油$/)[1]);
 if(!r.find(/^取消$/)||cost<=0||shown!==cost){
  r.save('commission-oil-confirm-unrecognized');
  r.word(/^取消$/);
  throw unrecognized('Commission oil confirmation does not match detail: '+shown+' versus '+cost);
 }
 if(!r.word(/^确定$/))throw unrecognized('Commission oil confirmation button missing');
 r.log('commission_oil_confirmed',{oil:shown});
 return r.scan();
}
function rewindList(r){
 r.scan();
 var frame=r.image(),top=0,bottom=0;
 for(var py=76;py<685;py+=4){
  var c=images.pixel(frame,1477,py);
  if(colors.red(c)>220&&colors.green(c)>185&&colors.blue(c)<105){if(!top)top=py;bottom=py;}
 }
 if(top>84){var middle=(top+bottom)/2;r.swipe(1477,middle,1477,middle-top+76,'commission_scroll_top');}
}
function dispatch(r,free,cubeIcon,urgentOnly){
 var next=Infinity,choices=[],seen={},tab='';
 (urgentOnly?['urgent']:['urgent','daily']).forEach(function(name){
  selectTab(r,name);tab=name;
  walkList(r,cubeIcon,function(items,rows){
   rows.forEach(function(row){
    if(row.running)next=Math.min(next,Date.now()+row.seconds*1000);
    var key=name+'|'+row.name+'|'+row.seconds+'|'+row.cube;
    if(free&&row.ready&&!seen[key]&&(!urgentOnly||rewardRank(row.name,row.cube)===0)){
     seen[key]=true;row.tab=name;choices.push(row);
    }
   });
   return !free;
  });
 });
 choices.sort(compare);
 r.log('commission_priority_order',{candidates:choices.map(function(row){return {name:row.name,tab:row.tab,rank:rewardRank(row.name,row.cube),cube_icon:row.cube};})});
 for(var i=0;i<choices.length&&free;i++){
  var choice=choices[i],name=choice.tab;
  if(free===1&&rewardRank(choice.name,choice.cube)>0){
   r.log('commission_slot_reserved_for_gems',{free:free});break;
  }
  selectTab(r,name,tab===name);tab=name;
  rewindList(r);
  var row=walkList(r,cubeIcon,function(items,rows){
   return rows.find(function(row){return sameCandidate(row,choice);});
  });
  if(!row){r.log('commission_candidate_skipped',{name:choice.name,tab:tab,reason:'row_not_found'});continue;}
  tap(r,row.node);var items=r.scan();
  var recommended=r.find(/^推荐$|^ADVICE$/i),start=r.find(/^开始$|^START$/i);
  var detail=items.some(function(n){return title(text(n))===title(row.name)&&x(n)>500&&x(n)<740&&y(n)<155;})&&
   items.some(function(n){return duration(n)===row.seconds&&x(n)>605&&x(n)<742&&y(n)>145&&y(n)<195;});
  var cost=detail&&recommended&&start?oilCost(r,items,row):null;
  if(cost===null){
   r.save('commission-skipped-'+tab+'-'+i);r.log('commission_candidate_skipped',{name:row.name,tab:tab,reason:detail?'allowed_cost_or_buttons_unconfirmed':'detail_unconfirmed'});
   continue;
  }
  tap(r,recommended);items=r.scan();
  start=r.find(/^开始$|^START$/i);
  if(!start)throw unrecognized('Commission start button not recognized after recommendation');
  tap(r,start);items=confirmOil(r,cost,r.scan());
  if(slots(items)===free){
   r.save('commission-start-unconfirmed-'+tab+'-'+i);r.log('commission_candidate_skipped',{name:row.name,tab:tab,reason:'slot_count_unchanged'});
   continue;
  }
  if(slots(items)!==free-1)throw unrecognized('Unexpected commission slot count after dispatch');
  free--;r.save('commission-dispatched-'+tab+'-'+i);r.log('commission_started',{name:row.name,tab:tab,seconds:row.seconds,free:free,reward_rank:rewardRank(row.name,row.cube),oil:cost,cube_icon:row.cube});
  var current=rowsOnScreen(items).find(function(n){return n.running&&title(n.name)===title(row.name);});
  next=Math.min(next,Date.now()+(current?current.seconds:row.seconds)*1000);
 }
 return next;
}
function selectTab(r,tab,reset){
 if(reset)r.tap(111,tab==='daily'?250:155,'commission_tab_reset',500);
 r.tap(111,tab==='daily'?155:250,'commission_tab_'+tab,900);
}
function run(r,urgentOnly){
 var rewards=receive(r);
 r.save('commission-list');
 var free=slots(r.scan()),cubeIcon=free?images.read('/sdcard/Node01-Azur/assets/COMMISSION_CUBE.png'):null,next;
 try{next=dispatch(r,free,cubeIcon,urgentOnly);}
 finally{if(cubeIcon)cubeIcon.recycle();}
 free=slots(r.scan());
 var remaining=next-Date.now();
 var delay=Math.max(0,free?Math.min(remaining,600000):(isFinite(remaining)?remaining:600000))+15000;
 r.log('commission_cycle',{reward_popups:rewards,free:free,urgent_only:!!urgentOnly,next_check_seconds:delay/1000});
 return {due:Date.now()+delay,free:free};
}
module.exports={run:run,rewardRank:rewardRank,compare:compare,rareOil:rareOil,sameCandidate:sameCandidate,confirmOil:confirmOil};
