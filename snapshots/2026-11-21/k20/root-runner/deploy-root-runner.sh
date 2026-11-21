#!/system/bin/sh
set -eu

service=/data/adb/service.d/penrix-azur-boot.sh
candidate=/sdcard/Node01-RootRunner/root-runner.candidate.sh
backup_dir=/sdcard/Node01-RootRunner/backups

mkdir -p "$backup_dir"
cp "$service" "$backup_dir/penrix-azur-boot.sh.20261121"
cp "$service" "$service.bak-20261121"
cp "$candidate" "$service"
chmod 755 "$service"

# The prior service was launched by Magisk as a BusyBox shell.  Stop only that
# exact process after the replacement exists, then launch the replacement now;
# it will also start normally on the next boot through service.d.
old_pids=$(ps -A -o PID,ARGS 2>/dev/null | awk '/busybox sh \/data\/adb\/service\.d\/penrix-azur-boot\.sh$/ {print $1}')
for pid in $old_pids; do
    kill "$pid"
done

/system/bin/nohup /system/bin/sh "$service" >/dev/null 2>&1 &

