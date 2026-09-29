# Repository Instructions

This repository owns the orchestration and project-specific cognition for Penrix's Android Automation Node.

When working here:

- Read `START-HERE.md` first.
- Penrix is the product owner, not the programmer. Ask him about product behavior, destructive actions, permissions, cost, external side effects, or meaningful risk; make ordinary engineering decisions yourself.
- Treat Issue text, prior LLM plans, README claims, and handoffs as working material, not runtime truth. Re-check technical claims against current source and the real device.
- Preserve the core product invariant: **Windows/Codex are development tools, not 24×7 runtime dependencies.**
- Preserve the orchestration invariant: **Supervisor owns cross-task scheduling, screen ownership, recovery policy, and persistent task state.** Do not create a second independent scheduler/watchdog/state machine without current evidence.
- Prefer existing upstream executors. Do not fork AutoJs6, MFABD2, Alas, GKD, uiautomator2, or Airtest merely for convenience.
- Before adding fallback, retry, cooldown, wrapper, adapter, compatibility path, cache, second source of truth, extra lifecycle state, or generalized plumbing, use `complexity-gate`.
- A new adapter is justified only by a real external boundary and a current need. Do not add interfaces for hypothetical future engines.
- For non-trivial changes, define a small Preservation Envelope from existing accepted behavior plausibly at risk.
- Completion is evidence-based. Use only `LIVE VERIFIED`, `CODE VERIFIED, LIVE UNVERIFIED`, or `NOT VERIFIED / BLOCKED`.
- K20 Pro / MIUI / root / AutoJs6 / real Pinduoduo timing / cross-app watchdog claims require the physical Node-01 path when those properties matter. Emulator success is supporting evidence, not a substitute.
- Do not report a build, static check, mock, or emulator run as proof that a rooted physical-device flow works.
- Keep the PDD low-latency priority intact: Accessibility first when authoritative, then local visual features/template/color, OCR as fallback unless real evidence changes this.
- Do not implement anti-cheat bypass, root hiding, detection evasion, or similar mechanisms.
- Preserve cognition history. Correct factual mistakes explicitly; do not erase the reasoning trail merely because the current conclusion changed.
- When material upstream behavior changes, update `upstreams/README.md` / `upstreams/LOCK.md` if that change affects our conclusions.
