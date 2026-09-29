# START HERE

This repository is the project-local operating entrypoint for the Android Automation Node.

Do not load every document at once. Route by the current task.

## 0. Always establish the authority model

Start with:

- `plugins/penrix-coding-core/skills/using-penrix-coding-core/SKILL.md`

Core authority:

- Penrix owns desired behavior, scope, irreversible actions, permissions, external side effects, cost, and meaningful risk.
- The coding agent owns ordinary technical decisions.
- Current source + actual runtime behavior are technical authority.
- LLM-written contracts and old handoffs are not Reality.
- Evidence determines completion.

## A. Natural-language feature / bug / goal

Read `intent-contract` and `docs/07-coding-standards.md`, then only the smallest relevant product docs:

- Supervisor/task switching -> `docs/01-architecture.md`
- Node-01 -> `docs/02-k20pro-baseline.md`
- PDD -> `docs/03-pdd-coupon.md`
- Games -> `docs/04-game-automation.md`
- Fork/upstreams -> `docs/05-upstream-strategy.md`
- Tool research -> `docs/06-tooling-research-notes.md`

## B. Existing Issue / plan / task contract / old handoff

Use `contract-reality-check`. Preserve owner-visible goals and explicit boundaries; re-verify technical claims, root cause, head, runtime, upstream assumptions, and acceptance coverage.

## C. Implementation grows extra machinery

Before adding retry, fallback, cooldown, wrapper, adapter, interface, compatibility path, cache, second state owner, lifecycle state, generalized extension point, or fake integration, use `complexity-gate`.

Project rule: Supervisor already owns cross-task orchestration; upstream executors already own game-specific behavior. New layers must prove a distinct concern.

## D. Engineering execution / debugging

Use Superpowers when useful for debugging, TDD, planning, worktrees, verification, and review. Do not copy a second procedure layer here.

## E. Android runtime claim

Use `reality-verification`.

Generic Android behavior may use an emulator. Node-01-specific behavior requires the rooted K20 Pro when it depends on MIUI, root, Accessibility, input latency, screenshot/OCR, app timing, cross-app switching, watchdog recovery, network, or power.

## F. Handoff

Before reporting a non-trivial task as done, use `owner-handoff`.

## Project invariants

1. Node-01 keeps running when Windows/Codex are gone.
2. Supervisor owns task arbitration.
3. Mature upstream executors are reused before reimplemented.
4. Fork only after a real source-level modification need is established.
5. Long-term recoverability matters more than a short demo.
6. Physical-device evidence outranks confidence for physical-device claims.
7. No anti-cheat bypass or detection-evasion machinery.
