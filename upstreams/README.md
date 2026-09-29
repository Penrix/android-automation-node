# Upstream Registry

不把第三方工具整仓复制进来。优先保留链接、审查状态和依赖理由。

## Coding-agent upstreams

| Upstream | Role | Integration |
|---|---|---|
| Penrix/ai-coding-cognition | Owner/Agent authority、Reality、Complexity Gate、handoff | 六个 Penrix Core skills 本地复制；项目规则做 Android 定制 |
| openai/plugins | Codex curated compatibility source | marketplace 引用 Superpowers / CodeRabbit / Codex Security / Test Android Apps |
| obra/superpowers | debugging、TDD、planning、worktrees、verification、review | semantic upstream；Codex 默认用 OpenAI curated mirror |
| multica-ai/andrej-karpathy-skills | think-first、simplicity、surgical change | 原则吸收，不单独安装 |
| golbin/agent-skills | 结果导向 success conditions | 原则吸收进 intent-contract |
| breadoncee/dumb-it-down | 非程序员 Owner handoff | 原则吸收进 owner-handoff |

## Android automation upstreams

| Upstream | Role | Policy |
|---|---|---|
| SuperMonster003/AutoJs6 | 本机通用 automation runtime | 直接复用；真实底层修改需求再 fork |
| sunyink/MFABD2 | 棕色尘埃2执行器 | 优先官方 Android APK |
| LmeSzinc/AzurLaneAutoScript | 碧蓝航线执行器 | 复用游戏逻辑，研究手机本机 runtime |
| gkd-kit/gkd | reactive Accessibility / Inspect | 可选，不做总 Supervisor |
| openatx/uiautomator2 | 开发期 UI tree / screenshot / ADB | 不做 24×7 依赖 |
| AirtestProject/Airtest | 困难视觉场景 | 需要时才引入 |

## Adding upstreams

只在它拥有当前栈没有 owner 的独立职责，或明确改善当前弱层时加入。不要因为“以后可能有用”而加入。

## Fork policy

```text
upstream unchanged works -> do not fork
uncertain -> experiment first
proven source-level change required -> fork that upstream only
```
