> **REFERENCE ONLY — not default authority.** Current behavior is governed by `START-HERE.md`, `docs/01-architecture.md`, `docs/08-execution-plan.md`, and live evidence. This file preserves preparation/research details and may contain superseded intermediate wording.

# 09｜准备阶段自检与最终上机 Gate

## 结论

上一版执行顺序有一处需要纠正：

> 把“Node-01 真机基线”安排成第一步，和 Owner 当前明确要求的“先做好准备，上机测试最后一步”冲突。

按照 Penrix Core：

- Owner 的当前明确执行边界优先；
- 计划中的技术顺序不是不可修改的 Authority；
- LIVE VERIFIED 只能在最终真机阶段声明；
- 这不妨碍此前先取得 CODE / SOURCE / PACKAGE 级证据。

因此当前改为：

```text
源码与上游审计
→ 最小代码/脚本准备
→ 安装包与校验信息准备
→ 最终验收脚本准备
→ 静态/代码级自检
→ 最后一次集中上机
```

---

## 自检 finding ledger

### F-01｜真机放得过早

状态：ACCEPTED

旧计划：
```text
A0 真机基线
→ A1 Supervisor
```

修正：
```text
先完成所有不依赖真机的准备
→ 最后进入 LIVE GATE
```

原因：Owner 明确要求上机测试最后一步。

---

### F-02｜Adapter 接口定义过早

状态：ACCEPTED

旧文档提前写死：
```text
start / pause / resume / stop / health / recover
```

这属于 Complexity Gate 高风险区：在没看清 MFABD2 / Alas 实际可控边界前，先造接口。

修正：

> 先检查上游已有控制面；最终只为真实缺口写最薄 integration shim。

不会为了统一外观提前制造一套抽象。

---

### F-03｜Watchdog / Recovery 过早具体化

状态：ACCEPTED

“进程死、Activity 不对、画面冻结、网络异常……”这些是合理风险，但现在并非全部已观察到。

修正：

- 首期只保留 Owner 明确要求的“高优先级任务抢占后恢复原任务”；
- 真实上机后出现什么故障，再补对应 recovery；
- 不先实现多层自动重启系统。

---

### F-04｜Supervisor 核心仍然成立

状态：ACCEPTED / PRESERVED

Owner 已明确要求：

```text
抢券前停止游戏挂机
→ 抢券
→ 抢完继续挂机
```

因此“单一跨任务调度 owner”不是过度设计，而是产品目标直接要求。

但首版只需：

- 识别 PDD 时间窗；
- 记住当天是否已成功；
- 记住抢占前是谁在运行；
- 请求/执行停止；
- 跑 PDD；
- 恢复上一任务。

其他机制等证据。

---

## 当前 Source / Package Evidence

### AutoJs6

审查基线：

`SuperMonster003/AutoJs6@ed3eb10e88db5a8425fd94bdddefa4176e5e1c94`

当前正式 Release：

- v6.7.0
- ARM64 APK: `autojs6-v6.7.0-arm64-v8a-62db1ff8.apk`
- SHA-256: `a4fa5c941aecc4dbb770316e35ac98ae5b0efef5041ac0533dfa826b94595525`

源码已确认现成能力：

- `storages.create`
- `setInterval / setTimeout`
- `engines.execScriptFile`
- `execution.getEngine().forceStop()`
- `app.launchPackage`
- Root shell
- `RootAutomator`
- `images.requestScreenCapture`
- `images.captureScreen`
- `images.matchTemplate`
- `device.*`
- `currentPackage / currentActivity`

所以首期不新增自制 runtime、scheduler engine、storage framework。

---

### MFABD2

审查基线：

`sunyink/MFABD2@ee02dfe91cdf489cc2a8d7092e38f1e8c8766dc5`

当前正式 Release：

- v4.5.0
- Android ARM64 APK: `MFABD2-v4.5.0-android-arm64.apk`
- SHA-256: `8ed46afa556aaa3721b94c73ee1901c0d42b2552dbc57c78dcccbfe712e89787`

源码已确认：

- Android 9+ ARM64；
- Root 或 Shizuku；
- 正式 package: `io.github.sunyink.mfabd2`；
- 游戏 package: `com.neowizgames.game.browndust2`；
- Android Native controller 已经替代部分 ADB shell 探针；
- 上游仍明确把完整任务、截图点击准确性、升级等列为真机待验收。

因此准备阶段：

> 不 fork，不写假 Adapter；先把最终安装/验收路径准备好。

---

### Alas

审查基线：

`LmeSzinc/AzurLaneAutoScript@77f4d01fcd2b0acab05a4d89260e8a0a9cd03d21`

源码已确认：

- 主 requirements 仍以 Python 3.7 时代依赖为核心；
- `adbutils==0.11.0`
- `uiautomator2==2.16.17`
- `cnocr==1.2.2`
- `mxnet==1.6.0`
- `opencv-python`
- `av==10.0.0`
- WebUI / uvicorn / pyzmq 等；
- 仓库仍保留 `deploy/AidLux/0.92/requirements.txt`；
- ARM64 Docker 文件使用 Python 3.7.10，并针对 ARM64 替换 mxnet wheel。

这说明“Android 本机 Alas”不是纯猜想；但当前 K20 的最优 runtime 仍未证明。

准备阶段继续做依赖/运行环境审计；不先写安装器把某条路线锁死。

---

## 最终上机前必须准备齐的东西

```text
[ ] upstream revision / release / sha256 清单
[ ] AutoJs6 ARM64 安装包信息
[ ] MFABD2 Android ARM64 安装包信息
[ ] Node-01 baseline collector
[ ] screenshot / UI / runtime evidence collector
[ ] PDD 页面采样步骤
[ ] 点击延迟 benchmark 方案
[ ] Supervisor 最小实现及代码级检查
[ ] MFABD2 最小验收步骤
[ ] Alas runtime 候选与 blocker 清单
[ ] 一次性 live acceptance receipt 模板
```

最后才上机。

---

## Evidence 语言

在上机前：

- AutoJs6 能力：SOURCE VERIFIED
- 安装包/哈希：PACKAGE VERIFIED
- 我们写的逻辑：最高只能 CODE VERIFIED
- K20 实际可运行性：LIVE UNVERIFIED

直到最后真实 K20 验收才允许升级为 LIVE VERIFIED。


---

## 2026-09-30 Preparation Update

新增准备材料：

- `tools/node01/pdd-snapshot.js`：只读导出 PDD 当前 Accessibility 树 + 截图；不点击、不滑动、不切 App、不兑换。
- `docs/10-alas-on-device-preflight.md`：Alas 本机化第一候选收敛为 AidLux 0.9.2；Termux 因当前 ARM64/mxnet/环境差异证据不做首选。
- `docs/11-final-live-receipt-template.md`：最终一次性上机的证据模板。
- `upstreams/INSTALL-MANIFEST.md`：AutoJs6 / MFABD2 的当前安装包与 SHA256。

离线检查：

- `collect-baseline.js`
- `capture-screen.js`
- `pdd-snapshot.js`

已通过 JavaScript 语法解析检查。

这只能证明脚本文本可被 JavaScript parser 接受，不能证明 AutoJs6 API 在 Node-01 上的实际行为。

### Complexity Gate 再确认

当前**不提前写**：

- PDD 最终 selector；
- PDD 固定点击坐标；
- PDD 最终模板阈值；
- MFABD2 的统一 Adapter；
- Alas 的统一 Adapter；
- 多层 Watchdog；
- 自动重启手机；
- Termux/AidLux/chroot 多路线并行安装器。

原因不是“以后不用”，而是这些机制需要 Final Live Gate 的真实证据才能决定。

准备阶段的完成标准是：

> 到最终上机时，第一轮只需要运行准备好的只读采证和最小 proof，而不是现场重新研究上游、重写工具、重新设计验收。
