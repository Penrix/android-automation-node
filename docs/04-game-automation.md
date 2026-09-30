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

# 2. Azur Lane / AzurPilot-for-Android

第一候选不再是原版 Alas + AidLux。

上游：

- `wess09/AzurPilot`：现代化 Alas 变体；
- `wess09/AzurPilot-for-Android`：Android 专用宿主，基于 ALAS-AOS / MaaFwApp 路线。

## 2.1 为什么更适合 Node-01

AzurPilot-for-Android 当前源码明确：

- minSdk 28 = Android 9；
- ARM64；
- Root / Shizuku 双后端；
- 内置 Ubuntu/PRoot runtime；
- 内置 AzurPilot；
- BACKGROUND 虚拟屏；
- 虚拟屏固定横屏 1280×720；
- 本机特权桥负责 screencap / click / swipe / shell；
- `azurpilot_android` 控制后端不依赖 ADB / uiautomator2。

因此目标结构是：

```text
K20 Android 9 / Root
└─ AzurPilot-for-Android
   ├─ Root privileged bridge
   ├─ PRoot Ubuntu + AzurPilot
   └─ 1280×720 virtual display
      └─ Azur Lane
```

物理主屏不需要改分辨率，也不需要单独安装 AidLux。

## 2.2 当前官方包

截至 2026-09-30，滚动 Latest 已发布 ARM64 full APK：

`AzurPilot-Android-1.2.11-arm64-v8a-full.apk`

SHA-256：

`900a2b6e3ce7709bca43383cca72f4c4cd227d9fc4263ba61fc5a00876432872`

full APK 约 889 MB，内置 Runtime；update APK 只更新 Android 宿主，不适合作为首次安装包。

## 2.3 Root 模式

项目自身使用 libsu，同时也支持 Shizuku。

Node-01 已 Root，因此第一候选直接使用 Root backend，不再额外维护 Shizuku。

已有 Redmi K60 root 用户成功报告，但 K20 / Android 9 尚无完整用户报告。

## 2.4 Android 9 证据

不是只看 README：

- Gradle minSdk 明确为 28；
- README 标注 Android 9.0+；
- 源码里已有针对 Android 9 forced-size 行为的实测注释；
- 但当前公开机型矩阵主要是更新 Android 版本。

因此：

`ANDROID 9 SOURCE-SUPPORTED ≠ K20 LIVE VERIFIED`

## 2.5 已知真机问题

项目非常新，已经有真实 bug 报告：

- 某些虚拟屏上 `mCurrentFocus` 很快变 null，导致 Android backend 误判游戏未运行并 Restart 循环；
- Redmi K50 / Android 14 用户报告岛屿“啾咖啡”任务存在 touch down / 滑动定位问题；
- issue 曾记录调度停止行为不理想。

这些是 Final Live 要重点观察的 Reality，不提前写 workaround。

## 2.6 原版 Alas 的位置

原版 Alas + 官方 AidLux 0.92 现在降为 fallback。

它仍有价值，因为：

- SD855 + 低 Android 有历史成功案例；
- 原版 Alas 逻辑更成熟；
- 当 Android 专用宿主出现明确兼容 blocker 时，可以回退。

但它需要额外处理 Linux runtime、本机 ADB、1280×720 主显示和老 Python ARM64 依赖，因此不再是首选。

## 2.7 其他 fork 的结论

- `LittleMio/AzurLaneAutoScript-docker-arm64`：ARM64 依赖配方有价值，但 Docker 太重，不适合先上 K20。
- `miyouzi/azurlaneautoscript-arm64`：偏 ARM Linux/NAS，不是 Android 手机方案。
- `M-AzurLaneAutoScript`：玩法增强，不解决手机 ARM64 部署。
- `AzurLaneAutoScript-Headless`：方向先进，但 root ARM64 真机仍属研究级，完整长期 ALAS 尚未验证。
- `Shinarin/ALAS-AOS`：也是 Android APK + 1280×720 虚拟屏，路线成立；当前主要公开全链路验证在新 Android / Shizuku 方案，Node-01 有 Root 时 AzurPilot-for-Android 更直接。

---

# 3. 两条路线的本质区别

```text
MFABD2
→ Android 原生宿主
→ native controller
→ 后台虚拟屏
→ 物理屏可继续使用

AzurPilot-for-Android
→ Android native host
→ embedded PRoot/AzurPilot
→ 1280×720 background virtual display
→ physical screen remains free
```

因此以后任何跨应用处理都必须分别设计，不能再把两个游戏抽象成同一种“暂停/恢复接口”。
