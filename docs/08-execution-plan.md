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

# Track B｜Azur Lane Android runtime comparison

## Candidate A：ALAS-AOS — first live probe

Offline facts:

- `Shinarin/ALAS-AOS`；
- minSdk 28 = Android 9；
- Android ARM64 APK 已发布；
- 内置 Ubuntu 24.04 / Python 3.12 / original ALAS；
- 1280×720 background virtual display；
- Shizuku privileged process；
- 虚拟屏前台判断失败时会 fallback 到 `pidof <package>`；
- 已有手机 GPU 渲染差异导致模板阈值下降的真实问题记录和本机模板补丁；
- 当前公开完整开发基线主要是 HONOR Android 16；MIUI / Android 9 仍未 live verified。

Node-01 已 Root，因此 Shizuku 可以走 Root 启动；这仍是额外依赖，但不需要 PC 24×7。

最小验收：

1. 安装当前 ALAS-AOS ARM64 APK；
2. Root 环境启动 Shizuku 并授权；
3. 初始化内置 Runtime；
4. 建 1280×720 虚拟屏；
5. 只启动游戏并确认物理屏仍可用；
6. 跑一个最小安全任务；
7. 检查 Restart、截图识别、click/swipe；
8. 观察内存和 2–3 小时稳定性。

## Candidate B：AzurPilot-for-Android — second live probe

Offline facts:

- minSdk 28 = Android 9；
- ARM64 full APK 已发布；
- Root / Shizuku 双后端，Node-01 可直接 Root；
- 内置 Ubuntu/PRoot + AzurPilot；
- 1280×720 background virtual display；
- README 推荐 6 GB+ RAM，Node-01 正好 6 GB；
- 当前 Android host main：`6c89ee73fc5e704ff2940db9f8720c4874166fba`；
- 当前锁定 AzurPilot upstream：`4ac2ae452ded4badc75b87ae68868aa8a819b689`。

Reality mismatch：

- 真机 issue #1089 已证明 `mCurrentFocus` 在虚拟屏上会变 null，并可导致 Restart 循环；
- issue 在 AzurPilot 仓库被关闭只是因为“Android bug 不在这里收”，不是修复；
- 当前锁定的 `4ac2ae...` 中该实现仍然存在；
- Redmi K50 用户另有 `touch down failed` / 滑动定位失败现场报告。

因此它**有架构可行性，但当前不是比 ALAS-AOS 更稳的已证事实**。

最小验收与 Candidate A 相同，但首先盯：

`app current → Restart → touch/swipe`

如果 K20 不复现这些问题，Root 直连和现代 Runtime 才是它的优势。

## Fallback：original Alas + AidLux 0.92

保留理由：

- 2026 用户现场明确记录 AidLux 0.9.2 + Snapdragon 855 + 低 Android 运行顺利，Android 10 正常；
- Node-01 同为 Snapdragon 855 / Android 9。

代价：

- current Alas 仍保留 Python 3.7.6-era deploy；
- AidLux requirements 仍有 mxnet 1.6 / av 10 / scipy 1.7.1 等 ARM64 老依赖；
- 需要 local ADB；
- 默认控制主显示，需要处理 1280×720。

所以只在两个 Android APK 有明确 blocker 时启用。

## Not candidates

- Headless：其自己的 runtime matrix 明确写已 root ARM64 真机只做到 systemless ANGLE / G1 合同，尚未验证当前游戏、完整 observer、ALAS、温控和 long soak。
- ARM64 Docker：证明 generic ARM64 Linux 可跑，不是 Android phone host；在 K20 上增加容器层，没有当前收益。
- standalone AzurPilot：Android host 已拆到 AzurPilot-for-Android，手工 Termux/proot 没有必要。

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

ALAS-AOS + AzurPilot-for-Android architecture/package:
SOURCE / PACKAGE VERIFIED

Both Android runtimes on K20:
LIVE UNVERIFIED
```

下一步离线工作只剩：保持两条游戏路线的版本/依赖信息对齐，不再增加自制框架。


## 2026-10-02 Node-01 live checkpoint

ALAS-AOS is no longer wholly live-unverified. On Redmi K20 Pro / Android 9, Shizuku shell created a 1280×720 virtual display and a reversible runtime compatibility override for Android-9 `dumpsys display` formatting let ALAS identify Display 10 and launch Azur Lane. The bridge returned a 1280×720 live game splash frame.

The next gate failed exactly at virtual-display foreground recognition: ALAS logged an empty package after launch while Android ActivityManager showed `com.bilibili.azurlane` on Display 10. The scheduler was stopped before input or task execution. Keep Candidate A as **PARTIAL LIVE VERIFIED**, do not claim click/swipe, safe-task, physical-screen coexistence, stop-start persistence, or long-running stability. The task's stop condition prevents further in-place ALAS code changes in this run.
