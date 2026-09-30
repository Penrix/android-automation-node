# Upstream Review Lock

Review snapshot, not a dependency lockfile.

Last reviewed: 2026-09-30.

## Coding-agent sources

| Source | Reviewed state | Decision |
|---|---|---|
| Penrix/ai-coding-cognition | `487efcfb359f2700bd23de06fdd8c3cb141a92d7` | Copied Penrix Core v0.4.0 source with Reality Reconnaissance PRE/POST |
| openai/plugins | `5fd93af4cd0c623e020d0cc7e9ce178b4ac1f70f` | Primary Codex curated source |
| obra/superpowers | v6.4.2, `8ca22dba9a94f28898bbce59f2537ff4d87c747d` | Semantic upstream; newer than curated copy |
| OpenAI curated Superpowers | v6.3.0 | Default Codex source |
| obra/superpowers research tracker | Issue #2129 open; PR #2116 open at `425793e18117e9931a49bbf003545d66080cce02` when reviewed | Upstream pre-design prior-art research is useful but not yet released and does not cover full Penrix PRE/POST/user-field requirement |
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


## Game runtime additions reviewed 2026-09-30

| Source | Reviewed state | Conclusion |
|---|---|---|
| Aliothmoon/MaaFwApp | MFABD2-pinned `f4f6f220e21e3a1b7b0cf5df4bdbe0ec04c668f7`; upstream main also reviewed at `b4d10d572b17c3edab2f2b9f6c9032a856a1a93c` | Pinned version already has Root backend, BACKGROUND virtual display, default BACKGROUND/P720, foreground service and scheduling |
| aidlearning/AidLearning-FrameWork | official release `v0.92` | Official asset `aidlux_0.92.apk` still exists; use this as first K20 Alas runtime candidate rather than an untrusted third-party APK |
| linwei5d/AzurLaneAutoScript-Docker-Arm64 | repo pushed through 2024-05-19 | Historical phone-Docker + host-network + local ADB architecture proof only; do not use stale image as production source |
| LittleMio/AzurLaneAutoScript-docker-arm64 | repo pushed through 2026-06-02 | Current ARM64 Docker packaging evidence; targets generic ARM64 Linux, not automatically Android/AidLux |
