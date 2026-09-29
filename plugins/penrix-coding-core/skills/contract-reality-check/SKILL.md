---
name: contract-reality-check
description: Use when the task arrives as an Issue, spec, plan, acceptance contract, status document, handoff, or technical instructions produced partly or wholly by another LLM. Verify technical claims, scope, and freshness against the current repository and runtime before implementation while preserving the owner's actual goal and explicit boundaries.
---

# Contract Reality Check

A task contract or status document is evidence of prior reasoning, not proof of current technical reality.

## Split the material

Classify important statements as either owner authority or technical claims.

### Owner authority

Preserve unless the owner changes them:

- desired user-visible behavior;
- explicit scope;
- actions that must not happen;
- irreversible or security boundaries;
- named delivery requirements.

### Technical claims

Re-verify:

- file and function names;
- current branch and head;
- claimed root cause;
- current runtime behavior;
- referenced upstream behavior;
- test and acceptance coverage;
- assumptions about timing, APIs, environment, browser state, or dependencies.

## Reconcile status and handoff documents

Files named CURRENT, STATUS, HANDOFF, START-HERE, acceptance notes, Issue comments, and prior LLM summaries may describe different branches, machines, dates, or implementation generations.

Do not choose one merely because its filename sounds authoritative.

For each material status claim, establish:

1. which branch, commit, machine, or runtime it describes;
2. when that claim was last updated;
3. whether newer code, PR state, CI evidence, or runtime evidence supersedes it;
4. whether the document is canonical, historical, or scoped to a prior work unit.

When two status documents disagree, prefer current direct evidence and explicitly scoped newer authority. Preserve the older document as history rather than silently merging incompatible states.

## Reconcile attached review

If the contract, plan, Issue, or prior work already has an independent technical review, read it before modifying code.

Create a compact finding ledger. Every material finding must be accepted, rejected with evidence, deferred with consequence, or left explicitly unresolved.

Do not silently drop a review finding merely because it was not copied into the final task-contract wording.

## Preflight

Before modifying code:

1. confirm the referenced code and state exist;
2. reproduce or otherwise establish the current behavior when practical;
3. check whether the proposed acceptance really exercises the original failure;
4. identify contract statements that are stale, ambiguous, differently scoped, or contradicted by Reality;
5. distinguish a check that did not execute from a check that executed and failed.

## Conflict rule

If technical contract text conflicts with current evidence:

- preserve the owner's product goal and explicit safety boundaries;
- correct the technical route;
- record the correction concisely;
- do not faithfully implement a stale technical assertion.

If the conflict changes the product outcome rather than only the implementation, surface it to the owner.

## Continue

After the preflight, execute the task. Do not turn this skill into a second planning bureaucracy.
