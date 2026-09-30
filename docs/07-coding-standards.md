# 07｜项目编程规范：从 ai-coding-cognition 引入

这套规范用来约束 LLM 常见的猜测、过度设计、自证完成和把技术问题丢回给 Owner。可执行 skill 在 `plugins/penrix-coding-core/skills/`。

## Owner / Coding Agent

Penrix 决定可见行为、范围、数据影响、权限、成本、外部副作用、不可逆行为和重要风险。Coding Agent 决定普通实现机制、测试、调试、代码组织和上游对齐方式。

不要问 Owner “mutex 还是 CAS”“要不要再包一层 adapter”这类程序员问题。

## Reality 高于 LLM 合同

Issue、旧聊天、计划、README、handoff 都可能过期。用户明确的目标和边界保留；文件、根因、版本、当前行为、上游和验收覆盖都要重新验证。

## Source Baseline

如果以后出现 `repo=vN` 但 Node-01 已运行 `vN+1`，先保护更新运行副本和数据，再恢复/对齐源码。不能用旧仓库重新实现新运行版本里已经存在的能力。

## Preservation Envelope

一次改动只授权一个行为 delta。非简单改动只列“已被接受且本次真的可能伤到”的行为。

典型例子：

- 改 PDD 检测速度，保留“一天成功后后续时段跳过”；
- 接 MFABD2，保留 Supervisor 的屏幕所有权；
- 改恢复逻辑，不能把 Windows 变成 runtime 依赖；
- 做 Alas 本机化，不重写成熟的游戏任务逻辑。

## Complexity Gate

新增 retry、fallback、cooldown、wrapper、adapter、interface、compatibility、cache、第二真相源、新 safety/lifecycle state 或“以后扩展”配置前，先回答：

> 哪个已经观察到的 Reality 要求它存在？

“更安全”“以后可能需要”“生产系统一般这样”不是证据。

尤其防止：Supervisor 和子任务各做 scheduler、两套 claimed_today、两套 watchdog、Adapter 再包 Adapter、测试 cooldown 偷渡生产。

## 常见失败模式

- silent assumption drift
- symptom patching
- drive-by edits
- overengineering
- defensive fantasy
- duplicate authority
- action bias
- test self-certification
- wrapper proliferation
- self-certifying completion
- unit-test tunnel vision

“No code change required”可以是正确结果。

## Evidence classes

只使用：

- `LIVE VERIFIED`
- `CODE VERIFIED, LIVE UNVERIFIED`
- `NOT VERIFIED / BLOCKED`

真机证据要绑定 revision/package、实际 K20 环境、实际走过的行为、观察时间。

## Android environment routing

Emulator 可证明通用 Android 行为；以下应尽量真机验收：MIUI、root、AutoJs6、Accessibility tree、输入 latency、PDD 时序、实际 OCR/模板、MFABD2 权限/截图、多 App watchdog、游戏→PDD→游戏恢复、真实网络/供电。

## Review

重要 review finding 必须落成 ACCEPTED / REJECTED / DEFERRED / UNRESOLVED，不能在最终交付里静默消失。

## Handoff

最终说清楚：改了什么、现在能做什么、证据是什么、哪些没证明、下一步 Coding Agent 做什么、是否真的需要 Owner 决定。

## Reality Reconnaissance — PRE / POST

Every production-code task uses `reality-reconnaissance` before coding and again against the finished diff.

PRE must gather the smallest relevant set of current repo facts, official/platform/upstream source and tests, current Issues/releases, real user field reports, and Node-01 environment facts. For external integrations, answer how the thing is actually installed, configured, authorized and run; what versions and permissions are required; which component owns the behavior; what users report as the common working/failing path; and what real-device observation would prove success.

POST is an attack on the final mechanism, not a reread of PRE notes. Inventory the concrete APIs, versions, paths, permissions, state ownership, fallbacks/retries and operational steps now present in the diff, then re-check those exact assumptions. Mark each material assumption `MATCH`, `MISMATCH`, or `UNVERIFIED`. Fix MISMATCH before completion; carry material UNVERIFIED items into the evidence status.

Do not search merely to decorate a plan. Research must eliminate or constrain implementation choices. Real user reports reveal operational failure modes but do not substitute for upstream contracts or Node-01 live evidence.
