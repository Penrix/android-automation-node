# Node-01 Final Live Toolkit

这里只保留最后上机时确实需要、且无法由一条现成命令替代的采证工具。

当前状态：CODE PREPARED, LIVE UNVERIFIED。

## 保留

```text
collect-baseline.js
  一次输出设备 / AutoJs6 / root / Accessibility 基线

pdd-snapshot.js
  一次输出 PDD Accessibility tree + screenshot + timing
```

Alas 的 Linux/AidLux 环境另用：

`tools/alas/aidlux-preflight.sh`

## 不再为一行命令造 wrapper

最终 Live 时直接调用现成能力：

```text
MFABD2 launch:
app.launchPackage("io.github.sunyink.mfabd2")

MFABD2 stop candidate:
shell("am force-stop io.github.sunyink.mfabd2", true)

APK SHA256 on Windows:
Get-FileHash <apk> -Algorithm SHA256

PDD TimedTask:
在 live handler 和 prepare_lead 都被真机证据确定后，直接用 AutoJs6 tasks API 注册
```

当前没有 PDD 最终点击脚本，因为真实页面证据尚未采集。
