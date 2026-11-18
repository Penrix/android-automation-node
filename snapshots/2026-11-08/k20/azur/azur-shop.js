var policy=require('./azur-policy.js');
function gems(items){var a=items.filter(function(n){return n.bounds.left>1280&&n.bounds.left<1380&&n.bounds.top>=15&&n.bounds.bottom<65&&/^\d+\s*\+?$/.test(n.text.trim());});return a.length===1?Number(a[0].text.replace(/\D/g,'')):null;}
function offers(r,items){
 var template=images.read('/sdcard/Node01-Azur/assets/COINS_COST_LIVE.png');
 var matched=images.matchTemplate(r.image(),template,{threshold:0.8,max:20});template.recycle();
 var result=[];
 matched.matches.forEach(function(m){var p=m.point;if(p.x<280||p.x>1250||p.y<350||p.y>610)return;
  if(items.some(function(n){var b=n.bounds;return /已售/.test(n.text)&&Math.abs((b.left+b.right)/2-(p.x+22))<75&&b.top>p.y-125&&b.bottom<p.y-35;}))return;
  var crop=images.clip(r.image(),p.x+24,p.y-6,65,38),large=images.resize(crop,[195,114]),found=ocr.rapid.detect(large),words=[];
  for(var i=0;i<found.length;i++)words.push(String(found[i].label||found[i].text).replace(/\s/g,''));crop.recycle();large.recycle();
  // In the actual 600-coin card RapidOCR returns G00; the coin icon was matched separately.
  var digits=words.filter(function(s){return /^[\dG]+$/i.test(s);}).map(function(s){return s.replace(/G/ig,'6');});
  if(digits.length!==1){r.log('coin_price_unreadable',{x:p.x,y:p.y,words:words});return;}
  result.push({currency:'Coins',price:Number(digits[0]),x:p.x+22,y:p.y-90});
 });
 return result.sort(function(a,b){return a.y-b.y||a.x-b.x;});
}
function run(r,dry){
 var bought=[],seen={};
 r.scan();if(r.find(/^取消$/)&&r.find(/^兑换$/))r.word(/^取消$/);
 for(var step=0;step<12;step++){
  var items=r.scan();if(!r.find(/^军火$/)||!r.find(/后刷新/))throw Error('Coin shop page not recognized');
  var balance=policy.coins(items),gemBalance=gems(items);if(balance===null||gemBalance===null)throw Error('Currency balance unreadable');
  var all=offers(r,items);r.log('coin_offers',{balance:balance,offers:all});r.save('shop-'+step);
  if(dry)return all;
  var next=all.filter(function(o){return !seen[Math.round(o.x/100)+':'+Math.round(o.y/100)]&&policy.canBuy(o,balance);})[0];
  if(!next)break;var key=Math.round(next.x/100)+':'+Math.round(next.y/100);seen[key]=true;
  r.tap(next.x,next.y,'coin_item');r.scan();r.save('purchase-'+step);
  if(!r.find(/^取消$/)||!r.word(/^兑换$/))throw Error('Coin item exchange dialog missing');
  r.scan();r.save('obtained-'+step);if(!r.find(/获得道具/)||!r.word(/点击继续/))throw Error('Purchased item result missing');
  var afterItems=r.scan(),after=policy.coins(afterItems);if(after===null||after>=balance||gems(afterItems)!==gemBalance)throw Error('Coin-only purchase not confirmed');
  bought.push(next);r.log('coin_purchase_verified',{before:balance,after:after,actual_spent:balance-after,gems:gemBalance,item:next});
 }
 return bought;
}
module.exports={run:run};
