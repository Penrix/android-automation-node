> **REFERENCE ONLY — not default authority.** Current behavior is governed by `START-HERE.md`, `docs/01-architecture.md`, `docs/08-execution-plan.md`, and live evidence. This file preserves preparation/research details and may contain superseded intermediate wording.

# 15｜Pre-Live Gate 状态表

本页只回答一个问题：

> 在不碰 K20 Pro 的前提下，准备工作做到哪里；哪些东西必须留到最后真机才允许决定。

更新时间：2026-09-30。

Operational boundary:

`manual power-on → Android usable`

is accepted. Power-loss auto-boot / charger-mode / unattended cold-start recovery are out of scope.

## 已完成的准备

| Area | Evidence | 状态 |
|---|---|---|
| Penrix coding authority / complexity / reality skills | repo skills | READY |
| AutoJs6 6.7.0 ARM64 artifact identity + SHA256 | release/source | PACKAGE/SOURCE VERIFIED |
| AutoJs6 storage / shell / launch / screenshot / A11y / TimedTask primitives | source | SOURCE VERIFIED |
| PDD 09:00 / 16:00 / 21:00 scheduler owner | AutoJs6 TimedTask | DESIGN/CODE PREPARED |
| PDD read-only A11y + screenshot collector | project code | CODE PREPARED |
| PDD probe timing collection | project code | CODE PREPARED |
| MFABD2 4.5.0 Android ARM64 artifact + SHA256 | release/source | PACKAGE VERIFIED |
| MFABD2 launcher package | source | SOURCE VERIFIED |
| MFABD2 host process-death lifecycle | pinned MaaFwApp source | SOURCE VERIFIED |
| MFABD2 direct launch / force-stop boundary | upstream + AutoJs6 source | SOURCE VERIFIED |
| Alas AidLux first candidate | Alas source + 2026 issue evidence | SOURCE/COMMUNITY GROUNDED |
| AidLux read-only environment probe | project code | CODE PREPARED |
| Final live receipt | project docs | READY |

## 静态检查

实际 parse-only 通过：

```text
collect-baseline.js
pdd-snapshot.js
aidlux-preflight.sh (POSIX shell syntax)
```

这些仍只证明文本/脚本结构，不证明 Node-01 runtime。

## Complexity Gate removal pass

已执行 removal pass，并实际删除/否决了这些早期机制：

```text
常驻自研 Supervisor scheduler
Task Lock / screen_owner
6-state generic state machine
5-level Recovery ladder
universal Watchdog
MFABD2 Adapter interface
Alas Adapter interface
多个 Alas runtime 并行安装路线
```

保留下来的额外机制都能回答“哪个当前事实要求它”：

- PDD 三个 TimedTask：Owner 明确刷新时间；
- claimed_date：一天只能兑换一张；
- PDD read-only collector：真实页面结构和 latency 只有真机能回答；
- MFABD2 force-stop 候选：PDD 抢占需要让游戏执行器让出设备；
- AidLux preflight：Alas ARM64/native 依赖已有真实 blocker evidence。

## Complexity Gate：明确不做

上机前禁止把以下未知变成生产代码：

```text
PDD selector
PDD click coordinates
PDD template threshold
PDD OCR path
PDD retry strategy
MFABD2 resume implementation
MFABD2 Adapter
Alas Adapter
universal watchdog
multi-runtime Alas installer
power-loss auto-boot / charger-mode / unattended cold-start recovery
MIUI keepalive workaround
```

它们都需要真实 Node-01 evidence。

## 最后上机时的顺序已经固定

```text
L0
Node-01 baseline

L1
PDD read-only snapshot + timings

L2
根据 L1 证据写最小 runtime/pdd/live.js
再注册 09/16/21 三个 TimedTask

L3
MFABD2 official APK
→ launch
→ minimal task
→ force-stop
→ observe release
→ observe actual restore path

L4
AidLux read-only preflight
→ only if compatible: install Alas path
→ localhost ADB / screenshot minimum proof

L5
整合：
managed game task
→ PDD preempt
→ PDD result
→ restore observed real game entry
```

## 为什么 PDD live handler 现在故意不存在

`runtime/pdd/live.js` 当前不应该存在。

它最终需要由真实页面证据决定：

- A11y 是否能看到兑换按钮；
- 模块到底怎么上下浮动；
- screenshot 到 detection 的真实延迟；
- Root tap / A11y click 哪条快且稳定；
- OCR 是否真的有必要；
- 成功/已领取/抢光各长什么样。

现在生成它，只会把 LLM 默认审美或猜测写进自动兑换路径。

因此在 live handler 和 prepare_lead 都被真机证据确定之前，不注册生产 TimedTask。

## 当前真正剩余的 offline 工作

只剩不依赖手机、且仍有明确价值的准备：

1. 最终上机前刷新一次 upstream release/revision；
2. README / execution-plan 状态对齐；
3. 做一次 Complexity Gate removal pass；
4. 做 owner handoff。

这些结束后，不再通过“继续准备”制造额外代码。

下一阶段才是 Owner 指定的最后一步：

> K20 Pro Final Live Gate。

## Evidence Class

当前整体项目：

`CODE VERIFIED, LIVE UNVERIFIED`

当前 canonical architecture 已从 Supervisor-first 修正为 event-driven preemption；`runtime/pdd/live.js` 已确认仍不存在，这是有意的 Final Live gate。

更细分：

```text
Upstream source/package facts:
SOURCE/PACKAGE VERIFIED

Prepared helper scripts:
CODE PREPARED / partially syntax-checked

Node-01 runtime behavior:
LIVE UNVERIFIED
```
