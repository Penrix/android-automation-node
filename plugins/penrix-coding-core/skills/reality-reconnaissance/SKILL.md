---
name: reality-reconnaissance
description: Use for every task that writes or reviews production code when current project, platform, dependency, operational, or user-use facts can affect correctness.
---

# Reality Reconnaissance

Repository code and model knowledge are not enough to establish how software works in the current world.

This skill gathers the facts that implementation decisions depend on, then re-checks the finished implementation against those facts before completion.

It complements, rather than replaces:

- `intent-contract`: what the owner wants;
- Superpowers: engineering execution, debugging, TDD, planning and review;
- `complexity-gate`: whether new machinery has evidence to exist;
- `reality-verification`: whether the actual target runtime proves the result.

## Core laws

```text
NO PRODUCTION IMPLEMENTATION FROM MODEL PRIOR ALONE.

NO FINAL SELF-REVIEW AGAINST THE REPOSITORY ALONE
WHEN THE CODE DEPENDS ON EXTERNAL REALITY.
```

A task that changes production code gets two reconnaissance passes:

1. **PRE** — before the first production-code edit;
2. **POST** — after the implementation/diff exists, before final verification and completion claims.

The depth is proportional to the task. The gate itself is not optional.

## What counts as Reality

Use the smallest relevant set of lanes.

### 1. Current project reality

Inspect the actual project before reasoning from generic patterns:

- current branch/head and authoritative source baseline;
- code that currently owns the behavior;
- tests and fixtures that encode accepted behavior;
- recent commits, worklogs, Issues or review findings that materially affect the path;
- current dependency/configuration versions.

Old handoffs and task contracts are leads, not current truth.

### 2. Official/current external reality

When external technology matters, inspect current authoritative material such as:

- official documentation and reference;
- release notes / changelog / migration notes;
- protocol or platform specifications;
- package/release metadata;
- current upstream source and tests when documentation is too shallow.

Record exact versions when behavior can differ by version.

### 3. Upstream implementation reality

Do not stop at the README when the implementation detail matters.

Inspect the relevant upstream:

- source files that implement the behavior;
- tests that show expected input/output;
- open and recently closed Issues/PRs for current breakage or changed behavior;
- release commits when a fix or regression is version-specific.

### 4. User field reality

For a non-trivial integration with an external tool, app, platform, device, service, or deployment workflow, actively look for real user reports.

Useful sources include:

- upstream GitHub Issues/Discussions;
- vendor/community forums;
- Reddit or other technical communities;
- detailed setup reports, bug reports and postmortems;
- maintained examples from people actually running the stack.

User reports are **sensors, not authority**. A single report does not prove a universal fact. Use reports to discover operational constraints, failure modes and workarounds, then corroborate with source/docs or reproduce when practical.

If credible field evidence cannot be found, record that gap instead of inventing consensus.

### 5. Target-environment reality

Recover what is already known about the environment that will actually run the software:

- OS / device / architecture;
- installed runtime and dependency versions;
- permissions and account state;
- network/proxy topology;
- deployment/install path;
- data that must be preserved;
- hardware/OEM/browser/WebView quirks when relevant.

Do not replace a known target environment with a convenient generic one.

## PRE pass — before code

### Step 1: Name the external assumptions

From the intended change, identify what could be wrong if the model reasons only from memory.

Typical assumption classes:

- API/library exists and still has the expected shape;
- dependency version supports the chosen call;
- target OS/device permits the operation;
- install/bootstrap path actually works;
- a permission, account, browser state or service is available;
- an upstream tool owns a behavior we are about to duplicate;
- users can actually operate the proposed workflow;
- the target site/service still behaves like an old sample.

### Step 2: Search with exact anchors

Prefer exact names over broad generic searches.

Examples:

```text
<tool/library> <exact version> <API/symbol> official docs
site:github.com/<owner>/<repo> <symbol or error>
"<exact error message>" <platform/version>
<tool> <device/OS> install setup issue
site:reddit.com <tool> <feature> <version>
```

For source code, search the owning repository directly when possible.

For changing products, include the current version/date in the search.

### Step 3: Answer the landing questions

For every material external boundary, be able to answer the relevant questions:

- What exact version/platform combination are we targeting?
- How is it actually installed, enabled or launched?
- Which permissions, accounts, services, files or environment variables are required?
- Which process/component truly owns the behavior?
- What exact API/CLI/configuration/path is current?
- What version-specific failures are known?
- What do real users report as the successful path or common failure path?
- What recovery/rollback path exists if the integration fails?
- What exact observation in the target environment would prove it works?

This is the point of the research. A collection of links without these answers is not reconnaissance.

### Step 4: Produce a compact Reality Brief

Do not create bureaucracy for its own sake. Keep the result in the current task/plan/worklog unless a long-lived artifact is justified.

Minimum shape:

```text
Current facts:
- ...

Field reports / operational evidence:
- ...

Implementation consequences:
- ...

Still uncertain:
- ...

Acceptance path:
- ...
```

Every important implementation decision that depends on an external fact should trace to the brief.

### PRE stop condition

Production editing may start when:

- the authoritative local owner is known;
- material external assumptions have current evidence;
- user-field reality was checked when the task has a non-trivial external/operational boundary;
- remaining uncertainty is explicit and has a probe/verification route.

If a critical assumption is still a guess, investigate or run a spike instead of coding around the guess.

## POST pass — before final self-review

The post pass is not "re-read the PRE notes."

The final implementation may have introduced concrete APIs, flags, versions, state ownership, retries, fallbacks, permissions or operational assumptions that did not exist in the initial design.

### Step 1: Inventory what the diff now assumes

Read the actual diff and list material claims such as:

- this API exists and behaves this way;
- this version supports the chosen option;
- this path/file/location is correct;
- this component owns retry/cache/lifecycle/state;
- this failure mode is recoverable;
- this install/run sequence is sufficient;
- this fallback matches an intended real behavior.

### Step 2: Re-query the final mechanism

Re-check current docs/source/issues/user reports using the **actual names and versions now present in the diff**.

Search specifically for:

- deprecation or version mismatch;
- platform-specific restrictions;
- recent regressions;
- known installation/permission failures;
- competing ownership in an upstream component;
- user reports contradicting the happy-path assumption.

A PRE search for one library does not certify a different API or mechanism chosen during implementation.

### Step 3: Run a Reality Audit

Classify each material implementation assumption:

- `MATCH` — supported by current evidence;
- `MISMATCH` — current evidence contradicts the implementation;
- `UNVERIFIED` — evidence is missing or contradictory.

For `MISMATCH`, fix the code/design before claiming completion unless the owner explicitly chooses the changed product behavior.

For material `UNVERIFIED`, lower the completion claim and make the missing target verification explicit.

### Step 4: Hand off to runtime verification

Research is not execution proof.

After the Reality Audit:

- use `complexity-gate` if the final diff accumulated extra mechanisms;
- use Superpowers review as appropriate;
- use `reality-verification` for the real browser/Windows/Android/service/device path;
- only then use `owner-handoff`.

## Special cases

### Purely internal / mechanical changes

The reconnaissance gate still runs, but may stay project-local when the change introduces no external/runtime assumption.

Examples:

- rename a private symbol with complete local references;
- fix a typo in internal documentation;
- deterministic refactor with unchanged external contracts.

Do not manufacture web research to satisfy ceremony.

### Bug fixes

Use systematic debugging for root cause.

Reality reconnaissance adds the external/current layer when the bug may depend on:

- changed upstream behavior;
- platform versions;
- real user setup;
- service/site drift;
- installation/runtime environment.

Do not substitute internet speculation for reproduction.

### Security or destructive operations

Use official/current sources first, then field reports as supplemental evidence.

Do not execute destructive, externally visible, permission-changing or security-sensitive actions merely because a community post says they work.

## Anti-patterns

### README-only research

A README is orientation. It is often not enough to prove a precise implementation detail.

Inspect source/tests/current release material when the detail carries code risk.

### Search-as-decoration

Bad:

```text
searched five links
→ no extracted constraints
→ code from prior anyway
```

Good:

```text
source says API removed in v4
user reports v4 migration requires new permission
target runs v4
→ old implementation path is eliminated
```

### Popularity-as-proof

Stars, download counts and repeated blog posts do not prove API behavior.

### Community-dismissal

Official docs may omit device quirks, deployment failures and real operational pain. Do not ignore user reports just because they are not normative documentation.

### Post-hoc citation

Do not write the implementation from memory and then search for sources that agree with it.

PRE research constrains the design. POST research tries to falsify the finished implementation.

## Completion question

Before the implementation is called ready for runtime acceptance, ask:

> If a competent user tried to install, configure and run this exact mechanism today in the target environment, what current evidence says the path is real, and what current evidence says where it can fail?
