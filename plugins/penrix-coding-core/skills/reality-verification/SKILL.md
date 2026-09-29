---
name: reality-verification
description: Use before claiming a coding task is fixed, complete, or usable when the claim depends on browser UI, Windows or local integration, Android or device behavior, extensions, external services, or other runtime reality beyond static code checks.
---

# Reality Verification

Code evidence and Reality evidence are different.

## Define the exact claim

State the user-facing behavior being claimed.

Then identify the highest-authority environment that can prove it.

Do not infer execution environment from labels such as:

- workflow or job name;
- target runtime identifier;
- artifact filename;
- package name;
- documentation heading.

Inspect the actual runner and the actual behavior exercised.

A workflow called build-windows that runs on Linux and cross-compiles win-x64 is not Windows runtime acceptance.

## Bind evidence to a scope

For material verification evidence, record:

- code revision or package version;
- actual execution environment;
- exact behavior exercised;
- observation time.

Environment-sensitive products can drift even when source code does not.

Historical live evidence remains evidence for the code/environment combination that was actually observed. Do not silently present it as a fresh current-environment acceptance.

## Exercise the target behavior

Examples:

- browser or UI: render the actual app, perform the interaction, inspect resulting state, relevant console and network evidence, and screenshots when useful;
- Chrome extension: load and use the extension path and exercise the affected behavior;
- Windows integration: run the actual Windows or live path when accessible;
- Android: emulator or device plus ADB, UI, and log evidence;
- external service: perform the authorized real operation or use the closest authoritative sandbox.

For a bugfix, reproduce the original failing path before or otherwise establish it, then exercise that same path after the change.

## Distinguish execution failure from non-execution

Before interpreting a red CI/check:

- confirm a runner actually started;
- confirm relevant steps executed;
- identify which check failed.

A workflow with no runner and no steps is not a code-test failure.

Likewise, a skipped or blocked check is not a passing check.

## Classify status

Return exactly one evidence class:

- LIVE VERIFIED
- CODE VERIFIED, LIVE UNVERIFIED
- NOT VERIFIED / BLOCKED

Add scope qualifiers when material, for example:

- LIVE VERIFIED on Windows 11, commit abc123, 2026-09-19
- historical LIVE evidence; fresh environment not rerun

Never promote a lower class because the code looks right.

## Record

Keep concise evidence:

- revision;
- environment;
- exact flow exercised;
- observation time;
- expected result;
- observed result;
- commands, tools, or checks actually run;
- remaining untested surfaces.

Do not create bulky artifacts unless they help prove the claim.
