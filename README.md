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
9. [docs/08-execution-plan.md](docs/08-execution-plan.md)  
   Node-01、拼多多、MFABD2、Alas 与长期无人值守的当前执行计划。
10. [docs/09-preflight-readiness.md](docs/09-preflight-readiness.md)  
   按 skill 自检后的修正：所有准备先完成，K20 Pro 真机测试放在最终 Live Gate。
11. [docs/10-alas-on-device-preflight.md](docs/10-alas-on-device-preflight.md)  
   Alas 在 Android 9 / Snapdragon 855 上的本机化候选路线与证据。
12. [docs/11-final-live-receipt-template.md](docs/11-final-live-receipt-template.md)  
   最终一次性上机时使用的验收与证据模板。

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
1. 完成上游源码/依赖/安装包准备
2. 写最薄 Supervisor
3. 准备 PDD 采证与延迟 benchmark 工具
4. 准备 MFABD2 最小验收合同
5. 收敛 Alas 本机 runtime 第一候选
6. 做完代码级自检
7. 最后一次集中上 K20 Pro 验收
8. 根据真实故障增量加入 Watchdog/Recovery
```

不要一开始把所有上游都 fork，也不要先做一个庞大通用框架。
