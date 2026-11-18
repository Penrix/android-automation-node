var me=engines.myEngine();engines.all().forEach(function(engine){if(engine.id!==me.id&&String(engine.getSource()).indexOf('/Node01-Azur/azur-main.js')>=0)engine.forceStop();});
var r=require('/sdcard/Node01-Azur/azur-runtime.js'),boot=require('/sdcard/Node01-Azur/azur-startup.js'),args=me.execArgv||{},summary={started_at:new Date().toISOString(),status:'running',sorties:0,purchases:0,retired:0,restarts:0};
var needBoot=true,restarting=false,failures=0,phase='startup',commissionDue=0,portDue=0;
files.write('/sdcard/Node01-Azur/last-run.json',JSON.stringify(summary,null,2));
try{
 while(!args.maxSorties||summary.sorties<args.maxSorties){
  try{
   if(needBoot){phase='startup';boot.start(r,restarting);needBoot=false;}
    if(Date.now()>=commissionDue){
     phase='oil_balance';require('./azur-oil.js').run(r,false);
     phase='commission';
     if(commissionDue)require('./azur-navigation.js').home(r);
     try{commissionDue=require('./azur-commission.js').run(r);}
     catch(error){
      if(error.code!=='COMMISSION_UI')throw error;
      r.log('commission_ui_unrecognized',{reason:String(error)});
      r.save('commission-error');commissionDue=Date.now()+5*60000;
     }
     require('./azur-navigation.js').home(r);
    }
    if(Date.now()>=portDue){
     phase='port_rewards';portDue=Date.now()+60*60000;
     require('./azur-port.js').run(r);
     phase='oil_balance';require('./azur-oil.js').run(r,false);
    }
    phase='maintenance';
    if(!args.resume||summary.sorties>0){require('/sdcard/Node01-Azur/azur-navigation.js').shop(r);summary.purchases+=require('/sdcard/Node01-Azur/azur-shop.js').run(r,false).length;summary.retired+=require('/sdcard/Node01-Azur/azur-retire.js').run(r);require('/sdcard/Node01-Azur/azur-navigation.js').home(r);}
    var policy=require('/sdcard/Node01-Azur/azur-policy.js'),coins=policy.coins(r.scan());if(!policy.canFarm(coins))throw Error('Coins full or unreadable before sortie');
   phase='sortie';require('/sdcard/Node01-Azur/azur-campaign.js').run(r);failures=0;summary.sorties++;summary.status='running';r.log('sortie_count',{sorties:summary.sorties});files.write('/sdcard/Node01-Azur/last-run.json',JSON.stringify(summary,null,2));
  }catch(error){
   if(error.code==='GAME_MAINTENANCE'){needBoot=true;restarting=false;r.log('maintenance_interrupted',{phase:phase});continue;}
   if(!boot.recoverable(error)||failures>=3)throw error;
   failures++;summary.restarts++;needBoot=true;restarting=true;
   r.log('game_restart',{reason:String(error),code:error.code,phase:phase,attempt:failures});sleep(10000);
  }
 }
 summary.status='completed';
}catch(e){summary.status=e.code==='FOREGROUND_CHANGED'?'yielded':'error';summary.error=String(e);summary.error_code=e.code||null;r.log('error',{message:String(e),code:e.code||null});try{r.save('error');}catch(ignore){}}
finally{summary.finished_at=new Date().toISOString();files.write(r.dir+'/summary.json',JSON.stringify(summary,null,2));files.write('/sdcard/Node01-Azur/last-run.json',JSON.stringify(summary,null,2));r.log('finished',summary);}
