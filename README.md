# android-automation-node

一台长期在线、Root、固定环境的 Android 真机，不再只被当作“挂机手机”，而被当作一个可长期演进的 **Android Automation Node**。

当前第一台节点是 Redmi K20 Pro。这个仓库保存的不只是脚本，也保存围绕这台节点形成的设计认知、决策过程、任务边界和后续实现。

> Coding Agent / Codex 进入仓库后先读 [START-HERE.md](START-HERE.md) 和 [AGENTS.md](AGENTS.md)。

## START HERE

当前默认只读这些：

1. [START-HERE.md](START-HERE.md) — Coding Agent 路由与 skill 入口。
2. [docs/01-architecture.md](docs/01-architecture.md) — 当前最小架构。
3. [docs/02-k20pro-baseline.md](docs/02-k20pro-baseline.md) — Node-01 已知事实与边界。
4. [docs/03-pdd-coupon.md](docs/03-pdd-coupon.md) — PDD 当前产品现实和待真机决定的问题。
5. [docs/04-game-automation.md](docs/04-game-automation.md) — MFABD2 / Alas 当前路线。
6. [docs/05-upstream-strategy.md](docs/05-upstream-strategy.md) — 上游复用 / fork 边界。
7. [docs/07-coding-standards.md](docs/07-coding-standards.md) — 项目执行约束。
8. [docs/08-execution-plan.md](docs/08-execution-plan.md) — 当前执行顺序。
9. [docs/16-community-reality-playbook.md](docs/16-community-reality-playbook.md) — 实际安装/运行经验与最后上机路径。

`docs/00-origin-and-cognition.md` 保存认知形成历史。`docs/06` 和 `docs/09-15` 是研究/准备阶段参考，不是当前默认 Authority；只有具体问题需要时再读。

## 当前核心判断

这个项目不是“写几个自动点击脚本”。

它要解决的是：

```text
K20 Pro 长期在线
        ↓
成熟上游各自管理自己的游戏任务
        ↓
AutoJs6 TimedTask 触发跨应用 PDD 时间窗
        ↓
最薄的停止 / 抢券 / 恢复闭环
        ↓
电脑和 Codex 只用于开发/维护
        ↓
手机离开电脑后仍能自主运行
```

当前任务族：

```text
Android Automation Node
├─ AutoJs6 TimedTask / cross-app preemption
├─ 拼多多抢券
├─ MFABD2 / 棕色尘埃2
├─ Alas / 碧蓝航线
└─ 后续有真实需求再接入的任务
```

## 项目原则

- **手机是运行节点，Windows/Codex 是开发工具，不是 24×7 运行依赖。**
- **断电后来电自启不在项目范围。** K20 Pro 由 Owner 手动开机；软件只保证进入 Android 后的长期运行。
- **跨应用优先级只有一个 owner，执行器内部调度仍归执行器自己。** PDD 只在三个时间窗临时抢占手机。
- **复用成熟上游，不重复发明。** MFABD2、Alas、AutoJs6 能直接承担的能力先复用。
- **不为“可能以后需要”提前 fork。** 只有出现真实修改需求才 fork。
- **对抢券类低延迟任务，不默认使用整屏 OCR。** 优先 Accessibility，其次局部模板/颜色，再以 OCR 兜底。
- **长期稳定性比演示成功更重要，但只为真实出现的故障增加恢复机制。**
- **固定设备是优势。** 分辨率、DPI、ROM、Root 环境、游戏版本能固定时，优先利用这个确定性。
- **不做反作弊绕过、Root 隐藏或规避检测。** 游戏自动化只处理自己的重复 UI 操作和日常任务。

## 当前阶段

当前已接近“离线准备冻结”，尚未进入 K20 Pro Final Live Gate。

最近的实现顺序应当是：

```text
1. 上游源码/依赖/安装包准备   ✅
2. PDD scheduler / 采证工具    ✅
3. MFABD2 控制边界准备         ✅
4. Alas AidLux preflight       ✅
5. Complexity Gate removal     ✅
6. Final Live 前刷新 upstream
7. 最后一次集中上 K20 Pro 验收
8. 只按真实故障增量加入 recovery
```

不要一开始把所有上游都 fork，也不要先做一个庞大通用框架。
