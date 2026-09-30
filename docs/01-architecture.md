# 01｜当前最小架构

## 当前优先级

先把两个游戏的手机本机运行链路弄清并最终实测：

```text
Brown Dust 2 → MFABD2 Android
Azur Lane     → AidLux + Alas
```

PDD 暂时后置；它需要真实页面和时序，等游戏链路稳定后再上机处理。

## 两个游戏不是同一种运行方式

### Brown Dust 2

MFABD2 Android 使用 MaaFwApp + MaaFramework AndroidNativeController。

当前 MFABD2 固定的 MaaFwApp commit 已经支持：

```text
BACKGROUND mode
→ 创建虚拟屏
→ 把 Brown Dust 2 移到虚拟屏
→ 截图/点击都在虚拟屏完成
→ 物理屏仍可正常使用
```

MaaFwApp 默认 RunMode 就是 BACKGROUND，默认虚拟屏分辨率是 720P。

Node-01 已 Root，所以第一候选直接选择 MaaFwApp 的 Root backend，不需要为了运行 MFABD2 再维护 Shizuku。

这意味着：只要 K20 真机证明后台虚拟屏工作正常，MFABD2 不需要为了其他物理屏任务先退出。

### Azur Lane

Alas 是 Python controller，通过 ADB/uiautomator2/scrcpy 等方式操作 Android 主显示。

手机本机化第一候选：

```text
官方 AidLux 0.92 APK
+ Android 9 / ARM64
+ current Alas source
+ Alas 自带 AidLux 0.92 requirements
+ 本机 ADB
```

Alas WebUI 自己管理每个配置实例的子进程：

```text
Start
→ 用同一 config 启动 scheduler loop

Stop
→ kill 当前 Alas 子进程

再次 Start
→ 重新读取该 config 的 Scheduler.Enable / NextRun
→ 按优先级继续调度
```

这不是无损暂停：正在执行到一半的具体任务会怎样恢复，要靠任务自己的页面复位能力和真机验证。

## 上游各自拥有自己的调度

```text
MFABD2 → 自己的运行配置 / 定时 / 前台服务 / 后台虚拟屏
Alas   → 自己的 Scheduler.Enable / NextRun / priority / error handling
```

本项目不重写这两套调度。

## Windows / Codex

只负责开发、安装、排错、升级和读取证据，不是 24×7 运行依赖。

## 电源边界

断电后由 Owner 手动开机。项目从 Android 正常进入系统之后开始负责运行。

## Final Live 前仍然必须回答

### MFABD2

- Root backend 在这台 MIUI 10 / Android 9 上能否稳定拉起特权进程；
- BACKGROUND 虚拟屏能否稳定把 Brown Dust 2 放在 720P 虚拟屏运行；
- 物理屏在游戏后台运行期间是否真的可自由使用；
- 完整日常、截图颜色和点击精度是否稳定。

### Alas

- 官方 AidLux 0.92 在这台 K20 上的实际 Linux/Python 环境；
- 当前 Alas 的 AidLux requirements 能否直接安装；
- mxnet / PyAV 具体会不会成为 blocker；
- Android 本机 ADB 的实际 serial/连接方式；
- 1280×720 要如何在这台真机上满足；
- Start → Stop → Start 后具体游戏任务如何恢复。
