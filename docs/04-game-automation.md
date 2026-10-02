# 04｜两个游戏的当前 Reality

本页记录上游源码、官方 issue、用户运行案例及 Node-01 真机验收；源码支持不等于本机通过。

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
PARTIAL LIVE VERIFIED — 安装/启动/Root 授权通过，最小闭环未通过
```


2026-09-30 Node-01 实测：复用 v4.5.0 已校验 APK 安装成功；此前 MIUI 安装失败的具体根因未证实，检查时 USB 安装/安全调试已经开启。Root 后端启动最小配置报 `PI root not readable: /storage/emulated/0/Android/data/io.github.sunyink.mfabd2/files/pi`，重载服务后仍失败。目录存在且普通 shell/root 可读，但 root_service 实际 UID 2000，其挂载命名空间中目录归组 everybody(9997)，进程组不含 9997；这是权限/命名空间不匹配的线索，尚非已修复根因。未创建 MFABD2 VD，未完成游戏任务。2026-10-01 Owner 报告已安装游戏且遇到 Root 检测，要求优先碧蓝；不实施隐藏 Root 或绕过游戏检测。

---

# 2. Azur Lane：两个 Android APK 候选

Reality Reconnaissance 结论不是“某个 fork 已经稳赢”，而是：

```text
Candidate A：Shinarin/ALAS-AOS
Candidate B：wess09/AzurPilot-for-Android
Fallback：original Alas + official AidLux 0.92
```

两条 Android 路线都明确支持 Android 9 / ARM64，也都把游戏放到 1280×720 后台虚拟屏，因此都比“主屏 + local ADB”更贴当前产品目标。

## 2.1 Candidate A：ALAS-AOS

当前审查基线：

- repo head：`9be72778433608d4fd6039ba37e71cc71efecf16`；
- latest release：v0.1.6；
- APK：`ALAS-AOS-v0.1.6-android-arm64.apk`；
- APK SHA-256：`18510735fca2176f849e8544a9634fd5e7a59c1bc3c39b65e64063e0c64bdeeb`；
- minSdk 28 = Android 9；
- Shizuku privileged process；
- Ubuntu 24.04 + Python 3.12 + original ALAS；
- 1280×720 virtual display。

对 Node-01 的不利点：它仍要求 Shizuku。Node-01 虽然已经 Root，但 Root 只是让 Shizuku 更容易启动，不等于可以删掉这个组件。

对 Node-01 的有利点来自真实手机问题处理，而不是功能表：

1. 手机虚拟屏上 `mCurrentFocus` 可能消失。ALAS-AOS 的 `app_current_alasaos()` 在取不到 focus 时会 fallback 到 `pidof <package>`，不会仅因 focus 变 null 就把游戏判死。
2. 项目已经实际遇到“桌面模拟器模板在手机 GPU 上相似度从阈值以上掉到 0.829 / 0.783”这类渲染差异，并用真机帧重新校准模板。
3. 项目实际踩过虚拟屏劫持主屏手势导航的问题，并把 `SHOULD_SHOW_SYSTEM_DECORATIONS` 设为禁止项。

这些都说明它确实在解决“ALAS 搬到真机”后的 Reality，而不是只把 Python 打进 APK。

但成熟度仍不能高估：公开 ROM matrix 的完整开发基线主要是 Android 16 / HONOR；MIUI / HyperOS 仍是待验证，长期 soak 也未完成。

状态：

```text
CODE / PACKAGE VERIFIED
PARTIAL LIVE VERIFIED — 安装/运行环境/桥接/1280×720 VD 通过；任务被兼容性错误阻塞
```


2026-09-30 至 2026-10-01 Node-01 证据：官方 Shizuku 13.6.0 以 root 启动时，创建 VD 报 `SecurityException: packageName must match the calling uid`；改用标准 USB ADB shell 启动 Shizuku 后，VD 创建成功（display 1，1280×720，owner com.android.shell/UID 2000）。物理屏仍 1080×2340 / density 440。服务退出后需要恢复；不能把一次启动成功视为保活通过。

当前已确认的任务 blocker：设备上的 `module/device/method/alasaos.py:149-154` 用 `type=VIRTUAL, ...displayId=数字` 正则解析 `dumpsys display`。Android 9 实际为 `type VIRTUAL`，编号位于独立 `mDisplayId=1` 行，导致命令返回空值。runner 在 `app_is_running → app_current_alasaos → alasaos_display_id` 抛出 `ScriptError: AlasAos virtual display not found: ''`。2026-10-01 经同一 22300 bridge 复核：原命令 code 0/stdout 空，而完整输出证实 VD 存在；因此不是游戏本体、网络或普通权限设置可修复的问题。手动 ADB 可将游戏 task 移到 display 1，display 0 Settings 可用；bridge 返回 1280×720 帧，但目视为黑/深灰占位，不能当作有效游戏帧。任务、有效游戏识别、输入及完整重启闭环均未通过。未改上游源码；符合 Issue #2 的候选 B 切换条件。

## 2.2 Candidate B：AzurPilot-for-Android

当前审查基线：

- Android host main：`6c89ee73fc5e704ff2940db9f8720c4874166fba`；
- locked AzurPilot upstream：`4ac2ae452ded4badc75b87ae68868aa8a819b689`；
- rolling Latest ARM64 full APK：`AzurPilot-Android-1.2.11-arm64-v8a-full.apk`；
- APK SHA-256：`900a2b6e3ce7709bca43383cca72f4c4cd227d9fc4263ba61fc5a00876432872`；
- minSdk 28；
- Root / Shizuku 双后端；
- Ubuntu/PRoot + modern AzurPilot；
- 1280×720 background virtual display；
- README 最低 4 GB RAM，推荐 6 GB+；Node-01 正好 6 GB。

它最大的结构优势是 Node-01 可以直接走 Root backend，不需要额外维护 Shizuku。

但当前有一个已经被现场证据击中的 MISMATCH：

- AzurPilot issue #1089 在真机虚拟屏上证明：`mCurrentFocus` 启动几秒后可变 null，而游戏进程仍活着；旧实现会误判“应用未运行”并进入 Restart 循环。
- 该 issue 显示 closed 只是因为维护者回复“这里不接受 azurpilot_android 的 bug 反馈”，不是因为修复。
- AzurPilot-for-Android 当前锁定的 `4ac2ae...` 里，这段 `mCurrentFocus` 判定代码仍原样存在，没有 `pidof` fallback。

另有 Redmi K50 / Android 14 / Shizuku-m 用户报告 `touch down failed` 和滑动定位失败。

所以它不是“不可能”，而是：

```text
ARCHITECTURE / PACKAGE MATCH
KNOWN RUNTIME COMPATIBILITY MISMATCH EXISTS
K20 LIVE UNVERIFIED
```

不要提前 fork 修。Complexity Gate 要求先在 Node-01 复现，再决定是否补这条已经有明确根因的缺口。

## 2.3 为什么 first live probe 先 ALAS-AOS

不是因为 ALAS-AOS 已经被证明“更稳定”。

只是目前两者的证据不对称：

```text
ALAS-AOS
→ 多一个 Shizuku 组件
→ 但已处理 focus 消失 fallback
→ 已有手机渲染差异校准

AzurPilot-for-Android
→ Root 更直接、runtime 更现代
→ 但当前锁定 runtime 仍带一个真机已复现的 Restart 误判
→ 另有当前 touch/swipe 现场问题
```

因此最小成本的真机顺序是：

```text
ALAS-AOS minimal proof
↓ 如果明确 blocker
AzurPilot-for-Android minimal proof
↓ 如果两个 Android host 都明确失败
original Alas + AidLux 0.92
```

## 2.4 Fallback：original Alas + AidLux 0.92

保留依据很具体：

- 2026 上游 issue 用户明确报告 AidLux 0.9.2 + Snapdragon 855 + 低版本 Android 运行顺利；
- Android 10 正常；
- Node-01 是同一代 Snapdragon 855 + Android 9。

但 current Alas 的 AidLux requirements 仍是老 Python 时代依赖：mxnet 1.6、PyAV 10、scipy 1.7.1 等。还需要 local ADB 和 1280×720 主显示处理。

因此只作为 Android APK host 失败后的 fallback。

## 2.5 当前不进入上机序列的项目

- `AzurLaneAutoScript-Headless`：它自己的 runtime matrix 明确写 root ARM64 真机尚未验证当前游戏、完整 observer、ALAS、温控和 long soak；研究项目，不是当前生产候选。
- `LittleMio/AzurLaneAutoScript-docker-arm64`：证明 generic ARM64 Linux 可以部署 Alas，但给 K20 再加 Docker/容器层没有当前收益。
- standalone `wess09/AzurPilot`：Android host 已经拆到专用仓，没必要再手工铺 Termux/proot。
- `M-AzurLaneAutoScript`：玩法修改，不解决 Android runtime。

---

# 3. 两条路线的本质区别

```text
MFABD2
→ Android 原生宿主
→ native controller
→ 后台虚拟屏
→ 物理屏可继续使用

ALAS-AOS / AzurPilot-for-Android
→ Android host
→ embedded PRoot + ALAS/AzurPilot
→ 1280×720 background virtual display
→ physical screen remains free
```

因此以后任何跨应用处理都必须分别设计，不能再把两个游戏抽象成同一种“暂停/恢复接口”。


2026-10-02 Node-01 follow-up actual repair/probe: on Android 9, the ALAS-AOS runtime creates the VD successfully but its source matches only `type=VIRTUAL ... displayId=`; Node-01 emits `type VIRTUAL` with a separate `mDisplayId=N`. Through the same bridge, the old command returned stdout empty while the Android-9-compatible query returned the live ID. A reversible on-device runtime override changed only this query to read `MaaFwVirtualDisplay → mDisplayId`, retaining original source and bytecode backups. Because ALAS re-extracts its runtime on app restart, the override must be applied after the UI has initialized and before starting the scheduler. With the corrected source and regenerated bytecode, the runner logged `virtual display id=10`, launched `com.bilibili.azurlane/.MainActivity` on Display 10, and the 1280×720 bridge frame showed the Bilibili/Manjuu splash. This proves game launch, VD creation, and controller frame transport.

The same probe then reproduced the next known Android-9 foreground-recognition defect: after game launch, runner logged `[App current (alasaos)]` followed by an empty `[Package_name]`, despite ActivityManager confirming Azur Lane on Display 10. Per Issue #2 candidate stop rule, ALAS was force-stopped before any game input or task action. Thus input, minimum task, physical-screen coexistence, and restart persistence are **not verified**. The runtime override is reversible but does not persist across an ALAS app restart; the source is restored by ALAS initialization and must be reapplied before another launch unless upstream packages the compatibility fix.
