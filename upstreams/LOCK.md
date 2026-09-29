# Upstream Review Lock

Review snapshot, not a dependency lockfile.

Last reviewed: 2026-09-30.

## Coding-agent sources

| Source | Reviewed state | Decision |
|---|---|---|
| Penrix/ai-coding-cognition | `187e7e06011ae4dac7ae5cf23f508d1c0a3763fe` | Copied Penrix Core v0.3.0 source |
| openai/plugins | `5fd93af4cd0c623e020d0cc7e9ce178b4ac1f70f` | Primary Codex curated source |
| obra/superpowers | v6.4.2, `8ca22dba9a94f28898bbce59f2537ff4d87c747d` | Semantic upstream; newer than curated copy |
| OpenAI curated Superpowers | v6.3.0 | Default Codex source |
| CodeRabbit | v1.1.4 | Diff review |
| Codex Security | v0.1.24 | Security review |
| Test Android Apps | v0.1.2 | Emulator evidence; not physical-K20 acceptance |
| multica-ai/andrej-karpathy-skills | `2c606141936f1eeef17fa3043a72095b4765b9c2` | Principles absorbed |
| golbin/agent-skills | `30f04e4e138abf56313ddfef700c0182796ae3ac` | Intent inspiration absorbed |
| breadoncee/dumb-it-down | `941b3a8706eaeba838eb3699defdf916cdf18ac9` | Handoff inspiration absorbed |

## Android automation sources

| Source | Reviewed state | Conclusion |
|---|---|---|
| SuperMonster003/AutoJs6 | `ed3eb10e88db5a8425fd94bdddefa4176e5e1c94` | screenshot/template/shell/RootAutomator paths exist; Node-01 benchmark pending |
| sunyink/MFABD2 | `ee02dfe91cdf489cc2a8d7092e38f1e8c8766dc5` | Android ARM64/root route upstream-supported; Node-01 live pending |
| LmeSzinc/AzurLaneAutoScript | `77f4d01fcd2b0acab05a4d89260e8a0a9cd03d21` | mature bot; phone-local runtime is integration research |
| gkd-kit/gkd | `e732da05811f7cd73276ff0fd10a11873299ca32` | reactive Accessibility engine, not orchestrator |
| openatx/uiautomator2 | `657c5d791075945cc21e78e125b220461c8ae99c` | development/inspection helper |
| AirtestProject/Airtest | `d729c631d2032521be1e2168a249a2a89d79af2a` | visual specialist/fallback |

Freshest is not automatically best. Live evidence must keep its exact upstream revision, environment, behavior, and date scope.
