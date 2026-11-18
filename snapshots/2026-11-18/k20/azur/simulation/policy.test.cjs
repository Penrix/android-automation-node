const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path='../autojs/azur-policy.js';
const p=fs.existsSync(require('node:path').join(__dirname,path))?require(path):{};
test('only known white blue purple eligible ships retire, including trained and unique ships',()=>{
 for(const rarity of ['N','R','SR'])assert.equal(p.retireEligible({rarity,locked:false,inFleet:false,level:120,duplicates:0}),true);
 for(const rarity of ['SSR','UR','unknown'])assert.equal(p.retireEligible({rarity,locked:false,inFleet:false}),false);
 assert.equal(p.retireEligible({rarity:'SR',locked:true,inFleet:false}),false);
 assert.equal(p.retireEligible({rarity:'N',locked:false,inFleet:true}),false);
});
test('ALAS rarity colors do not classify gold as purple or unknown as white',()=>{
 assert.equal(p.rarity([174,176,187]),'N');assert.equal(p.rarity([106,195,248]),'R');
 assert.equal(p.rarity([151,134,254]),'SR');assert.equal(p.rarity([248,223,107]),'SSR');
 assert.equal(p.rarity([233,145,174]),'unknown');
});
test('purchase must use coins with a known affordable positive price',()=>{
 assert.equal(p.canBuy({currency:'Coins',price:5000},600000),true);
 for(const item of [{currency:'Gems',price:30},{currency:'unknown',price:2000},{currency:'Coins',price:0},{currency:'Coins',price:700000}])assert.equal(p.canBuy(item,600000),false);
});
test('preserves the purchase reserve and reads the observed home coin icon stuck to the balance',()=>{
 const rows=[
  {text:'MAX: 18500',bounds:{left:751,top:-1,right:850,bottom:14}},
  {text:'MAX:111000',bounds:{left:915,top:-1,right:1017,bottom:14}},
  {text:'5089 +',bounds:{left:775,top:18,right:850,bottom:53}},
  {text:'W1703 +',bounds:{left:937,top:23,right:1008,bottom:53}},
  {text:'138 +',bounds:{left:1137,top:20,right:1199,bottom:53}}
 ];
 assert.equal(p.coins(rows,'home'),1703);
 assert.equal(p.coins(rows.filter(n=>n.text!=='W1703 +'),'home'),null);
 assert.equal(p.coins(rows.filter(n=>n.text!=='MAX:111000'),'home'),null);
 assert.equal(p.needsCoinHeadroom(rows,1703),false);
 assert.equal(p.needsCoinHeadroom(rows,105999),false);
 assert.equal(p.needsCoinHeadroom(rows,106000),true);
 assert.equal(p.needsCoinHeadroom(rows,null),false);
 assert.equal(p.canBuy({currency:'Coins',price:400},1703,p.coinReserve),false);
});
test('stage recognition distinguishes normal 2-4 from 12-4 and 2-3',()=>{
 assert.equal(p.isStage24(['2-4','普通']),true);assert.equal(p.isStage24(['12-4']),false);
 assert.equal(p.isStage24(['2-3']),false);assert.equal(p.isStage24(['2-4','困难']),false);
 assert.equal(p.isStage24(['2-4 救援约克城','困难'],'normal'),true);
 assert.equal(p.isStage24(['2-4 救援约克城'],'hard'),false);
});
test('coin balance uses the observed top coin counter, not oil or shop prices',()=>{
 const rows=[{text:'MAX:111000',bounds:{left:1088,top:-2,right:1176,bottom:23}},{text:'593000 +',bounds:{left:1103,top:20,right:1207,bottom:50}},{text:'20651 +',bounds:{left:946,top:20,right:1034,bottom:50}},{text:'22500',bounds:{left:648,top:356,right:735,bottom:392}}];
 assert.equal(p.coins(rows),593000);assert.equal(p.coins(rows.filter(x=>x.text!=='593000 +')),null);
 assert.equal(p.coins([{text:'551620<',bounds:{left:1056,top:20,right:1155,bottom:50}}]),551620);
});
test('shop purchase screenshot distinguishes coin icon OCR from the balance',()=>{
 const rows=JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'../evidence/20261106/2026-11-05T09-03-04-153Z/error.json'),'utf8'));
 assert.equal(p.coins(rows),491810);
});
