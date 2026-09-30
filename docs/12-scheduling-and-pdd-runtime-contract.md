# 12｜PDD 调度最小合同

本页只保留 Final Live 前已经被 Reality 支撑的事实。

## 调度 owner

PDD 的三个刷新目标：

```text
09:00
16:00
21:00
```

AutoJs6 自带持久 TimedTask，因此不写项目自己的轮询 scheduler。

TimedTask 的实际启动时间必须是：

```text
目标刷新时刻 - prepare_lead
```

`prepare_lead` 只能由 K20 Pro 真机测出：

```text
当前游戏让出
→ 拉起 PDD
→ 到目标页
→ detector ready
```

需要多久。

在这个数字出来之前，不创建 schedule config、不注册生产定时任务。

## 唯一持久业务状态

```text
claimed_date
```

原因只有一个：Owner 明确一天只能兑换一张。

成功后：

```text
claimed_date = today
```

当天后续入口直接退出。

## 当前游戏身份不持久化

PDD 确实需要在完成后恢复刚才的游戏，但首版只在**本次抢占调用内**记住当前执行器。

没有现实证据要求为了脚本崩溃后自动恢复上一任务而增加磁盘状态。

如果以后真的观察到这个故障，再加。

## 注册方式

Final Live 得到：

1. 真正的 `runtime/pdd/live.js`；
2. 实测 `prepare_lead`；

之后，直接使用 AutoJs6 `tasks.addDailyTask` 注册三条任务即可。

不保留专门 installer/remove wrapper。

## Evidence

```text
AutoJs6 TimedTask API:
SOURCE VERIFIED

prepare_lead:
LIVE UNVERIFIED

PDD live handler:
NOT CREATED BY DESIGN
```
