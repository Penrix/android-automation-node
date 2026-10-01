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


## Azur Lane Android alternatives reviewed 2026-09-30

| Source | Reviewed state | Conclusion |
|---|---|---|
| wess09/AzurPilot | master `4a885426772047dfac83474209dbd6fb16bb8fc4`, dev also active | Modern Alas descendant: Python 3.14/uv/RapidOCR/NCNN, active Android adapter work. Main repo alone is not the preferred K20 package because the Android host is split out. |
| wess09/AzurPilot-for-Android | main `6c89ee73fc5e704ff2940db9f8720c4874166fba`; locks AzurPilot `4ac2ae452ded4badc75b87ae68868aa8a819b689` | **Second live-probe candidate.** Android 9+/ARM64/Root are a strong Node-01 match, but the locked runtime still contains the real-device `mCurrentFocus` foreground-detection defect reported in AzurPilot #1089; Redmi K50 touch/swipe failure is also open. |
| AzurPilot-for-Android rolling Latest | published ARM64 full APK through `1.2.11` when reviewed | First-install artifact: `AzurPilot-Android-1.2.11-arm64-v8a-full.apk`, SHA-256 `900a2b6e3ce7709bca43383cca72f4c4cd227d9fc4263ba61fc5a00876432872`. Node-01 live acceptance pending. |
| Shinarin/ALAS-AOS | head `9be72778433608d4fd6039ba37e71cc71efecf16`; release v0.1.6 | **First live-probe candidate, not LIVE VERIFIED.** Android 9+/ARM64 APK + 1280x720 virtual display; requires Shizuku, but its foreground check already falls back to `pidof`, and the project has real phone-rendering/template calibration evidence. MIUI/K20 long-run evidence is still missing. |
| helenananaa/AzurLaneAutoScript-Headless | active 2026 research project | Research/watchlist only. Root ARM64 physical-phone graphics work exists, but full game + ALAS + long-running phone acceptance is not mature enough for primary Node-01 runtime. |
| LittleMio/AzurLaneAutoScript-docker-arm64 | current ARM64 Docker packaging | Useful mxnet/Python ARM64 recipe, but heavier than a native Android host and not first choice on K20. |
| W1NDes/M-AzurLaneAutoScript | gameplay-modified ALAS fork | Does not materially improve Android/ARM64 deployment; old dependency stack remains. |

Reality-audit notes at review time:

- no K20 / Android 9 full-chain user report found yet;
- successful reports include newer Redmi/iQOO devices and a Redmi Note 10 Pro on MIUI 12.5;
- real Android virtual-display bugs have already been reported (foreground detection / some touch & swipe cases);
- therefore Android 9 support is source/package support, not Node-01 live proof.
- AzurPilot #1089 being closed is not fix evidence: it was closed because Android-backend bugs belong in the Android repo; the locked `4ac2ae...` code was re-read and still uses the reported failing `mCurrentFocus` logic.
- ALAS-AOS uses the same focus signal first but has a `pidof` fallback, so the specific #1089 failure is not structurally identical there.

## Node-01 artifact readback 2026-10-01

The verified `AzurPilot-Android-1.2.11-arm64-v8a-full.apk` (same SHA-256 above) contains `assets/rootfs/BUILD_MANIFEST` with Android host `6f5eacb8d323bb1200969ad688a1a15d8e0889a5`, bundled AzurPilot `e96cf5fd8a25a08aab2fb6462d7abe6c7052ca7d`, rootfs `e96cf5fd8a25-26a9df495f`, ARM64 and Python 3.14.6. These are the installed artifact's runtime identifiers; the earlier `4ac2ae...` source review must not be described as its bundled commit. Reading `module/device/method/azurpilot_android.py` at the actual bundled commit confirms ping-based displayId discovery but still no pidof fallback in app-current.

Official rolling release also lists 1.2.42. Host changes after the reviewed head concern update delivery, UI and build dependencies, with no observed VirtualDisplay/Root implementation fix in that comparison; Node-01 acceptance retained the reviewed 1.2.11 artifact. Installation succeeded using root local `pm install -r` after MIUI rejected streamed ADB installation. Runtime acceptance is recorded in docs/04-game-automation.md and Issue #2.
