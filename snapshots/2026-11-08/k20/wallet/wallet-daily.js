// Run the two wallet tasks in order in one AutoJs engine.
var recovery='/sdcard/Node01-Azur/daily-resume.json';
files.write(recovery,JSON.stringify({path:'/sdcard/Node01-Wallet/wallet-daily.js',started:Date.now()}));
// Finish yielding the farming engine before Wallet starts navigating.
try{
engines.all().forEach(function(engine){
 if(String(engine.getSource()).indexOf('/Node01-Azur/azur-main.js')>=0)engine.forceStop();
});
require('/sdcard/Node01-Wallet/wallet-ad.js');
require('/sdcard/Node01-Wallet/wallet-download.js');
}finally{files.remove(recovery);}
