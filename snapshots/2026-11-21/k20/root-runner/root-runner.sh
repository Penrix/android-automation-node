#!/system/bin/sh
# Magisk service.d entrypoint for K20.  This process has exactly one job:
# keep AutoJs6 able to run the already-deployed AutoJs supervisor.
#
# Business schedules and page logic remain in AutoJs6.  Do not add a second
# scheduler here: competing schedulers can start the game while a daily job is
# holding the foreground.

set -u

runner_dir=/sdcard/Node01-RootRunner
azur_dir=/sdcard/Node01-Azur
heartbeat="$azur_dir/supervisor-heartbeat"
supervisor="$azur_dir/azur-supervisor.js"
autojs_package=org.autojs.autojs6
autojs_service="$autojs_package/org.autojs.autojs.external.foreground.AppForegroundService"
autojs_activity="$autojs_package/org.autojs.autojs.external.open.RunIntentActivity"
event_log="$runner_dir/events.jsonl"
command_log="$runner_dir/autojs-launch.log"

mkdir -p "$runner_dir"

event() {
    printf '{"at":"%s","event":"%s"}\n' "$(date '+%Y-%m-%dT%H:%M:%S%z')" "$1" >> "$event_log"
}

recover_dead_accessibility() {
    # Observed MIUI failure: Settings still lists AutoJs6 as enabled, but its
    # AccessibilityService binding is DEAD.  A process restart cannot repair
    # that system binding on this K20; one controlled reboot has done so.
    day=$(date +%F)
    read uptime _ < /proc/uptime
    uptime=${uptime%.*}
    if [ "$uptime" -gt 120 ] && [ "$(cat "$azur_dir/accessibility-reboot-day" 2>/dev/null || true)" != "$day" ] &&
       settings get secure enabled_accessibility_services | grep -q "$autojs_package" &&
       dumpsys activity services "$autojs_package" | grep -q 'DEAD.*AccessibilityServiceUsher' &&
       ! dumpsys accessibility | grep -q 'Service\[label=AutoJs6,'; then
        printf '%s\n' "$day" > "$azur_dir/accessibility-reboot-day"
        dumpsys activity services "$autojs_package" > "$runner_dir/accessibility-dead-service.txt"
        event autojs_accessibility_dead_reboot
        reboot
        exit 0
    fi
}

launch_autojs_supervisor() {
    event autojs_launch_requested
    # AutoJs6 owns this service.  Some MIUI states reject the explicit FGS
    # request, but the explicit script activity still starts the engine; keep
    # the raw output for diagnosis instead of calling that a successful run.
    am start-foreground-service --user 0 -n "$autojs_service" >> "$command_log" 2>&1 || true
    am start --user 0 -n "$autojs_activity" \
        -d "file://$supervisor" -t application/x-javascript >> "$command_log" 2>&1 || true
}

while [ "$(getprop sys.boot_completed)" != 1 ] || [ ! -r "$supervisor" ]; do
    sleep 5
done

event root_runner_started
first=1
last_launch=0

while true; do
    now=$(date +%s)
    recover_dead_accessibility
    stamp=$(cat "$heartbeat" 2>/dev/null || printf 0)
    case "$stamp" in
        ''|*[!0-9]*) stamp=0 ;;
    esac

    stale=0
    if [ "$stamp" -gt "$now" ] || [ $((now - stamp)) -gt 90 ]; then
        stale=1
    fi

    if [ "$first" = 1 ] || [ "$stale" = 1 ] || ! pidof "$autojs_package" >/dev/null 2>&1; then
        if [ $((now - last_launch)) -ge 15 ]; then
            launch_autojs_supervisor
            last_launch=$now
        fi
    fi

    first=0
    sleep 30
done

