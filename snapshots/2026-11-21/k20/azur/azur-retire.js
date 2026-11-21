var policy=require('./azur-policy.js');
function capacity(r){var n=r.find(/船坞容量/),m=n&&n.text.match(/(\d+)\s*\/\s*(\d+)/);return m?Number(m[1]):null;}
function selectedCount(r){var n=r.find(/^已选中[:：]\d+$/),m=n&&n.text.match(/\d+$/);return m?Number(m[0]):null;}
function finish(r,before,count){
 for(var i=0;i<12;i++){
  r.scan();r.save('retire-confirm-'+before+'-'+i);
  if(r.find(/已选中/)){
   var after=capacity(r);if(after!==null&&after===before-count){r.log('retirement_verified',{before:before,after:after,count:count});return count;}
  }
  if(r.find(/获得道[具县]/)&&r.word(/点击继续/))continue;
  if(r.find(/可获得/) && r.word(/^确定$/))continue;
  if(r.find(/将获得以下材料/) && r.word(/^确定$/))continue;
  if(r.find(/超稀有|海上传奇/))throw Error('Gold or rainbow retirement warning');
  if(r.find(/精锐|稀有|退役|拆解|装备/) && r.word(/^确定$/))continue;
  if(r.button('EQUIP_CONFIRM_2')||r.button('EQUIP_CONFIRM')||r.button('SR_SSR_CONFIRM'))continue;
  sleep(1000);
 }
 throw Error('Retirement result not confirmed');
}
function filter(r,all){
 if(!r.button('DOCK_FILTER')&&!r.word(/^筛选/))throw Error('Dock filter missing');r.scan();
 if(!r.find(/^精锐$/)||!r.find(/^海上传奇$/))throw Error('Rarity filter page missing');
 r.tap(428,448,'rarity_all',200);
 if(!all){if(!r.word(/^普通$/)||!r.word(/^稀有$/)||!r.word(/^精锐$/))throw Error('Allowed rarity filters missing');}
 if(!r.word(/^确定$/))throw Error('Dock filter confirmation missing');
}
function run(r,args){
 args=args||{};var total=0;
 if(args.resumeBefore)total+=finish(r,args.resumeBefore,args.resumeCount);
 r.scan();if(!r.find(/已选中/))require('./azur-navigation.js').retire(r);
 r.scan();filter(r,false);
 for(var batch=0;batch<60;batch++){
  r.scan();if(!r.find(/已选中/))throw Error('Retirement page missing');var before=capacity(r);if(before===null)throw Error('Dock capacity unreadable');
  var picked=[];
  for(var row=0;row<2;row++)for(var col=0;col<7;col++){
   var x=230+165*col,y=75+227*row,c=images.pixel(r.image(),x+65,y+3),rarity=policy.rarity([colors.red(c),colors.green(c),colors.blue(c)]);
   if(['N','R','SR'].indexOf(rarity)>=0&&picked.length<10)picked.push({x:x+80,y:y+100,rarity:rarity});
  }
  if(!picked.length){filter(r,true);r.log('retirement_complete',{count:total});return total;}
  r.save('retire-before-'+before);r.log('retirement_selected',picked);
  picked.forEach(function(p){r.tap(p.x,p.y,p.rarity,150);});r.scan();r.save('retire-selected-'+before);
  if(selectedCount(r)!==picked.length)throw Error('Selected ship count mismatch');
  if(!r.word(/^确定$/))throw Error('Retirement selection confirm missing');total+=finish(r,before,picked.length);
 }
 throw Error('Retirement batch limit reached');
}
module.exports={run:run};
