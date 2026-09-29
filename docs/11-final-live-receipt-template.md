# 11｜Final Live Acceptance Receipt Template

> 这份模板现在只用于准备。没有真实运行的项禁止填写 PASS。

## Evidence Identity

```text
Date:
Repository head:
AutoJs6 version:
MFABD2 version:
Alas revision:
Device:
Android:
MIUI:
Root:
Network:
```

## L0｜Node-01 Baseline

```text
[ ] AutoJs6 launches
[ ] collect-baseline.js completes
[ ] Android/API matches expected
[ ] root shell returns uid=0
[ ] Accessibility service available
[ ] screenshot permission/capture works
[ ] foreground package/activity readable
```

Artifacts:

```text
evidence/node01-baseline.json
evidence/screen.png
evidence/screen.json
```

Status:

`NOT VERIFIED / BLOCKED` until actually run.

---

## L1｜PDD Read-only Evidence

```text
[ ] target PDD membership page opened manually
[ ] pdd-snapshot.js completes
[ ] accessibility tree captured
[ ] screenshot captured
[ ] target coupon/card/button visible in evidence if currently available
[ ] module vertical position recorded
```

Artifacts:

```text
evidence/pdd/accessibility-tree.json
evidence/pdd/screen.png
evidence/pdd/screen.json
```

Decision after evidence:

```text
Primary detector:
Reason:
OCR needed?:
```

Do not choose the primary detector before this evidence.

---

## L2｜PDD Timing

For each tested path record actual observations.

| Path | Command start | Observable UI change | Latency | Result |
|---|---:|---:|---:|---|
| Accessibility click | | | | |
| RootAutomator | | | | |
| shell input tap | | | | |
| screenshot | | | | |
| template match | | | | |
| OCR, if needed | | | | |

Refresh timeline:

```text
pull start:
release:
new content first visible:
target first detectable:
redeem tap:
result confirmed:
```

---

## L3｜Supervisor + PDD

Preservation Envelope:

- previous managed task yields the screen;
- PDD owns screen during claim;
- success is persisted;
- successful morning claim suppresses later windows;
- previous task resumes after PDD success or bounded failure;
- Windows/Codex can be disconnected.

Receipt:

```text
previous task:
preemption time:
PDD result:
claimed_today persisted:
resume result:
unexpected behavior:
```

---

## L4｜MFABD2

```text
[ ] official release APK installs
[ ] root/Shizuku authorization works
[ ] app recognizes Android-native controller
[ ] game starts/connects
[ ] one minimal safe task runs
[ ] stopping MFABD2 releases UI control
[ ] restarting/resuming behavior observed
```

Only after this observation decide whether an integration shim is required.

---

## L5｜Alas On-device Proof

First candidate: AidLux 0.9.2 route.

```text
[ ] AidLux starts repeatedly
[ ] Python available
[ ] adb available
[ ] Alas dependencies install/load
[ ] Alas process starts
[ ] local ADB sees same physical phone
[ ] one screenshot obtained through Alas
[ ] game page recognized
```

Do not proceed to long-running automation if the minimum proof is unstable.

---

## Final Classification

Choose exactly one:

```text
LIVE VERIFIED
CODE VERIFIED, LIVE UNVERIFIED
NOT VERIFIED / BLOCKED
```

Scope:

```text
revision/package × actual device/environment × behavior × observation time
```

Never upgrade status from confidence alone.
