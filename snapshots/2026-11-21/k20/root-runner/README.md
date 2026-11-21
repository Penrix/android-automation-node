# K20 Root Runner

K20 的 Magisk `service.d` 守护。它只做两件事：等 Android 完成开机；在 AutoJs6
或其 `azur-supervisor.js` 心跳缺失时，重新请求 AutoJs6 前台服务与主管脚本。

它**不**维护任何业务定时表，也不直接启动钱包、Epic 或拼多多脚本。它们仍由 AutoJs6
自己的定时任务执行；`azur-supervisor.js` 观察这些任务，任务结束后恢复碧蓝航线。

部署目标：

```text
/data/adb/service.d/penrix-root-runner.sh
```

运行记录：

```text
/sdcard/Node01-RootRunner/events.jsonl
/sdcard/Node01-RootRunner/autojs-launch.log
```

只有在 `autojs_launch_requested` 之后重新出现
`/sdcard/Node01-Azur/supervisor-heartbeat`，才说明恢复链路真的重新运行；单纯写出启动请求
不等于业务脚本成功。

