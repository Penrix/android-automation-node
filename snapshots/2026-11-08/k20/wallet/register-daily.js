var path='/sdcard/Node01-Wallet/wallet-daily.js';
tasks.queryTimedTasks({path:path}).forEach(function(t){tasks.removeTimedTask(t.id);});
var task=tasks.addDailyTask({path:path,time:'11:05'});
var registered=tasks.queryTimedTasks({path:path});
if(registered.length!==1)throw Error('Wallet daily registration failed');
files.write('/sdcard/Node01-Wallet/schedule.json',JSON.stringify({time:'11:05',timezone:String(java.util.TimeZone.getDefault().getID()),path:path,id:Number(task.id),registered_at:new Date().toISOString(),details:String(registered[0])},null,2));
