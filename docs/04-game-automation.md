# 04｜两个游戏的当前 Reality

本页只记录目前已经从上游源码、官方 issue 和真实用户运行案例确认的东西。

# 1. Brown Dust 2 / MFABD2

上游：`sunyink/MFABD2`。

当前正式 Android 路线：

```text
MFABD2 Android ARM64 APK
→ MaaFwApp
→ MaaFramework AndroidNativeController
→ Brown Dust 2
```

要求：Android 9+、ARM64、Root 或 Shizuku、项目要求的游戏语言/画面设置。

Node-01 是 Android 9 / ARM64 / Root，基础条件吻合；仍需真机验收。

## 1.1 Root 后端

MFABD2 固定打包的 MaaFwApp 已经同时实现 SHIZUKU / ROOT 后端。

Root 路线使用 libsu 拉起特权进程；Node-01 已 Root，因此第一候选直接用 ROOT，不额外引入 Shizuku。

## 1.2 最重要的结构：后台虚拟屏

MFABD2 当前固定的 MaaFwApp commit 已经明确支持：

```text
FOREGROUND
→ 操作主屏

BACKGROUND
→ 建虚拟屏
→ 把目标 App 拉到虚拟屏
→ native controller 在虚拟屏截图/点击
```

MaaFwApp README 对 BACKGROUND 的定义就是“在虚拟屏上跑任务，手机可正常使用”。

AppSettings 默认：

```text
runMode = BACKGROUND
resolutionPreference = P720
screenSaverEnabled = false
closeAppAfterTask = false
```

所以当前第一候选不是“把 MFABD2 停掉再做别的事”，而是：

```text
MFABD2 长期在虚拟屏跑 Brown Dust 2
+
物理屏保持可用
```

只有 K20 真机证明 BACKGROUND 模式有兼容问题，才考虑退回前台/停止方案。

## 1.3 分辨率

MFABD2 项目的识别坐标基准是 1280×720；MaaFwApp 后台模式默认 P720，正好匹配。

不要无理由先改 1080P。

## 1.4 保活与调度

MaaFwApp 本身已经有：

- 前台服务；
- 电池白名单相关权限；
- 定时执行；
- 运行配置；
- 特权进程 watchdog；
- 后台虚拟屏；
- 日志/通知。

因此不在本仓库再造 MFABD2 scheduler / watchdog。

## 1.5 当前真实风险

MFABD2 自己的 Android 文档仍明确把这些留给真机验收：

- 完整任务集；
- screenshot/click 精度；
- Android 截图整体偏暗可能影响颜色匹配；
- 升级/覆盖资源等边界。

所以状态是：

```text
ARCHITECTURE / PACKAGE / SOURCE VERIFIED
NODE-01 LIVE UNVERIFIED
```

---

# 2. Azur Lane / Alas

上游：`LmeSzinc/AzurLaneAutoScript`。

Alas 已经负责游戏内部的主线、活动、委托、科研、后宅、商店、大世界、心情和任务调度。

项目不重写游戏逻辑。

## 2.1 手机上的结构

Alas 没有 MFABD2 那种 Android native 虚拟屏宿主。

它的典型控制链是：

```text
Python Alas
→ adbutils / uiautomator2 / scrcpy / ADB
→ Android 主显示上的 Azur Lane
```

所以手机本机化要解决的是“Python controller 放在哪里”，不是重写 Alas。

## 2.2 第一候选：官方 AidLux 0.92

AidLux 官方 GitHub release 仍保留：

```text
v0.92
aidlux_0.92.apk
```

这不是第三方 APK。

当前 AidLux 2.x 已转向 Android 13+，不适合 Node-01 Android 9；而 Alas 自己当前源码仍保留专门的 `deploy/AidLux/0.92/requirements.txt` 和 AidLux deploy template。

2026 年 Alas issue #5739 的用户反馈也与 Node-01 高度吻合：AidLux 0.9.2 + Snapdragon 855 + 低版本 Android 跑得顺，Android 10 正常，而高版本 Android 才是问题区。

因此第一候选就是旧官方 0.92，而不是 Termux。

## 2.3 本机 ADB

历史手机运行案例和云手机日志都证明了这种拓扑：

```text
Android
├─ Azur Lane
└─ AidLux/Linux
   └─ Alas
      └─ adb → 同一台 Android
```

`127.0.0.1:5555` 是已有手机/云手机方案里常见的 serial，但不是现在就写死的 K20 事实。

Final Live 先让 `adb devices` 告诉我们真实 serial，再填 Alas 配置。

## 2.4 分辨率

Alas 的 assets 和设备检查以 1280×720 为标准；源码会对不支持的分辨率直接 RequestHumanTakeover。

因此真机本机化除了 ADB 之外，还有一个明确问题：如何让 Alas 看到稳定的 1280×720 游戏画面。

这一点不能用 MFABD2 的 MaaFwApp 虚拟屏能力直接外推给 Alas。

## 2.5 Start / Stop / Resume 的真实语义

WebUI 的 Start/Stop 已经是上游自己的控制面：

```text
Start
→ ProcessManager 创建 Alas 子进程
→ AzurLaneAutoScript(config_name).loop()

Stop
→ ProcessManager 直接 kill 子进程
→ 记录 Manual stop

再次 Start
→ 用同一个 config 重新创建进程
→ scheduler 重新读 Scheduler.Enable / Scheduler.NextRun
→ 重新选择 pending / waiting task
```

这说明不需要我们先造一套外部 pause/resume API。

但 Stop 是硬停进程，不是优雅地等当前关卡到安全点。

所以真机必须验证：

```text
正在挂机
→ Stop
→ Start
→ Alas 能否从当前游戏页面重新找回自己的任务轨道
```

## 2.6 Alas 自己已经拥有调度和恢复逻辑

Alas scheduler 会持久化每个任务的 Enable / NextRun，按优先级选择任务，并能处理游戏未运行、卡死、游戏 bug、服务器维护等情况。

不要在外面复制第二套游戏 scheduler。

## 2.7 当前依赖风险

当前 Alas 仍是 Python 3.7 时代依赖栈，AidLux 专用 requirements 包含旧版：

- adbutils 0.11.0；
- uiautomator2 2.16.17；
- mxnet 1.6.0；
- av 10.0.0；
- scipy 1.7.1；
- cnocr 1.2.2 等。

真实风险目前有两个证据最强：

- ARM64 mxnet；
- PyAV / FFmpeg native build。

上游 ARM64 Docker 自己也专门替换过 mxnet；Termux 用户也真实卡过 mxnet。

因此不要混用网上新版 requirements；先严格走 Alas 自带 AidLux 0.92 requirements，真报错再处理。

## 2.8 当前状态

```text
PHONE-LOCAL TOPOLOGY: HISTORICALLY / COMMUNITY PROVEN
AIDLUX 0.92 SOURCE PATH: VERIFIED
CURRENT ALAS ON NODE-01: LIVE UNVERIFIED
```

---

# 3. 两条路线的本质区别

```text
MFABD2
→ Android 原生宿主
→ native controller
→ 后台虚拟屏
→ 物理屏可继续使用

Alas
→ Linux/Python controller
→ ADB 控主 Android 显示
→ 没有同等级的后台虚拟屏机制
```

因此以后任何跨应用处理都必须分别设计，不能再把两个游戏抽象成同一种“暂停/恢复接口”。
