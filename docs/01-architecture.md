# 01｜当前最小架构

## 当前优先级

先把两个游戏的手机本机运行链路弄清并最终实测：

```text
Brown Dust 2 → MFABD2 Android
Azur Lane     → ALAS-AOS / AzurPilot-for-Android live comparison
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

当前不是只押一个 Android fork，而是两个真正可落地的 APK 候选：

```text
A. Shinarin/ALAS-AOS
   → Android 9+ / ARM64
   → Shizuku 特权进程
   → 内置 Ubuntu/PRoot + original ALAS
   → 1280×720 后台虚拟屏

B. wess09/AzurPilot-for-Android
   → Android 9+ / ARM64
   → Root / Shizuku
   → 内置 Ubuntu/PRoot + AzurPilot
   → 1280×720 后台虚拟屏
```

Reality Reconnaissance 后，第一轮真机 probe 顺序改为 **ALAS-AOS → AzurPilot-for-Android**。

原因不是 ALAS-AOS 已被证明更稳定，而是：

- 两者都明确支持 Android 9 / ARM64，且都有可安装 APK；
- ALAS-AOS 在虚拟屏前台检测失败时已有 `pidof` 回退；
- ALAS-AOS 已对手机 GPU 渲染造成的 ALAS 模板阈值漂移做过真机校准；
- AzurPilot-for-Android 当前锁定的 AzurPilot commit `4ac2ae...` 仍保留已被真机 issue #1089 证明会导致 Restart 循环的 `mCurrentFocus` 判定；
- AzurPilot-for-Android 另有 Redmi K50 的 touch/swipe 失败现场报告。

Node-01 已 Root。ALAS-AOS 仍需 Shizuku，但 Root 设备启动 Shizuku 不需要 PC 常驻；这是额外组件，不是当前 blocker。

如果 ALAS-AOS 在 K20/MIUI 10 上出现明确 blocker，再试 AzurPilot-for-Android；如果两个 Android 宿主都失败，才回退 original Alas + official AidLux 0.92。

## 上游各自拥有自己的调度

```text
MFABD2 → 自己的运行配置 / 定时 / 前台服务 / 后台虚拟屏
ALAS-AOS / AzurPilot-for-Android → 各自内置 ALAS/AzurPilot scheduler + Android host runtime
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

### Azur Lane Android APK candidates

- ALAS-AOS 与 AzurPilot-for-Android 的 ARM64 APK 能否在 MIUI 10 / Android 9 正常安装和初始化 Runtime；
- ALAS-AOS 的 Shizuku backend 与 AzurPilot-for-Android 的 Root backend 哪条在 Node-01 更稳定；
- 1280×720 BACKGROUND 虚拟屏能否稳定运行碧蓝航线；
- 截图颜色、点击/滑动在 K20 上是否准确；
- 当前已知 Android 虚拟屏前台判断/触控问题是否会在 K20 复现；
- 6 GB RAM 下游戏 + PRoot/AzurPilot 的长期资源占用是否可接受；
- 停止/重新启动调度后的恢复是否稳定。
