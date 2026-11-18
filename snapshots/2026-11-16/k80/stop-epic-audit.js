engines.all().forEach(function (engine) {
    if (String(engine.getSource()).indexOf('/sdcard/Penrix-Epic/epic-claim.js')>=0) engine.forceStop();
});
