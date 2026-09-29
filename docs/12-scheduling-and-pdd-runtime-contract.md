# 12｜PDD 调度与运行时合同

## 1. 调度 owner 已收敛

首版不自己写常驻轮询 scheduler。

AutoJs6 6.7.0 已经提供：

- `tasks.addDailyTask`
- `tasks.queryTimedTasks`
- `tasks.removeTimedTask`
- TimedTask 持久化
- AlarmManager / WorkManager / JobScheduler 后端

AlarmManager 后端源码调用：

`setExactAndAllowWhileIdle(RTC_WAKEUP, triggerAtMillis, ...)`

因此首版调度结构是：

```text
AutoJs6 TimedTask
├─ 09:00 - measured prepare_lead → runtime/pdd/live.js
├─ 16:00 - measured prepare_lead → runtime/pdd/live.js
└─ 21:00 - measured prepare_lead → runtime/pdd/live.js
```

进入脚本后先完成抢占和页面准备；到目标整点才执行 refresh → detect → redeem。

由 AutoJs6 负责“什么时候启动脚本”。

项目自己的 PDD runtime 只负责“启动后做什么”。

---

## 2. 为什么不再造 Supervisor 时钟

如果我们再写：

```text
setInterval
→ 每秒/每分钟看时间
→ 自己判断 09/16/21 点
```

就会产生两个调度 owner：

```text
AutoJs6 scheduler
+
项目自己的 scheduler
```

Complexity Gate 不允许这种无证据的重复 authority。

所以首版没有自制时钟线程。

---

## 3. 三个时间点如何安装

准备工具：

- `tools/node01/install-pdd-schedule.js`
- `tools/node01/remove-pdd-schedule.js`

安装器只认：

- `runtime/pdd/live.js`
- `runtime/pdd/schedule.json`

任一不存在都会明确失败。schedule.json 只有 Final Live 测出准备提前量后才能生成。

这条 guard 有现实依据：

> 不能把尚未根据真实 PDD 页面证据完成的脚本注册成每天自动执行的外部副作用。

安装器重跑时会先移除**同一目标路径**的旧 TimedTask，再注册三条。

这里的去重不是“未来安全幻想”，而是防止安装器被重复执行后在同一分钟触发多次兑换，是持久定时任务的直接副作用。

---

## 4. PDD runtime 必须遵守的最小状态

页面证据出来后编写的 `runtime/pdd/live.js` 至少需要一个事实状态：

```text
claimed_date = YYYY-MM-DD
```

原因是 Owner 已明确：

> 一天只能兑换 1 张。

因此：

```text
09:00 成功
→ claimed_date = 今天
→ 16:00 / 21:00 启动后立即退出
```

不需要先发明：

- 通用 job database；
- task queue；
- distributed lock；
- retry ledger；
- 多级状态机。

---

## 5. 抢占状态

Owner 还要求：

```text
游戏挂机
→ PDD 抢占
→ 抢完恢复游戏挂机
```

真实执行器边界目前仍未知，所以现在只固定“需要记住什么”，不固定“怎么停/怎么恢复”。

最小事实：

```text
previous_managed_task
```

最后上机看到 MFABD2 / Alas 的真实控制方式后，再决定它是：

- 一个 AutoJs6 engine；
- 一个 Android app/process；
- 一个 AidLux/Linux process；
- 或其他真实对象。

在此之前不建立统一 Adapter。

---

## 6. 调度精度的 Reality Gate

源码证明 AlarmManager 后端意图使用 exact alarm。

但下面这条仍必须最终真机验证：

```text
K20 Pro + MIUI 10 + AutoJs6 6.7.0
09:00 / 16:00 / 21:00
实际唤起脚本的时间误差
```

最终 Live Gate 必须记录：

```text
scheduled_at
engine_started_at
delta_ms
```

如果实测误差已经满足抢券需求，不再增加任何额外时钟机制。

只有实测不满足，才调查 MIUI 后台限制或其他调度方案。

---

## 7. 当前证据等级

```text
AutoJs6 TimedTask API:
SOURCE VERIFIED

AlarmManager exact scheduling implementation:
SOURCE VERIFIED

PDD three-times-per-day schedule design:
CODE/DESIGN PREPARED

K20 actual timing precision:
LIVE UNVERIFIED
```
