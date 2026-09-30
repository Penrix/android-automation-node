# 04｜游戏自动化：当前最小路线

目标不是自己重写游戏机器人，而是复用成熟执行器，让 PDD 在三个时间窗能临时拿到手机。

## 1. 总原则

```text
Brown Dust 2
→ MFABD2 Android APK

Azur Lane
→ Alas 本机化

PDD
→ AutoJs6 自定义任务
```

项目不建立统一 GameBot interface，不重新实现游戏内部日常、调度或 watchdog。

---

# 《棕色尘埃2》 / MFABD2

上游：

- https://github.com/sunyink/MFABD2

当前上游明确提供 Android ARM64 APK，并要求：

- Android 9+；
- ARM64；
- Root 或 Shizuku；
- 对应的游戏语言/画面配置。

Node-01 基础条件吻合，但仍是：

```text
PACKAGE/SOURCE SUPPORTED
NODE-01 LIVE UNVERIFIED
```

Final Live 只需要先证明：

```text
安装
→ Root 授权
→ 跑一个最小任务
→ PDD 前让 MFABD2 退出
→ 观察真实恢复入口
```

已知第一候选边界：

```text
launch:
app.launchPackage("io.github.sunyink.mfabd2")

stop:
shell("am force-stop io.github.sunyink.mfabd2", true)
```

如果 launch 后能自然续跑，就不加任何额外层。

只有真机证明这两条不够，才补最小缺口；不先造 BrownDust2Adapter。

---

# 《碧蓝航线》 / Alas

上游：

- https://github.com/LmeSzinc/AzurLaneAutoScript

Alas 已经负责碧蓝航线自己的主线、活动、委托、科研、后宅、战术学院、商店、大世界、心情控制和内部任务调度。

因此不使用 AutoJs6 重写这些能力。

当前唯一集成问题：

> 如何让 Alas controller 也在 K20 Pro 本机运行，而不是依赖 Windows。

基于当前源码和真实用户反馈，第一候选已经收敛为：

```text
AidLux 0.9.2
+ Android 9
+ Snapdragon 855
+ Alas upstream AidLux configuration
+ localhost ADB
```

Final Live 第一阶段只证明：

```text
AidLux starts
→ Python / adb available
→ current Alas loads
→ localhost ADB sees same phone
→ Alas gets one screenshot
```

在这个 proof 通过前：

- 不 fork Alas；
- 不做通用安装器；
- 不做 AzurLaneAdapter；
- 不同时维护 Termux/proot/chroot/Docker 多路线。

只有第一候选出现明确 blocker，才进入第二候选。

---

# PDD 如何与游戏共存

当前不是常驻 Supervisor。

真实闭环只有：

```text
游戏执行器自己正常跑
→ AutoJs6 PDD TimedTask 提前触发
→ 用该执行器真实可用的最小停止方式让出手机
→ PDD
→ 用真实验证出来的入口恢复原游戏执行器
```

MFABD2 和 Alas 内部怎么安排任务，继续由它们自己负责。

---

# 资源约束

Node-01 是 6 GB RAM。

不预先设计“多游戏并行”。原则只是：同一时刻不要无证据地同时常驻多个大型游戏 + 多套重运行时。

具体内存是否足够，由 Final Live 和后续 soak 观察，不靠猜测加限制。

---

# 开发工具

需要时使用 ADB / scrcpy、uiautomator2、Airtest / OpenCV、GKD Inspect。

这些是开发/诊断工具，不是 24×7 runtime 前置依赖。

---

# 安全边界

不做反作弊绕过、Root 隐藏、Hook 反检测、伪造设备以规避封禁或绕过游戏安全机制。

只处理用户自己设备上的重复 UI 自动化。
