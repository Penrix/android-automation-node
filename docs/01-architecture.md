# 01｜当前架构：Supervisor-first

## 一句话

这不是“若干脚本并排运行”。

它是：

> **一个 Supervisor 独占调度权，多个执行器按需获得屏幕和设备控制权。**

---

## 1. 顶层结构

```text
K20 Pro / Node-01
│
└─ Supervisor
   ├─ Scheduler
   ├─ Task Lock
   ├─ Persistent State
   ├─ Watchdog
   ├─ Recovery
   ├─ Logger
   │
   ├─ PDD Coupon Task
   ├─ BrownDust2 Adapter
   ├─ AzurLane Adapter
   └─ Future Tasks
```

Supervisor 负责“谁现在可以操作手机”。

子任务不应该各自随意定时、抢屏幕、重启 App。

---

## 2. 为什么不是每个脚本自己定时

错误形态：

```text
PDD.js 自己定时
GameA.js 自己定时
GameB.js 自己定时
MFABD2 自己跑
Alas 自己跑
```

这种结构迟早会出现：

- 同时点屏幕；
- 一个任务切 App，另一个又切回来；
- 一个任务 force-stop，另一个正在执行；
- 任务失败后没人知道应该恢复什么；
- 重启后不知道上次运行状态。

所以时间和资源控制权必须统一上收。

---

## 3. 最小状态机

第一版不要追求复杂。

只要这些模式：

```text
IDLE
GAME
PDD_PREPARE
PDD_CLAIM
RECOVERY
ERROR
```

可能的流转：

```text
GAME
  ↓ 抢券窗口到达
PDD_PREPARE
  ↓ 页面准备好
PDD_CLAIM
  ↓ 成功 / 超时
RECOVERY
  ↓ 恢复游戏成功
GAME
```

如果没有游戏任务：

```text
IDLE → PDD_PREPARE → PDD_CLAIM → IDLE
```

---

## 4. Task Lock：屏幕只能有一个主人

任何需要主动操作 UI 的任务，都必须先拿到前台控制权。

概念上：

```text
screen_owner = "pdd"
```

或者：

```text
screen_owner = "browndust2"
```

没有锁的任务不能：

- tap；
- swipe；
- 切换 Activity；
- force-stop 前台 App；
- 启动新前台 App。

这样才能避免多个自动化互相打架。

---

## 5. Watchdog 的职责

Watchdog 不是总调度器。

它只负责“异常是否出现”。

典型检查：

```text
目标进程是否存在
目标 Activity 是否合理
画面是否长时间不变
任务心跳是否超时
网络是否异常
当前脚本是否存活
```

发现问题后：

```text
Watchdog
→ 上报 Supervisor
→ Supervisor 决定是否进入 RECOVERY
```

不要让每个 Watchdog 自己随意重启所有东西。

---

## 6. Recovery 的职责

长期自动化真正重要的是恢复。

Recovery 要回答：

> 出事以后，怎么回到一个已知安全状态？

最小恢复层级：

```text
Level 1：关闭弹窗 / 返回安全页面
Level 2：重启当前 App
Level 3：重启当前任务执行器
Level 4：重启自动化 runtime
Level 5：重启手机
```

第一版不需要全部实现，但结构上应当允许逐步升级。

---

## 7. 持久状态

至少保存：

```text
date
current_mode
screen_owner
claimed_today
last_task
last_task_result
last_success_time
last_failure_reason
previous_game
```

目标：

手机或 runtime 意外重启后，不要失忆。

例如：

```text
2026-09-30
claimed_today=true
```

则当天 16:00 / 21:00 不再中断游戏去抢券。

---

## 8. 任务优先级

当前建议：

```text
P0 设备 / runtime 恢复
P1 拼多多抢券时间窗
P2 游戏关键定时任务
P3 普通游戏挂机
P4 普通签到 / 收菜 / 维护
```

这里的“优先级”不是说 PDD 可以随时粗暴 kill 游戏。

正确流程是：

```text
P1 到达
→ 通知当前任务准备让出
→ 保存必要状态
→ 超过安全等待上限后再强制接管
```

后面可按具体游戏调整。

---

## 9. 拼多多调度示例

已知刷新点：

- 09:00
- 16:00
- 21:00

示例：

```text
08:59:40
Supervisor
→ 请求游戏任务暂停
→ 确认游戏不再操作屏幕
→ 切换 PDD_PREPARE
→ 打开拼多多目标页
→ 预热截图 / 模板 / Root 输入

09:00:00 附近
→ 下拉刷新
→ 快速识别
→ 兑换

成功
→ claimed_today=true
→ RECOVERY
→ 恢复之前游戏
```

如果 09:00 成功：

```text
16:00 skip
21:00 skip
```

如果失败：

```text
16:00 再尝试
```

---

## 10. 外部执行器通过 Adapter 接入

MFABD2 和 Alas 都不应该直接侵入 Supervisor 内核。

采用 Adapter：

```text
Supervisor
   ↓
BrownDust2Adapter
   ├─ start()
   ├─ pause()
   ├─ resume()
   ├─ stop()
   ├─ health()
   └─ recover()

Supervisor
   ↓
AzurLaneAdapter
   ├─ start()
   ├─ pause()
   ├─ resume()
   ├─ stop()
   ├─ health()
   └─ recover()
```

底层到底是：

- APK；
- AutoJs6；
- Linux 进程；
- localhost ADB；

由 Adapter 自己处理。

Supervisor 不应该知道大量游戏细节。

---

## 11. Windows / Codex 的角色

只做：

- 写代码；
- 阅读上游；
- ADB 调试；
- 截图 / UI tree 检查；
- benchmark；
- 部署；
- 出错时分析日志。

不做：

- 24×7 调度主脑；
- 必须在线的 OCR 服务；
- 必须在线的控制器；
- 手机挂机必要依赖。

---

## 12. 第一版实现边界

第一版只需要证明这一条闭环：

```text
游戏任务运行
→ 抢券窗口到达
→ 游戏安全停止
→ PDD 任务运行
→ 成功或超时
→ 游戏恢复
```

在这个闭环稳定之前，不要扩展成“大而全自动化平台”。
