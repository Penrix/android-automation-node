# Final-Live Install Manifest

Prepared: 2026-09-30.

This is a preparation snapshot. Re-check upstream immediately before final live installation if significant time has passed.

## AutoJs6

Release: v6.7.0

Preferred Node-01 asset:

`autojs6-v6.7.0-arm64-v8a-62db1ff8.apk`

SHA-256:

`a4fa5c941aecc4dbb770316e35ac98ae5b0efef5041ac0533dfa826b94595525`

Source reviewed:

`ed3eb10e88db5a8425fd94bdddefa4176e5e1c94`

Why ARM64-specific instead of universal:

- Node-01 is ARM64;
- smaller artifact;
- no need to carry unrelated ABIs.

Do not claim compatibility until installed and exercised on Node-01.

## MFABD2

Release: v4.5.0

Asset:

`MFABD2-v4.5.0-android-arm64.apk`

SHA-256:

`8ed46afa556aaa3721b94c73ee1901c0d42b2552dbc57c78dcccbfe712e89787`

Release target commit:

`f3153f9030b12a253f10a5dd7f547eebb1632f99`

Source review continued at newer main:

`ee02dfe91cdf489cc2a8d7092e38f1e8c8766dc5`

Package:

`io.github.sunyink.mfabd2`

Brown Dust 2 package in upstream Android pipeline:

`com.neowizgames.game.browndust2`

Requirements stated by upstream:

- Android 9+
- ARM64
- root or Shizuku
- Simplified Chinese game UI

Do not fork before official APK live acceptance.

## AzurLaneAutoScript

Source baseline:

`77f4d01fcd2b0acab05a4d89260e8a0a9cd03d21`

No project-local APK is assumed.

Relevant source-proven paths:

- `deploy/AidLux/0.92/requirements.txt`
- `deploy/AidLux/0.92/pre-installed.txt`
- `dev_tools/arm64/Dockerfile`
- `requirements-in.txt`

Important ARM64 facts already visible in source:

- ARM64 Docker uses Python 3.7.10;
- installs Linux `adb`, OpenCV/native build libraries;
- replaces mxnet with a dedicated ARM64 wheel;
- AidLux 0.92 has its own reduced/adjusted requirements.

Runtime choice remains unresolved until dependency audit is complete.
