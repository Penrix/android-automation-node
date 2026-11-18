var me=engines.myEngine();engines.all().forEach(function(engine){if(engine.id!==me.id&&String(engine.getSource()).indexOf('/Node01-Azur/azur-main.js')>=0)engine.forceStop();});
var r=require('/sdcard/Node01-Azur/azur-runtime.js'),boot=require('/sdcard/Node01-Azur/azur-startup.js'),args=me.execArgv||{},summary={started_at:new Date().toISOString(),status:'running',sorties:0,purchases:0,retired:0,restarts:0};
var nav=require('./azur-navigation.js'),policy=require('./azur-policy.js'),oil=require('./azur-oil.js'),port=require('./azur-port.js');
var needBoot=true,restarting=false,failures=0,phase='startup',commissionDue=0,commissionFree=0,sortieFinished=false,portDue=0,shopDue=0,retiredForSortie=false;
files.write('/sdcard/Node01-Azur/last-run.json',JSON.stringify(summary,null,2));
try{
 while(!args.maxSorties||summary.sorties<args.maxSorties){
  try{
   if(needBoot){phase='startup';boot.start(r,restarting);needBoot=false;}
   var regularCommission=Date.now()>=commissionDue,urgentCommission=sortieFinished&&commissionFree>0;
   sortieFinished=false;
   if(regularCommission||urgentCommission){
    phase='commission';
    nav.home(r);
    var resources=r.scan(),fuel=oil.oil(resources),coins=policy.coins(resources,'home');
    if(fuel&&fuel.amount>=fuel.cap){phase='oil_balance';oil.run(r,false,fuel);}
    if(policy.needsCoinHeadroom(resources,coins)&&Date.now()>=shopDue){
     phase='coin_balance';shopDue=Date.now()+15*60000;
     nav.shop(r);summary.purchases+=require('./azur-shop.js').run(r,false,4).length;nav.home(r);
    }
    phase='commission';
    try{
     var commission=require('./azur-commission.js').run(r,!regularCommission);
     commissionDue=regularCommission?commission.due:Math.min(commissionDue,commission.due);
     commissionFree=commission.free;
    }
     catch(error){
      if(error.code!=='COMMISSION_UI')throw error;
      r.log('commission_ui_unrecognized',{reason:String(error)});
      r.save('commission-error');commissionDue=Date.now()+5*60000;commissionFree=0;
     }
   }
   if(summary.sorties>0&&Date.now()>=portDue){
    phase='port_rewards';portDue=Date.now()+60*60000;port.run(r);
   }
   phase='sortie_preflight';nav.home(r);
   var stock=r.scan(),sortieFuel=oil.oil(stock);
   if(sortieFuel&&sortieFuel.amount<policy.sortieOilMinimum){
    phase='oil_replenish';port.collectBuildings(r);nav.home(r);sortieFuel=oil.oil(r.scan());
    if(sortieFuel&&sortieFuel.amount<policy.sortieOilMinimum){
     r.log('sortie_waiting_for_oil',{oil:sortieFuel.amount,minimum:policy.sortieOilMinimum});
     sleep(60000);continue;
    }
   }
   r.log('sortie_ready',{oil:sortieFuel?sortieFuel.amount:null,coins:policy.coins(stock,'home')});
   phase='sortie';require('./azur-campaign.js').run(r);failures=0;summary.sorties++;sortieFinished=true;retiredForSortie=false;
   r.log('sortie_count',{sorties:summary.sorties});files.write('/sdcard/Node01-Azur/last-run.json',JSON.stringify(summary,null,2));
  }catch(error){
   if(error.code==='DOCK_FULL'&&!retiredForSortie){
    phase='retirement';retiredForSortie=true;summary.retired+=require('./azur-retire.js').run(r);continue;
   }
   if(error.code==='GAME_MAINTENANCE'){needBoot=true;restarting=false;r.log('maintenance_interrupted',{phase:phase});continue;}
   if(!boot.recoverable(error)||failures>=3)throw error;
   failures++;summary.restarts++;needBoot=true;restarting=true;
   r.log('game_restart',{reason:String(error),code:error.code,phase:phase,attempt:failures});sleep(10000);
  }
 }
 summary.status='completed';
}catch(e){summary.status=e.code==='FOREGROUND_CHANGED'?'yielded':'error';summary.error=String(e);summary.error_code=e.code||null;r.log('error',{message:String(e),code:e.code||null});try{r.save('error');}catch(ignore){}}
finally{summary.finished_at=new Date().toISOString();files.write(r.dir+'/summary.json',JSON.stringify(summary,null,2));files.write('/sdcard/Node01-Azur/last-run.json',JSON.stringify(summary,null,2));r.log('finished',summary);}
