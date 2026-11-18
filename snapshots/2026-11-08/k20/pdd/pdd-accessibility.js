// Root rebind first; the existing boot watchdog handles Android's stale DEAD binding.
module.exports=function(event){
 function ready(){try{return !!auto.service;}catch(e){return false;}}
 if(ready())return;
 event('accessibility_root_rebind_start');
 var component='org.autojs.autojs6/org.autojs.autojs.core.accessibility.AccessibilityServiceUsher';
 var state=shell('settings get secure enabled_accessibility_services',true);
 if(state.code!==0)throw Error('Cannot read accessibility settings');
 var others=String(state.result||'').trim().split(':').filter(function(v){return v&&v!=='null'&&v!==component;});
 shell('settings put secure enabled_accessibility_services '+(others.length?others.join(':'):'null'),true);
 sleep(1000);others.push(component);
 var result=shell('settings put secure enabled_accessibility_services '+others.join(':')+'; settings put secure accessibility_enabled 1',true);
 if(result.code!==0)throw Error('Root accessibility rebind failed');
 for(var i=0;i<40;i++){if(ready()){event('accessibility_root_rebound');return;}sleep(250);}
 var source=String(engines.myEngine().getSource()),args=engines.myEngine().execArgv||{};
 if(args.dryRun)source='/sdcard/Node01-PDD/pdd-dry-run.js';
 if(!args.audit&&!args.verifyHistorySince)files.write('/sdcard/Node01-PDD/accessibility-resume',source);
 event('accessibility_system_binding_failed',{resume:source});
 throw Error('Accessibility did not bind after root recovery; boot watchdog notified');
};
