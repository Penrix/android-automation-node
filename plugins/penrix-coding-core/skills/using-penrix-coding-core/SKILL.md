---
name: using-penrix-coding-core
description: Use at the start of coding work for Penrix when this plugin is installed. Establish the non-programmer-owner authority model, route to the relevant Penrix Core skill, and coordinate other coding skills such as Superpowers without pushing technical decisions back to the user.
---

# Using Penrix Coding Core

This skill establishes authority and routing. It does not replace specialist engineering skills.

## Authority

Penrix is the product owner, not the programmer.

The owner decides:

- desired observable behavior;
- product scope and priorities;
- destructive or irreversible actions;
- permissions, cost, external side effects, and meaningful risk tradeoffs.

The coding agent decides ordinary engineering questions after inspecting evidence.

Do not ask Penrix to choose implementation mechanisms merely because multiple technical options exist.

## Route

- Natural-language feature or bug request -> use intent-contract.
- Existing Issue, plan, spec, or LLM-generated task contract -> use contract-reality-check before trusting technical claims.
- Any task that will write production code -> run reality-reconnaissance PRE before the first production edit; use only the evidence lanes material to the task.
- Engineering implementation or debugging -> use the best specialist workflow available, including Superpowers when applicable.
- Before adding fallback/retry/debounce/wrapper/abstraction/configuration/compatibility/cache/duplicate safety state/mock-heavy plumbing, or when a non-trivial diff starts accumulating such mechanisms -> use complexity-gate.
- After a production-code implementation exists and before final self-review/completion -> run reality-reconnaissance POST against the actual diff.
- Completion or fix claim that depends on runtime behavior -> use reality-verification.
- End of non-trivial work -> use owner-handoff.

## Reality reconnaissance is not an approval gate

The coding agent performs ordinary research independently.

Do not ask Penrix whether to look up documentation, inspect upstream source, search Issues, or read real user reports when those facts are needed to implement correctly.

Ask Penrix only when missing information is genuinely owner-only, or when the choice changes product behavior, data effects, permissions, external side effects, cost, or irreversible risk.

## Coordination with Superpowers

Penrix Core owns owner/agent authority, product-vs-technical decision boundaries, external/current Reality grounding, evidence-class language, and final owner handoff.

Superpowers owns engineering procedure such as debugging, TDD, planning, worktrees, implementation execution, and code review.

When both apply:

1. Preserve Superpowers' evidence discipline, root-cause debugging, tests, and fresh verification.
2. Use reality-reconnaissance to establish current external/operational facts that repository-only workflows do not prove.
3. Do not turn a Superpowers technical approval or implementation-choice gate into a question for Penrix when the alternatives do not materially change product behavior, scope, data, permissions, cost, or irreversible risk.
4. For purely technical ambiguity, investigate and choose the smallest evidence-backed option yourself.
5. Ask Penrix when the choice changes what the product does, what data it touches, what external action occurs, or what risk he accepts.
6. If a specialist skill conflicts with an explicit current user instruction, the user instruction wins.

## Completion

No specialist workflow may promote CODE VERIFIED evidence to LIVE VERIFIED without target-environment proof.

Research evidence can constrain and falsify implementation assumptions, but it does not by itself prove the runtime path works.
