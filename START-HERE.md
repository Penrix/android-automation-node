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

## Mandatory coding gate — Reality Reconnaissance

For every production-code task, use `plugins/penrix-coding-core/skills/reality-reconnaissance/SKILL.md` twice:

1. **PRE before the first production edit** — establish current repo/source ownership and, when external/platform/device facts matter, current official/upstream source plus real user operational reports. Recover the concrete install/config/permission/run path and the target acceptance observation.
2. **POST against the actual final diff** — re-query the exact APIs, versions, permissions, ownership and operational assumptions the implementation ended up using. Classify material assumptions as `MATCH`, `MISMATCH`, or `UNVERIFIED`.

For Node-01 work, user field reports are especially relevant to MIUI/root/Accessibility/screenshot/OCR/app-timing behavior, but they are sensors rather than automatic truth; corroborate with upstream evidence or real-device reproduction when practical.

Research constrains implementation. It does not replace K20 physical-device verification.

## A. Natural-language feature / bug / goal

Read `intent-contract` and `docs/07-coding-standards.md`, then only the smallest relevant product docs:

- Cross-app preemption / current architecture -> `docs/01-architecture.md`
- Node-01 -> `docs/02-k20pro-baseline.md`
- PDD -> `docs/03-pdd-coupon.md`
- Games / MFABD2 / Alas -> `docs/04-game-automation.md`
- Fork/upstreams -> `docs/05-upstream-strategy.md`
- Current execution order -> `docs/08-execution-plan.md`
- Real-world deployment notes -> `docs/16-community-reality-playbook.md`

Do not load `docs/09-15` by default. They are preparation/review artifacts from earlier passes and may contain superseded intermediate wording.

## B. Existing Issue / plan / task contract / old handoff

Use `contract-reality-check`. Preserve owner-visible goals and explicit boundaries; re-verify technical claims, root cause, head, runtime, upstream assumptions, and acceptance coverage.

## C. Implementation grows extra machinery

Before adding retry, fallback, cooldown, wrapper, adapter, interface, compatibility path, cache, second state owner, lifecycle state, generalized extension point, or fake integration, use `complexity-gate`.

Project rule: upstream executors own their own game scheduling/lifecycle. This project currently owns only the PDD time trigger and the temporary cross-app preemption needed around it. New layers must prove a distinct concern.

## D. Engineering execution / debugging

Use Superpowers when useful for debugging, TDD, planning, worktrees, verification, and review. Do not copy a second procedure layer here.

## E. Android runtime claim

Use `reality-verification`.

Generic Android behavior may use an emulator. Node-01-specific behavior requires the rooted K20 Pro when it depends on MIUI, root, Accessibility, input latency, screenshot/OCR, app timing, cross-app switching, network, or long-running behavior. Manual power-on is an accepted boundary; power-loss auto-boot is out of scope.

## F. Handoff

Before reporting a non-trivial task as done, use `owner-handoff`.

## Project invariants

1. Node-01 keeps running when Windows/Codex are gone.
2. Manual power-on is accepted; unattended cold boot is out of scope.
3. AutoJs6 owns PDD timing; MFABD2/Alas own their own internal game schedules.
4. This project only adds the minimum cross-app preemption required by PDD.
5. Mature upstream executors are reused before reimplemented.
6. Fork only after a real source-level modification need is established.
7. Physical-device evidence outranks confidence for physical-device claims.
8. No anti-cheat bypass or detection-evasion machinery.
