> **REFERENCE ONLY — not default authority.** Current behavior is governed by `START-HERE.md`, `docs/01-architecture.md`, `docs/08-execution-plan.md`, and live evidence. This file preserves preparation/research details and may contain superseded intermediate wording.

# 13｜MFABD2 Android 控制边界：先直接调用，不造 Adapter

## 结论

准备阶段已经有足够源码证据把首版控制方式再缩小：

```text
启动 MFABD2
→ app.launchPackage("io.github.sunyink.mfabd2")

停止 MFABD2 automation host
→ root shell:
   am force-stop io.github.sunyink.mfabd2
```

这两条只作为 Final Live Gate 的第一候选动作。

当前**不实现 BrownDust2Adapter**。

---

## 1. 固定上游证据

MFABD2 Android 文档固定 MaaFwApp：

`Aliothmoon/MaaFwApp@f4f6f220e21e3a1b7b0cf5df4bdbe0ec04c668f7`

MFABD2 正式 Android package：

`io.github.sunyink.mfabd2`

Brown Dust 2 package：

`com.neowizgames.game.browndust2`

---

## 2. MainActivity 已经是公开启动边界

固定 MaaFwApp Manifest：

```xml
<activity
    android:name=".MainActivity"
    android:exported="true"
    android:launchMode="singleTop">
    <intent-filter>
        MAIN
        LAUNCHER
    </intent-filter>
</activity>
```

所以启动宿主不需要：

- 自定义 IPC；
- 深链；
- 自建 Android bridge；
- Adapter factory。

AutoJs6 自己已有 `app.launchPackage`。

---

## 3. force-stop 为什么是有源码依据的第一候选

同一固定 Manifest 的注释明确说明：

```text
后台跑任务期间 app 进程必须活着
→ app 进程一死
→ 特权进程的看门狗自杀
→ 释放虚拟屏
```

MaaFwApp 自己还记录了 MIUI `SwipeUpClean` 会直接 force-stop 该 app 的现实行为，
并专门使用 `RunForegroundService` 对抗这种意外停止。

这说明：

> “宿主进程死亡会结束它的特权执行环境”本身就是上游设计的一部分。

AutoJs6 源码已经支持 root shell，并在文档里直接给出：

`shell("am force-stop <package>", true)`

因此首版 PDD 抢占前的停止动作，不需要先设计 MFABD2 专属控制协议。

---

## 4. 仍然不能从源码直接宣称的东西

SOURCE VERIFIED 不等于 Node-01 LIVE VERIFIED。

最终必须观察：

```text
am force-stop io.github.sunyink.mfabd2
→ MFABD2 UI 消失？
→ 特权进程多久退出？
→ 虚拟屏多久释放？
→ Brown Dust 2 本体处于什么状态？
→ PDD 是否立即获得正常前台屏幕？
```

尤其是：

> “停止后如何恢复原挂机任务”

当前仍没有足够源码证据证明只 launch MFABD2 就会自动续上之前的任务。

因此 Final Live 直接调用这两个现成边界即可，不再为一行调用维护 wrapper 文件。

仍然没有 `resume()`，因为恢复行为没有 live 证据。

---

## 5. MFABD2 自己也有调度系统

固定 MaaFwApp 源码还包含：

- exact alarm / schedule receiver；
- schedule execution foreground service；
- boot rescheduling；
- duplicate request id；
- run launcher；
- foreground keep-alive。

这进一步说明我们不应该在外面再复制一个“Brown Dust 2 调度器”。

项目自己的 Supervisor 只拥有跨应用优先级：

```text
PDD 到点
→ 暂时让 MFABD2 失去执行权
→ PDD 完成
→ 恢复到实机验证出来的最小 MFABD2 入口
```

MFABD2 内部怎么排游戏任务继续由 MFABD2 自己负责。

---

## 6. Complexity Gate

拒绝进入首版的机制：

- BrownDust2Adapter；
- health/recover interface；
- shadow schedule state；
- 重复的 Brown Dust 2 task queue；
- 模拟 MFABD2 内部调度；
- 猜测式 resume API。

只有 Final Live Gate 证明 `launchPackage + force-stop` 不够时，才增加最薄缺口。

---

## 7. Evidence

```text
MFABD2 Android package:
PACKAGE/SOURCE VERIFIED

MaaFwApp exported launcher Activity:
SOURCE VERIFIED

MaaFwApp process-death → privileged runtime teardown design:
SOURCE VERIFIED

AutoJs6 launch/root force-stop primitives:
SOURCE VERIFIED

Node-01 stop/release/resume behavior:
LIVE UNVERIFIED
```
