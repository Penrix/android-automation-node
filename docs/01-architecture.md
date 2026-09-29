# 01｜当前架构：Event-driven preemption，暂不设常驻 Supervisor

> 本页描述“当前最小架构”。早期 Supervisor-first 思路保留在历史认知与自检记录里；经过上游源码审计和 Complexity Gate 后，首版已经继续减负。

## 一句话

当前不是：

```text
一个自研 Supervisor
→ 接管所有游戏/任务自己的 scheduler、watchdog、recovery
```

而是：

```text
各成熟执行器继续拥有自己的内部任务
+
AutoJs6 TimedTask 只负责 PDD 三个跨应用时间点
+
PDD live handler 临时抢占当前受管游戏
+
完成后恢复真实验证出来的原任务入口
```

---

## 1. 当前顶层结构

```text
K20 Pro / Node-01
│
├─ AutoJs6
│  ├─ TimedTask 09:00
│  ├─ TimedTask 16:00
│  ├─ TimedTask 21:00
│  └─ runtime/pdd/live.js   ← Final Live evidence 后才创建
│
├─ MFABD2
│  └─ 自己负责 Brown Dust 2 的内部任务、调度、保活
│
├─ Alas
│  └─ 自己负责 Azur Lane 的内部任务、调度
│
└─ 其他未来任务
   └─ 有真实冲突再决定是否需要进一步统一
```

当前没有常驻自研 Supervisor daemon。

---

## 2. 谁拥有“时间”

### PDD

唯一 scheduler owner：

> AutoJs6 TimedTask

三个每日任务：

```text
09:00
16:00
21:00
```

项目不再额外写 `setInterval` 轮询时间。

### Brown Dust 2

MFABD2 自己已有 schedule / run launcher / foreground keep-alive。

不复制它的内部任务调度。

### Azur Lane

Alas 自己已有成熟任务系统。

不把 Alas 的内部日常拆出来重新塞进 AutoJs6。

---

## 3. 我们自己的唯一首版职责：跨应用抢占

Owner 已明确：

```text
游戏挂机
→ PDD 到点
→ 游戏让出手机
→ 抢券
→ 抢完继续挂机
```

所以首版项目自己真正需要拥有的不是“全部调度”，而是：

> **跨应用优先级切换。**

当前最小流程：

```text
AutoJs6 TimedTask fires
→ 如果今天已成功领取：exit
→ 识别当前受管游戏任务
→ 用已验证的最小停止动作让出控制权
→ 执行 PDD
→ 记录成功/失败
→ 用已验证的最小恢复入口恢复之前任务
```

停止/恢复的具体实现不能在上机前猜。

---

## 4. 当前允许的持久状态

已经有现实需求的只有：

```text
claimed_date
previous_managed_task
```

其中：

### claimed_date

Owner 明确一天只能兑换一张。

所以：

```text
09:00 success
→ claimed_date = today
→ 16:00 / 21:00 entry immediately exits
```

### previous_managed_task

PDD 完成后必须知道恢复谁。

最终表示形式要等真实 MFABD2 / Alas runtime 确定。

当前不预设它一定是：

- process id；
- package；
- AutoJs6 engine；
- config name；
- adapter object。

---

## 5. 当前没有 Task Lock

早期架构设计了 `screen_owner` / Task Lock。

现在先不实现。

原因：

- 当前跨应用抢占入口只有 PDD；
- PDD scheduler 本身只注册一条同路径任务/时间；
- 安装器会去除同一路径旧任务，避免重复触发；
- 游戏执行器各自有自己的生命周期；
- 尚未观察到多个项目内 task 并发争抢屏幕的真实 failure。

如果 Final Live 后出现真实竞态，再根据故障增加最小互斥。

---

## 6. 当前没有通用 Watchdog

MFABD2 已有自己的：

- foreground keep-alive；
- privileged process lifecycle；
- watchdog；
- schedule recovery。

Alas 也有自己的成熟运行/错误处理结构。

我们不在外面再写第二套通用 Watchdog。

项目级 recovery 规则现在只有：

```text
observed failure
→ 找到 authority
→ 最小修复
→ live verify
```

没有“Level 1 到 Level 5 自动升级重启手机”。

---

## 7. MFABD2 当前边界

Source evidence 已经支持首个 live 候选：

```text
launch:
app.launchPackage("io.github.sunyink.mfabd2")

stop:
root shell
am force-stop io.github.sunyink.mfabd2
```

MaaFwApp 固定源码说明 app 进程死亡后特权进程会退出并释放虚拟屏。

但：

```text
resume = ?
```

仍必须 Final Live 观察。

因此没有 BrownDust2Adapter，也没有伪造 resume API。

详见：

`docs/13-mfabd2-control-boundary.md`

---

## 8. Alas 当前边界

当前第一候选：

```text
AidLux 0.9.2
+ Android 9
+ Snapdragon 855
+ Alas upstream AidLux configuration
```

Final Live 先证明：

```text
runtime starts
→ Python/ADB available
→ Alas loads
→ localhost ADB sees same phone
→ screenshot proof
```

在这之前不定义 Alas 的 stop/resume shim。

详见：

- `docs/10-alas-on-device-preflight.md`
- `docs/14-alas-aidlux-dependency-audit.md`

---

## 9. PDD live handler 为什么还不存在

真实页面还没采证。

所以现在不知道：

- Accessibility 是否直接暴露目标；
- 目标节点属性；
- 模块浮动范围；
- Root tap 和 A11y click 的真实速度；
- screenshot/template 的真实耗时；
- OCR 是否需要。

因此：

`runtime/pdd/live.js`

故意不存在。

Final Live L1 先跑：

`tools/node01/pdd-snapshot.js`

然后只按真实 evidence 写最小 handler。

---

## 10. Windows / Codex 的角色

只做：

- 上游源码审计；
- 写/改脚本；
- 最终 ADB 调试；
- evidence 读取；
- 出错时分析；
- 发布维护。

不做 24×7 runtime brain。

手机断开 Windows/Codex 后仍应自主运行。

---

## 11. 什么时候才升级成真正 Supervisor

只有未来观察到类似以下真实需求：

```text
多个自研任务同时竞争手机
跨多个游戏需要统一可取消队列
多个执行器都没有自己的可靠 scheduler
必须共享一个明确设备级 state machine
```

才重新评估常驻 Supervisor。

不能因为“自动化平台通常应该有”就提前建设。

---

## 12. 当前第一版闭环

仍然只证明一件事：

```text
真实游戏挂机
→ PDD TimedTask 到点
→ 游戏真实停止并让出
→ PDD 真实兑换
→ 状态持久化
→ 真实游戏恢复
```

这个闭环 LIVE VERIFIED 之前，不扩展“大而全自动化平台”。
