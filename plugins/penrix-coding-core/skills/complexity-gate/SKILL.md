---
name: complexity-gate
description: Use while implementing or reviewing a non-trivial coding change when the agent is about to add fallbacks, retries, wrappers, abstractions, configuration, compatibility paths, caches, safety state, mocks, or generalized plumbing. Require current evidence for every added mechanism, prevent duplicate ownership across layers, keep test-only constraints out of production, and remove speculative complexity before handoff.
---

# Complexity Gate

LLM coding agents have a strong bias toward turning uncertainty into code.

They often respond to an unknown by adding a fallback, wrapper, retry, compatibility branch, cache, safety state machine, configuration option, mock, or "future-proof" abstraction. This can look prudent while actually hiding the root cause, duplicating another component's responsibility, or creating code for a scenario that does not exist.

The rule is:

> New complexity has the burden of proof.

"Safer", "more robust", "production-ready", "future-proof", "just in case", and "we may need it later" are not evidence.

This skill complements, rather than replaces, Superpowers engineering discipline and the already-absorbed Karpathy simplicity rules. Its distinct job is to decide whether a proposed mechanism is allowed to enter the codebase at all.

## Trigger

Use this skill before adding, or during review of, any of these:

- fallback or hidden default;
- retry, debounce, rate limit, cooldown, queue, mutex, lease, or extra state machine;
- wrapper, adapter, facade, factory, interface, helper layer, or one-off abstraction;
- new configuration switch or generalized extension point;
- backward-compatibility or legacy path;
- cache, shadow state, duplicate source of truth, or reconciliation layer;
- broad try/catch, catch-and-continue, fake success, or error swallowing;
- test seam, mock, fake server, or integration substitute;
- new security/safety guard around a concern another component may already own;
- speculative handling for a race, edge case, platform, caller, or future feature that has not been observed.

Also run one removal pass after a non-trivial implementation if the diff introduced any of the above.

## The admission test

For every proposed mechanism, answer these questions from current evidence.

### 1. What real thing requires it?

Acceptable evidence:

- an observed runtime failure;
- a reproducible bug;
- an explicit owner requirement;
- an already-accepted invariant in the current product;
- a documented external protocol/runtime contract;
- an existing supported caller, version, data shape, or environment that must remain compatible.

Not enough:

- "could happen";
- "best practice";
- "production systems usually";
- "future flexibility";
- "safer";
- "what if";
- "while we are here".

If no current evidence requires the mechanism, do not add it.

### 2. Who already owns this concern?

Before implementing a retry, submission state, auth check, cache, lifecycle, rate limit, error recovery, or safety guard, inspect adjacent layers.

If another component already owns the concern:

- use its contract;
- propagate its result;
- do not create a second independent state machine around it.

One concern should have one authoritative owner unless current evidence proves composition is required.

### 3. Why is the simpler path insufficient?

Name the smallest simpler implementation.

Then identify the concrete failure it cannot handle.

If the answer is hypothetical rather than observed or contractually required, choose the simpler path.

### 4. Is this production behavior or verification behavior?

Do not promote test discipline into permanent product behavior.

Examples:

- a test-send cooldown belongs in the acceptance harness unless the product itself needs that cooldown;
- diagnostic logging belongs in diagnostics unless the product needs a new runtime logging subsystem;
- a fake server may validate request shape, but it does not prove the real integration.

### 5. Does the mechanism expose failure or hide it?

Unexpected states that violate the current system's assumptions should usually fail loudly enough to diagnose.

A fallback is legitimate only when the fallback itself is an intended and verified product behavior.

Do not turn:

```text
assumption violated
→ visible failure
```

into:

```text
assumption violated
→ invented default
→ green test
→ hidden wrong behavior
```

## High-risk LLM patterns

### Fallback addiction

Red flags:

- hidden defaults for missing required data;
- "legacy fallback" with no known legacy caller;
- multiple alternate implementations "just in case";
- returning mock or placeholder data after a real dependency fails;
- bare catches or catch-and-continue for states that should invalidate the operation.

Prefer fixing the violated assumption or surfacing the failure.

### Wrapper onion

A wrapper is not justified because it has a clean name.

Before adding a helper/facade/factory/interface:

- search existing call sites;
- check whether the existing function can be changed directly;
- check whether the new abstraction has more than one real consumer or policy;
- reject aliases whose main effect is moving one call behind another name.

A single-use abstraction may still be valid when it isolates a real boundary, but the boundary must be real, not imagined.

### Duplicate authority

Common duplicated concerns:

- retry logic in both caller and transport;
- two rate limiters;
- two caches for the same truth;
- two send/submission state machines;
- a local compatibility layer around a dependency that already normalizes compatibility;
- test harness safety logic copied into production.

When duplication appears, identify the authoritative layer and delete the shadow owner.

### Action bias

"No code change" is a valid engineering outcome.

Before patching a reported bug or stale contract:

- establish that the failure still exists on the authoritative source/runtime;
- check whether a newer branch/runtime already fixed it;
- do not manufacture cleanup work merely because a coding task was opened.

### Test self-certification

Tests are evidence only for the behavior they actually discriminate.

When the same agent writes code and tests:

- derive expected behavior from owner intent, protocol, prior failing behavior, or an independent invariant, not from the new implementation;
- when practical, show that the test distinguishes the old/broken baseline from the fix;
- do not weaken or rewrite an expectation merely because the implementation produced something else;
- do not mock the exact integration boundary whose real behavior is the claim when that boundary can be exercised;
- do not treat a fake server that accepts your payload as proof that the real server's deeper runtime path accepts it;
- keep CODE VERIFIED and LIVE VERIFIED separate.

## Removal pass

Before handoff, inspect every new:

- abstraction;
- option;
- branch;
- fallback;
- wrapper;
- compatibility path;
- retry;
- cache/state store;
- safety layer;
- mock/test seam.

For each one ask:

> If I remove this, which observed failure or explicit requirement returns?

If there is no concrete answer, remove it or defer it.

Then ask:

- Can an existing component own this instead?
- Is this test-only behavior leaking into production?
- Is this error handling masking a broken assumption?
- Did I add a mechanism to compensate for another mechanism I also added?
- Did I verify the real runtime contract, or only a schema/type/unit-test surface?

## Interaction with the owner

Do not turn this gate into more questions for Penrix.

The coding agent decides technical simplification itself.

Ask Penrix only when removing or keeping a mechanism changes:

- user-visible behavior;
- data effects;
- permissions;
- external side effects;
- cost;
- irreversible risk.

## Evidence note

When this gate removes or rejects a material mechanism, record the reason briefly in the implementation/review ledger when useful.

Do not produce ceremony for trivial changes.

## Example: duplicate transport safety

Bad:

```text
specialized Web transport already owns
prepared → send activated → accepted → ambiguity/retry semantics

caller adds
another preflight
another send lease
another ambiguity state
another retry interpretation
```

The second layer feels defensive but creates competing truth.

Better:

```text
caller maps the request
→ specialized transport owns browser submission semantics
→ caller consumes the authoritative result
```

If the owner requires a 30-second cadence for manual acceptance testing, keep that cadence in the live-test harness rather than making every production inference wait 30 seconds.
