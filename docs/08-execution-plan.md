# 08｜当前执行计划：两个游戏优先，PDD 后置

Owner 当前优先级：

> 先把 MFABD2 和 Alas 两条手机本机运行链路弄明白；PDD 需要真机页面测试，暂时不继续。

## 运行边界

```text
断电 / 关机
→ Owner 手动开机
→ Android 可用
→ 游戏自动化开始工作
```

不做来电自启、charger-mode、bootloader/init 或无人冷启动恢复。

---

# Track A｜Brown Dust 2 / MFABD2

## Offline 已确认

- 官方 Android ARM64 APK；
- Android 9+；
- Root / Shizuku；
- AndroidNativeController；
- 当前固定 MaaFwApp commit 已支持 BACKGROUND 虚拟屏；
- BACKGROUND 是默认 run mode；
- 默认虚拟屏 P720；
- Root backend 使用 libsu 拉起特权进程；
- MaaFwApp 自己已有运行配置、定时、前台服务、watchdog。

因此首选运行结构是：

```text
K20 Android
├─ 物理屏：可正常使用
└─ 720P virtual display
   └─ Brown Dust 2
      ↑
   MFABD2 / MaaFwApp / MaaFramework
```

## Final Live 最小验收

1. 安装 MFABD2 官方 Android APK；
2. 选择 Root backend；
3. 保持 BACKGROUND + P720；
4. 启动一个最小安全任务；
5. 确认 Brown Dust 2 被放进虚拟屏；
6. 确认物理屏还能正常操作别的 App；
7. 再逐步跑常用日常；
8. 观察截图偏暗、颜色匹配、点击精度和长期稳定性。

如果这条通过，不增加任何外部游戏调度或停止机制。

---

# Track B｜Azur Lane / AzurPilot-for-Android

## Offline 已确认

- 上游：`wess09/AzurPilot-for-Android`；
- Android 专用仓库，不是泛 Linux/Docker 包装；
- minSdk 28 = Android 9；
- ARM64 full APK 已发布；
- Root / Shizuku 双后端；
- Node-01 已 Root，首选 Root backend；
- 内置 Ubuntu/PRoot + AzurPilot runtime；
- 使用 MaaFwApp 派生的 1280×720 BACKGROUND 虚拟屏；
- Python 端已有专门 `azurpilot_android` screenshot/control backend；
- Android host 与 runtime 可以分别更新；
- 主屏不需要为了 Alas 改成 720P。

截至 2026-09-30，滚动 Latest 中最新已发布 ARM64 full APK：

`AzurPilot-Android-1.2.11-arm64-v8a-full.apk`

SHA-256：

`900a2b6e3ce7709bca43383cca72f4c4cd227d9fc4263ba61fc5a00876432872`

## Final Live 最小验收

1. 安装当前官方 ARM64 full APK；
2. 选择 Root backend；
3. 让内置 Runtime 完成初始化；
4. 保持 BACKGROUND / 1280×720 虚拟屏；
5. 配置一个最小 AzurPilot 实例；
6. 启动碧蓝航线；
7. 确认游戏只在虚拟屏运行，物理屏仍可正常使用；
8. 先跑一个最小安全任务；
9. 再检查截图颜色、点击/滑动、Restart、Stop/Start；
10. 最后观察 6 GB RAM 下的长期稳定性。

## 当前已知风险

项目非常新，不能把“minSdk 28”当成 K20 已验收。

当前已有真实问题：

- 某些真机虚拟屏 `mCurrentFocus` 不稳定，曾导致误判游戏未运行 / Restart 循环；
- 红米 K50 用户报告部分岛屿任务触控/滑动失败；
- 项目 issue 里曾记录“无法停止调度器，只能强关软件”；
- 已验证机型主要是较新 Android，尚未看到 K20 / Android 9 全链路报告。

因此状态仍是：

`SOURCE / PACKAGE SUPPORTED, NODE-01 LIVE UNVERIFIED`

## Fallback

只有 Android 专用 APK 在 K20 出现明确 blocker 时，才回退：

```text
original Alas
+ official AidLux 0.92
+ local ADB
```

ARM64 Docker、Termux/proot 手工部署、Headless 都不作为第一 fallback。

---

# Track C｜PDD

暂缓。

已有认知和采证工具保留，但在两个游戏链路搞清并最终上机后再继续。

---

# 当前 Evidence

```text
MFABD2 Android architecture:
SOURCE / PACKAGE VERIFIED

MFABD2 on K20:
LIVE UNVERIFIED

AzurPilot-for-Android architecture/package:
SOURCE / PACKAGE VERIFIED

AzurPilot-for-Android on K20:
LIVE UNVERIFIED
```

下一步离线工作只剩：保持两条游戏路线的版本/依赖信息对齐，不再增加自制框架。
