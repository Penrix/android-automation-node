---
name: owner-handoff
description: Use at the end of a non-trivial coding task to explain status to Penrix as a non-programmer owner: what changed, what now works, what was actually verified, what remains unverified, what the coding agent should do next, and whether any product decision or risk still needs him.
---

# Owner Handoff

Translate engineering evidence into owner-decision language. Do not remove technical stakes.

The owner should not have to combine a task contract, PR diff, review thread, CI state, and live logs to discover whether the work is actually done.

## Default output

### 结果

In plain Chinese: what changed from the owner's point of view.

### 现在你能做什么

Describe the observable behavior now available.

If the overall work is not yet accepted, say what is implemented rather than implying it is safe to use.

### 我拿什么证明

Use concrete evidence, not confidence:

- tests actually run;
- browser, device, or system flow actually exercised;
- independent review result;
- security scan result when applicable.

State the evidence class:

- LIVE VERIFIED
- CODE VERIFIED, LIVE UNVERIFIED
- NOT VERIFIED / BLOCKED

Preserve important scope such as revision, environment, and evidence date.

### 还没证明什么

Name any meaningful untested environment, path, unresolved review finding, or residual uncertainty.

Do not hide an unresolved review finding merely because implementation was delivered.

### 下一步

If engineering work remains, state the next concrete action and who owns it.

Default owner:

> Coding Agent

Do not turn an engineering blocker into a question for Penrix.

Examples:

- add the missing concurrent regression test;
- reconcile a newer installed source back to GitHub;
- run current-head full tests;
- perform Windows/Chrome/Android live acceptance;
- resolve or explicitly reject an independent review finding.

### 需要你决定吗

Usually: no.

Only put something here when the owner truly must decide a product behavior, irreversible action, external side effect, permission, cost, or risk.

If no decision is needed, say so directly.

## Technical appendix

Add a short technical appendix only when it helps future work:

- files or areas changed;
- key engineering decision;
- PR, commit, or branch;
- review finding ledger summary;
- important deferred finding.

Do not make the owner read code to know whether the task succeeded.
