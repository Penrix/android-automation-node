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

# Track B｜Azur Lane / Alas

## Offline 已确认

- current Alas 仍保留专门 AidLux 0.92 deploy template / requirements；
- AidLux 官方 GitHub release 仍提供 `aidlux_0.92.apk`；
- Snapdragon 855 + 低 Android 的 AidLux/Alas 历史用户路径真实存在；
- 手机上本机 WebUI `127.0.0.1:22267` 的历史运行案例真实存在；
- 手机 Docker / 云手机里本机/局域网 ADB 的 Alas 路径真实存在；
- Alas 自己有完整 scheduler；
- WebUI Start/Stop 直接控制每个配置的 Alas 子进程；
- Start 后 scheduler 重新读取同一 config 的 Enable / NextRun；
- Alas 画面标准是 1280×720；
- ARM64 mxnet 与 PyAV 是有证据的依赖风险。

## 第一候选拓扑

```text
K20 Android 9
├─ Azur Lane
└─ official AidLux 0.92
   └─ current Alas
      └─ ADB → same Android device
```

## Final Live 最小验收

1. 从 AidLux 官方 GitHub release 安装 0.92；
2. 初始化 AidLux；
3. 先运行只读 `tools/alas/aidlux-preflight.sh`；
4. 确认 `/usr/bin/python`、`git`、`adb`、ARM64 与 pip；
5. clone current Alas；
6. 使用上游自己的 AidLux 0.92 deploy template / requirements；
7. 真报错时只处理实际 blocker；
8. 先让 ADB 看见同一台 K20，不预设 serial；
9. 先尝试 root `wm size 1280x720`，以 Alas 实际 `[Screen_size]` 为准；若 K20 不生效，再研究 root 分辨率工具；
10. 启动 `python gui.py`；
11. 确认手机本地 WebUI；
12. 让 Alas 取得一帧并识别主页；
13. 再跑一个最小安全任务；
14. 最后验证 WebUI Stop → Start 后 scheduler 是否能回到任务轨道。

## 当前不做

- 不先改 Alas；
- 不先 fork；
- 不混用网上新版 requirements；
- 不同时铺 Termux / proot / chroot / Docker 多套方案；
- 不为了未来 PDD 先写 pause/resume wrapper。

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

Alas phone-local architecture:
SOURCE + HISTORIC/COMMUNITY GROUNDED

Alas on K20:
LIVE UNVERIFIED
```

下一步离线工作只剩：保持两条游戏路线的版本/依赖信息对齐，不再增加自制框架。
