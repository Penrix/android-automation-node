# 01｜当前最小架构

## 目标

手机手动开机进入 Android 后，长期运行游戏自动化；PDD 到三个刷新时间前临时拿到手机，抢完后恢复原游戏。

## 运行职责

```text
AutoJs6
→ PDD 定时入口
→ PDD 页面识别 / 点击

MFABD2
→ 棕色尘埃2内部自动化

AidLux + Alas
→ 碧蓝航线内部自动化
```

Windows/Codex 只负责开发、安装、调试和维护，不是运行依赖。

## 跨应用闭环

```text
游戏执行器正常运行
→ AutoJs6 在实测的 prepare_lead 前触发 PDD
→ 当前游戏用其真实可用的最小方式让出手机
→ PDD 到整点刷新 / 识别 / 兑换 / 验证
→ 恢复刚才的游戏执行器
```

MFABD2 和 Alas 的内部任务、调度、保活继续由它们自己负责。

## 当前唯一持久业务状态

```text
claimed_date = YYYY-MM-DD
```

因为一天只能兑换一张。成功后，当天后续 PDD 时间窗直接退出。

“刚才运行的是哪个游戏”首版只在本次抢占调用中临时记住；没有真实故障证明需要落盘。

## PDD 时间

目标刷新时间：

```text
09:00
16:00
21:00
```

AutoJs6 TimedTask 的启动时间不是写死整点，而是：

```text
目标刷新时间 - prepare_lead
```

`prepare_lead` 必须由 K20 Pro 真机测出。

## 已知 MFABD2 候选边界

```text
launch:
app.launchPackage("io.github.sunyink.mfabd2")

stop candidate:
shell("am force-stop io.github.sunyink.mfabd2", true)
```

恢复方式等真机观察；如果上游自然能续跑，不加任何额外层。

## Alas 第一候选

```text
AidLux 0.9.2
+ Android 9
+ Snapdragon 855
+ current Alas
+ localhost ADB
```

先证明本机进程、ADB 和截图，不提前做更大集成。

## Final Live 前故意未知

- PDD Accessibility 实际暴露什么；
- prepare_lead 是多少；
- 哪种点击方式最快；
- MFABD2 实际恢复入口；
- AidLux 上当前 Alas 依赖实际状态。

这些问题必须由 K20 Pro 真实运行回答。
