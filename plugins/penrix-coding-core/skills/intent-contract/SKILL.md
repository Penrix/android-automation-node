---
name: intent-contract
description: Use when Penrix describes a coding goal, bug, feature, or desired behavior in natural language and the agent must turn it into an executable, verifiable engineering target without outsourcing technical decisions back to the user or building against a stale source baseline.
---

# Intent Contract

The owner supplies product intent, not implementation design.

## Recover the real target

Inspect the current repository and project state before inventing a design.

Establish:

- current observed behavior;
- desired observable behavior;
- explicit constraints from the owner;
- what would count as success in Reality;
- any genuinely missing product decision.

Do not ask the owner to choose ordinary implementation mechanisms.

## Establish source-baseline authority

Before treating the checked-out repository as the implementation baseline, check whether available evidence says a newer deployed, local, packaged, installed, or branch version exists.

Relevant evidence may include:

- repository CURRENT/status documents;
- release or package versions;
- installed extension/app manifests;
- active PR branches;
- local-machine evidence already recorded in the project;
- previously captured artifacts or backups.

If a known runtime/deployed version is newer than the available repository source:

1. do not silently develop new features on the older source;
2. preserve the newer runtime and user data;
3. recover or reconcile the newer source when possible;
4. use older source as historical evidence or a recovery donor until the split is resolved;
5. do not reimplement a capability solely because the stale repository lacks it.

If exact recovery is impossible, state the source gap and choose the least destructive recovery strategy yourself. Ask the owner only when the remaining choice changes product behavior, destroys data, creates irreversible divergence, or carries meaningful external risk.

## Define the preservation envelope

For a non-trivial change, identify any existing behavior that is both already accepted/relied upon and plausibly endangered by this change.

Keep this list small and concrete.

Examples:

- preserve the compact selection UI while changing translation routing;
- preserve the Send uncertainty boundary while changing rate-limit detection;
- preserve production provider code when the task is acceptance-layer-only.

Derive these protections from current repository evidence and explicit owner constraints. Do not ask Penrix to enumerate code-level regression surfaces.

Verification must cover the intended behavior delta and the relevant preservation envelope.

## Separate product unknowns from engineering unknowns

Engineering unknowns are yours to investigate.

Examples:

- which file owns the behavior;
- which concurrency primitive to use;
- which existing abstraction to extend;
- which test layer best reproduces the bug;
- how to reconcile a newer installed build with an older repository.

Product unknowns may require the owner only when alternatives create meaningfully different visible behavior, data effects, cost, permissions, or irreversible consequences.

## Compact execution contract

For a non-trivial task, keep only:

- Goal — one sentence in user-visible terms.
- Current reality — what the project actually does now, with evidence.
- Source baseline — which code/runtime is authoritative for the next change and whether a source/runtime split exists.
- Preservation envelope — existing behavior that must remain unchanged and is plausibly at risk.
- Success evidence — what observation will prove both the desired delta and relevant preservation constraints.
- Constraints — explicit owner boundaries and relevant project constraints.
- Engineering plan — shortest viable technical route.
- Open product decisions — only if truly needed.

Do not inflate this into a document when a few lines are enough.

## Continue

If the owner already asked for implementation, the contract is not a stopping point. Proceed into the appropriate engineering workflow unless a real approval boundary exists.

A missing or stale source baseline is an engineering blocker to resolve, not an excuse to ask the owner to design the implementation.
