// GPL-3.0-only. Buy-food flow and templates follow ALAS RewardDorm.
function text(n){return n.text.replace(/\s/g,'');}
function x(n){return (n.bounds.left+n.bounds.right)/2;}
function y(n){return (n.bounds.top+n.bounds.bottom)/2;}
function oil(items){
 var cap=items.filter(function(n){return /^MAX[:：]?[\dG]+$/i.test(text(n))&&n.bounds.top<25&&x(n)>700&&x(n)<900;});
 var amount=items.filter(function(n){return /^\d+\+?$/.test(text(n))&&n.bounds.top>=15&&n.bounds.bottom<65&&n.bounds.left>730&&n.bounds.left<850;});
 if(cap.length!==1||amount.length!==1)return null;
 return {amount:Number(text(amount[0]).replace(/\D/g,'')),cap:Number(text(cap[0]).replace(/G/ig,'6').replace(/\D/g,''))};
}
function digit(items,left,right,top,bottom){
 var found=items.filter(function(n){return /^\d+$/.test(text(n))&&x(n)>left&&x(n)<right&&y(n)>top&&y(n)<bottom;});
 return found.length===1?Number(text(found[0])):null;
}
function buy(r,wanted){
 var items=r.scan();
 if(!r.find(/^海军咖喱$/)||!r.find(/^确定$/))throw Error('Oil food purchase dialog not recognized');
 var quantity=digit(items,770,870,360,410),cost=digit(items,770,850,420,465);
 if(quantity!==1||cost!==50)throw Error('Oil food unit cost changed');
 var plus=r.match('FOOD_PLUS'),ten=r.find(/^\+10$/);
 if(!plus||!ten)throw Error('Oil food quantity controls missing');
 wanted=Math.max(1,Math.min(999,Math.floor(wanted)));
 var tens=Math.floor((wanted-1)/10),ones=(wanted-1)%10;
 for(var i=0;i<tens;i++)r.tap(x(ten),y(ten),'oil_food_plus10',80);
 for(var j=0;j<ones;j++)r.tap(plus.x,plus.y,'oil_food_plus',80);
 items=r.scan();quantity=digit(items,750,880,360,410);cost=digit(items,750,870,420,465);
 if(!quantity||quantity>wanted||cost!==quantity*50)throw Error('Oil food quantity/cost not confirmed');
 r.save('oil-food-before-buy');
 for(var attempt=0;attempt<3;attempt++){
  if(!r.find(/^海军咖喱$/)||!r.find(/^取消$/))break;
  if(!r.word(/^确定$/))throw Error('Oil food confirm missing');
  sleep(1500);r.scan();
 }
 r.save('oil-food-after-buy');
 if(r.find(/^海军咖喱$/)&&r.find(/^取消$/))throw Error('Oil food purchase did not finish');
 r.log('oil_food_purchase',{quantity:quantity,cost:cost});return cost;
}
function run(r,force){
 var nav=require('./azur-navigation.js');nav.home(r);
 var before=oil(r.scan());
 if(!before&&require('./azur-startup.js').classify(r.scan())==='screensaver'){
  nav.home(r);before=oil(r.scan());
 }
 if(!before){r.save('oil-unreadable');throw Error('Oil balance unreadable');}
 if(!force&&before.amount<before.cap)return 0;
 var wanted=Math.max(10,Math.ceil((before.amount-Math.max(5000,before.cap-2000))/50));
 wanted=Math.min(wanted,Math.floor((before.amount-5000)/50));
 if(wanted<1)return 0;
 var opened=false;
 for(var step=0;step<12;step++){
  r.scan();
  if(r.find(/^海军咖喱$/)&&r.find(/^确定$/)){opened=true;break;}
  if(r.find(/^投食$/)&&r.find(/^无视$/)){r.word(/^投食$/);}
  else if(r.find(/已经没有东西吃|大家都饿/)){if(!r.word(/^确定$/))throw Error('Dorm empty-food notice cannot close');}
  else if(r.find(/^食物5000$/)){if(!r.button('DORM_BUY_FOOD_ENTER'))throw Error('Food purchase entry not found');}
  else if(r.find(/食量.*\//)){r.word(/食量.*\//);}
  else if(r.find(/后宅/)){r.word(/后宅/);}
  else if(r.find(/^生活区$/)){r.word(/^生活区$/);}
  else{r.save('oil-navigation-unrecognized');throw Error('Dorm oil spending navigation unrecognized');}
  sleep(1500);
 }
 if(!opened)throw Error('Dorm oil spending navigation timed out');
 var cost=buy(r,wanted);nav.home(r);
 var after=oil(r.scan());
 if(!after||after.amount!==before.amount-cost)throw Error('Oil food purchase balance not confirmed');
 r.log('oil_spent_confirmed',{before:before.amount,after:after.amount,cap:after.cap,cost:cost});
 return cost;
}
module.exports={oil:oil,buy:buy,run:run};
