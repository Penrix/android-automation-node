// SPDX-License-Identifier: GPL-3.0-only
// Rarity colors and retirement semantics adapted from LmeSzinc/AzurLaneAutoScript.
var rarityColors={N:[174,176,187],R:[106,195,248],SR:[151,134,254],SSR:[248,223,107]};
function rarity(rgb){
 var keys=Object.keys(rarityColors);
 for(var i=0;i<keys.length;i++){
  var c=rarityColors[keys[i]];
  if(Math.max(Math.abs(rgb[0]-c[0]),Math.abs(rgb[1]-c[1]),Math.abs(rgb[2]-c[2]))<=15)return keys[i];
 }
 return 'unknown';
}
function retireEligible(ship){return ['N','R','SR'].indexOf(ship.rarity)>=0&&ship.locked===false&&ship.inFleet===false;}
var coinShopThreshold=550000,coinReserve=10000,oilReserve=5000,sortieOilMinimum=1000;
function canBuy(item,balance,reserve){return item.currency==='Coins'&&item.price>0&&item.price<=balance-(reserve||0);}
function coinCap(items){
 var caps=items.filter(function(n){return n.bounds.top<15&&/^MAX[:：]?\s*\d+$/i.test(n.text.trim())&&Number(n.text.replace(/\D/g,''))>=30000;});
 return caps.length===1?caps[0]:null;
}
function needsCoinHeadroom(items,balance){
 var cap=coinCap(items);
 return balance!==null&&balance>=Math.min(coinShopThreshold,cap?Number(cap.text.replace(/\D/g,''))-5000:Infinity);
}
function coins(items,screen){
 var cap=coinCap(items);
 if(screen==='home'&&!cap)return null;
 var left=cap?cap.bounds.left-15:1030,right=cap?cap.bounds.left+90:1190;
 // On the live home counter, RapidOCR attached the coin icon as a leading W.
 var number=cap?/^W?\s*\d+\s*[+<]?$/i:/^\d+\s*[+<]?$/;
 var candidates=items.filter(function(n){return n.bounds.left>left&&n.bounds.left<right&&n.bounds.top>=15&&n.bounds.bottom<65&&number.test(n.text.trim());});
 if(candidates.length>1)candidates=candidates.filter(function(n){return /[+<]$/.test(n.text.trim());});
 return candidates.length===1?Number(candidates[0].text.replace(/\D/g,'')):null;
}
function isStage24(labels,mode){return mode!=='hard'&&labels.some(function(s){return /^2\s*[-－—]\s*4(?:\s*救援约克城)?$/.test(s);})&&(mode==='normal'||!labels.some(function(s){return /困难/.test(s);}));}
module.exports={rarity:rarity,retireEligible:retireEligible,canBuy:canBuy,coins:coins,needsCoinHeadroom:needsCoinHeadroom,isStage24:isStage24,coinReserve:coinReserve,oilReserve:oilReserve,sortieOilMinimum:sortieOilMinimum};
