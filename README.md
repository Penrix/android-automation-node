# android-automation-node

一台长期在线、Root、固定环境的 Android 真机，不再只被当作“挂机手机”，而被当作一个可长期演进的 **Android Automation Node**。

当前第一台节点是 Redmi K20 Pro。这个仓库保存的不只是脚本，也保存围绕这台节点形成的设计认知、决策过程、任务边界和后续实现。

> Coding Agent / Codex 进入仓库后先读 [START-HERE.md](START-HERE.md) 和 [AGENTS.md](AGENTS.md)。

## START HERE

第一次进入仓库，按这个顺序阅读：

1. [docs/00-origin-and-cognition.md](docs/00-origin-and-cognition.md)  
   这套方案是怎样从“旧手机还能怎么玩”逐步形成的。保留认知形成过程，不只保留最后结论。
2. [docs/01-architecture.md](docs/01-architecture.md)  
   当前总架构：Supervisor、任务切换、Watchdog、恢复、状态持久化。
3. [docs/02-k20pro-baseline.md](docs/02-k20pro-baseline.md)  
   Node-01 的固定设备基线和约束。
4. [docs/03-pdd-coupon.md](docs/03-pdd-coupon.md)  
   拼多多百亿补贴会员 5 元券任务的已知现实与低延迟方案。
5. [docs/04-game-automation.md](docs/04-game-automation.md)  
   《碧蓝航线》《棕色尘埃2》以及通用游戏挂机的当前认知。
6. [docs/05-upstream-strategy.md](docs/05-upstream-strategy.md)  
   哪些东西我们自己拥有，哪些优先复用上游，什么时候才值得 fork。
7. [docs/06-tooling-research-notes.md](docs/06-tooling-research-notes.md)  
   GKD、AutoJs6、uiautomator2、Airtest 等已经做过的工具研究，防止以后重复调查和回退认知。
8. [docs/07-coding-standards.md](docs/07-coding-standards.md)  
   从 ai-coding-cognition 引入并针对 Android 真机自动化收窄的编程约束。

## 当前核心判断

这个项目不是“写几个自动点击脚本”。

它要解决的是：

```text
K20 Pro 长期在线
        ↓
统一 Supervisor
        ↓
在多个任务之间安全切换
        ↓
任务失败可恢复
        ↓
电脑和 Codex 只用于开发/维护
        ↓
手机离开电脑后仍能自主运行
```

当前任务族：

```text
Android Automation Node
├─ Supervisor / Scheduler
├─ Watchdog / Recovery
├─ 拼多多抢券
├─ 碧蓝航线
├─ 棕色尘埃2
└─ 后续其他签到 / 收菜 / 自动化任务
```

## 项目原则

- **手机是运行节点，Windows/Codex 是开发工具，不是 24×7 运行依赖。**
- **总调度优先于孤立脚本。** 任务必须知道什么时候让出屏幕、什么时候恢复。
- **复用成熟上游，不重复发明。** MFABD2、Alas、AutoJs6 能直接承担的能力先复用。
- **不为“可能以后需要”提前 fork。** 只有出现真实修改需求才 fork。
- **对抢券类低延迟任务，不默认使用整屏 OCR。** 优先 Accessibility，其次局部模板/颜色，再以 OCR 兜底。
- **长期稳定性比演示成功更重要。** 异常检测、日志、恢复和持久状态是一等公民。
- **固定设备是优势。** 分辨率、DPI、ROM、Root 环境、游戏版本能固定时，优先利用这个确定性。
- **不做反作弊绕过、Root 隐藏或规避检测。** 游戏自动化只处理自己的重复 UI 操作和日常任务。

## 当前阶段

当前仍处于“认知落仓 + 运行底座定型”阶段。

最近的实现顺序应当是：

```text
1. 建立最薄 Supervisor
2. 做任务互斥 / 状态持久化 / 超时恢复
3. 接入拼多多任务
4. 实机测 Accessibility / 模板 / Root tap 延迟
5. 接入 MFABD2 Android
6. 研究 Alas 本机化
7. 再扩展其他游戏与日常任务
```

不要一开始把所有上游都 fork，也不要先做一个庞大通用框架。
