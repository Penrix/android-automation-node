# 01｜当前最小架构

## 当前优先级

先把两个游戏的手机本机运行链路弄清并最终实测：

```text
Brown Dust 2 → MFABD2 Android
Azur Lane     → AzurPilot-for-Android
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

当前第一候选改为：

```text
wess09/AzurPilot-for-Android
→ 官方 Android ARM64 full APK
→ Root backend
→ 内置 Ubuntu/PRoot + AzurPilot runtime
→ 1280×720 后台虚拟屏
→ Azur Lane
```

理由：

- 项目 minSdk = 28，正好是 Android 9；
- 官方支持 ARM64；
- 同时实现 Shizuku / Root，Node-01 直接用 Root；
- 内置 Linux/Python runtime，不再需要单独安装 AidLux / Termux；
- 专门的 `azurpilot_android` 后端不走 ADB/uiautomator2，而是通过本机特权桥截图/触控虚拟屏；
- 虚拟屏固定横屏 1280×720，因此不需要先改 K20 主显示分辨率；
- 已发布可安装的 ARM64 full APK。

原版 Alas + 官方 AidLux 0.92 保留为 fallback，不再是第一路线。

这个 Android 项目很新，K20/Android 9 尚无完整 live evidence，因此仍然必须真机验收。

## 上游各自拥有自己的调度

```text
MFABD2 → 自己的运行配置 / 定时 / 前台服务 / 后台虚拟屏
AzurPilot-for-Android → 内置 AzurPilot scheduler + Android host runtime
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

### AzurPilot-for-Android

- 当前 ARM64 full APK 能否在 MIUI 10 / Android 9 正常安装和初始化 Runtime；
- Root backend 能否稳定拉起特权桥；
- 1280×720 BACKGROUND 虚拟屏能否稳定运行碧蓝航线；
- 截图颜色、点击/滑动在 K20 上是否准确；
- 当前已知 Android 虚拟屏前台判断/触控问题是否会在 K20 复现；
- 6 GB RAM 下游戏 + PRoot/AzurPilot 的长期资源占用是否可接受；
- 停止/重新启动调度后的恢复是否稳定。
