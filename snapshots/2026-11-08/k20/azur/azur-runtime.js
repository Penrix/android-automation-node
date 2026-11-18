var base='/sdcard/Node01-Azur';files.ensureDir(base+'/runs/');
var dir=base+'/runs/'+new Date().toISOString().replace(/[:.]/g,'-');files.ensureDir(dir+'/');
var image=null,items=[],scale=1,gameProcessId=null;
function log(event,data){files.append(dir+'/events.jsonl',JSON.stringify({at:new Date().toISOString(),event:event,data:data})+'\n');}
function foreground(){
 var current=focus(),own=current.indexOf('com.bilibili.azurlane/')>=0,launcher=/\bu\d+\s+(com\.miui\.home|com\.android\.launcher3|android)\//.test(current),crash=/Application (Error|Not Responding): com\.bilibili\.azurlane/.test(current);
 var e=Error('Game lost foreground');e.code='FOREGROUND_CHANGED';
 if(!own&&!launcher&&!crash)throw e;
 var pid=String(shell('pidof com.bilibili.azurlane',true).result).trim();
 if(crash||!/^\d+$/.test(pid)||(gameProcessId!==null&&pid!==gameProcessId)){e.code='GAME_NOT_RUNNING';throw e;}
 if(own){gameProcessId=pid;return;}throw e;
}
function focus(){var result=shell('dumpsys window windows | grep mCurrentFocus',true);if(result.code!==0)throw Error('Cannot read Root window focus');return String(result.result);}
function resetProcess(){gameProcessId=null;}
function scan(allowOutside){if(!allowOutside)foreground();if(image)image.recycle();var r=shell('screencap -p '+dir+'/screen.png',true);if(r.code!==0)throw Error('Capture failed');var raw=images.read(dir+'/screen.png');scale=raw.getHeight()/720;image=images.resize(raw,[Math.round(raw.getWidth()/scale),720]);raw.recycle();items=[];var found=ocr.rapid.detect(image);for(var i=0;i<found.length;i++){var v=found[i],b=v.bounds;if(b)items.push({text:String(v.label||v.text),bounds:{left:b.left,top:b.top,right:b.right,bottom:b.bottom}});}files.write(dir+'/last.json',JSON.stringify(items));if(!allowOutside)checkMaintenance();return items;}
function checkMaintenance(){
 var state=require('./azur-startup.js').classify(items);
 if(state!=='maintenance'&&state!=='restart_update'&&state!=='network_error')return;
 save(state+'-detected');
 var e=Error(state==='maintenance'?'Game server is under maintenance':state==='network_error'?'Game reports network connection failure':'Game requests a restart to update');
 e.code=state==='maintenance'?'GAME_MAINTENANCE':state==='network_error'?'NETWORK_ERROR':'GAME_UPDATE_RESTART';throw e;
}
function find(re){for(var i=0;i<items.length;i++)if(re.test(items[i].text.replace(/\s/g,'')))return items[i];return null;}
function tap(x,y,label,delay,packageName){if(packageName){if(focus().indexOf(packageName+'/')<0)throw Error('System update page lost foreground');}else foreground();log('tap',{x:x,y:y,label:label});var px=Math.round(x*scale),py=Math.round(y*scale);shell('input swipe '+px+' '+py+' '+px+' '+py+' 100',true);sleep(delay===undefined?900:delay);}
function swipe(x1,y1,x2,y2,label){foreground();log('swipe',{label:label});shell('input swipe '+[x1,y1,x2,y2].map(function(n){return Math.round(n*scale);}).join(' ')+' 450',true);sleep(900);}
function word(re,packageName){var n=find(re);if(!n)return false;var b=n.bounds;tap((b.left+b.right)/2,(b.top+b.bottom)/2,n.text,undefined,packageName);return true;}
function save(name){images.save(image,dir+'/'+name+'.png');files.write(dir+'/'+name+'.json',JSON.stringify(items));}
function match(name){var meta=JSON.parse(files.read(base+'/alas-assets.json'))[name];if(!meta)return null;var whole=images.read(base+'/assets/'+name+'.png'),a=meta.area,part=images.clip(whole,a[0],a[1],a[2]-a[0],a[3]-a[1]);whole.recycle();var p=images.findImage(image,part,{threshold:0.86});part.recycle();if(!p)return null;var b=meta.button;return {x:p.x+(b[0]+b[2])/2-a[0],y:p.y+(b[1]+b[3])/2-a[1]};}
function button(name){var p=match(name);if(!p)return false;tap(p.x,p.y,name);return true;}
module.exports={scan:scan,find:find,tap:tap,swipe:swipe,word:word,save:save,log:log,match:match,button:button,focus:focus,resetProcess:resetProcess,image:function(){return image;},dir:dir};
