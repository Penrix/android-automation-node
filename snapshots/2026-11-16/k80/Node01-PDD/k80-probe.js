if (!shizuku.state.hasPermission) { Packages.rikka.shizuku.Shizuku.requestPermission(42); sleep(4000); }
var out={accessibility:!!auto.service};
try {var r=shizuku('id');out.shizuku=r.code===0 && String(r.result).indexOf('uid=2000')>=0;out.code=r.code;out.error=String(r.error||'');} catch(e){out.error=String(e);}
files.write('/sdcard/Node01-PDD/k80-probe.json',JSON.stringify(out));
