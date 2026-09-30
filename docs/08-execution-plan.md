# 08｜执行计划 rev 2：准备完成后再集中上机

> 2026-09-30 修订：上一版把真机基线放在第一步。Owner 已明确要求“先做好准备，上机测试是最后一步”，因此当前计划改为 **offline/source/code preparation first, physical Node-01 live gate last**。旧思路及修正原因保存在 `docs/09-preflight-readiness.md`。

## 总目标

把 Redmi K20 Pro 变成一个脱离 Windows/Codex 也能长期自主运行的 Android Automation Node。

运行边界由 Owner 明确为：

```text
断电/关机
→ Owner 手动开机
→ Android 进入可用状态
→ 本项目开始负责长期自动化
```

不做来电自启、charger-mode、bootloader/init 或无人冷启动恢复。

最终闭环仍然不变：

```text
游戏运行
→ PDD 高优先级时间窗
→ 停止/让出当前挂机
→ 执行抢券
→ 验证结果
→ 恢复原挂机
```

当前变化只是执行顺序：

```text
先把源码、安装包、代码、采证工具、验收合同全部准备好
→ 最后才连接 K20 Pro 集中验证
```

---

# Phase P0｜Source Reality Freeze

目标：不上机，先把当前上游真实能力和版本边界查清。

## P0.1 AutoJs6

已确认现成能力：

- persistent storage；
- timers；
- child script execution / single-engine force stop；
- app launch；
- Root shell；
- RootAutomator；
- screenshot；
- template matching；
- Accessibility；
- device / foreground metadata。

结论：

> 不造自定义 runtime / storage / scheduler framework。

准备输出：

- 安装包 + SHA256；
- Node-01 collector；
- screenshot collector；
- Supervisor 首期允许使用的 API 清单。

## P0.2 MFABD2

已确认：

- 官方 Android ARM64 APK；
- Android 9+；
- Root / Shizuku；
- AndroidNativeController；
- 正式 package 与 Brown Dust 2 package；
- 真机完整任务仍属于上游自己标注的未验收区。

结论：

> 不 fork、不预写统一 Adapter；先准备官方 APK 最小验收。

## P0.3 Alas

已确认：

- 当前 requirements；
- AidLux 0.92 专门依赖文件仍在仓库；
- ARM64 Docker 路线；
- Python 3.7.10 / mxnet ARM64 特殊处理。

准备继续：

- 依赖可安装性表；
- Android 9 runtime 候选对比；
- 只在 source evidence 足够时选第一候选。

---

# Phase P1｜跨应用抢占合同准备

源码审计后不再实现常驻 Supervisor。

AutoJs6 TimedTask 已成为 PDD 时间调度的唯一 owner；MFABD2 / Alas 保留自己的内部调度。

项目首版只准备跨应用抢占所需的最小事实：

1. 当天是否已成功兑换；
2. 抢占前是谁在运行；
3. 对当前执行器使用真实验证后的最小停止动作；
4. PDD 完成后使用真实验证后的最小恢复入口。

当前已经准备：

- 09:00 / 16:00 / 21:00 TimedTask 安装/移除工具；
- MFABD2 launch / force-stop live probes；
- claimed_date / previous_managed_task runtime contract。

当前故意不写：

- `runtime/pdd/live.js`；
- MFABD2 resume；
- Alas stop/resume；
- 通用 Adapter；
- Task Lock；
- 通用 Watchdog。

这些必须由 Final Live evidence 决定。

---

# Phase P2｜PDD Final-Live Harness 准备

在不上机阶段完成：

- 页面证据采集步骤；
- Accessibility tree 采集方式；
- screenshot 采集；
- 输入 latency benchmark 脚本设计；
- detection benchmark 记录格式；
- refresh → target visible → tap 的时间线日志；
- success / already claimed / sold out receipt 模板。

当前检测策略只是待验证假设：

```text
Accessibility
→ local template/color
→ relative tap
→ OCR fallback
```

只有最终 live evidence 才能选择主链路。

---

# Phase P3｜MFABD2 接入准备

不上机阶段只做：

- 锁定待测正式 APK；
- 校验 SHA256；
- 阅读 Android 上游行为；
- 明确最低验收动作；
- 明确如何观察“停止后是否释放控制权”。

不上机阶段**不写统一 BrownDust2Adapter**。

最终上机先观察它真实可控边界，然后只补实际缺的 integration shim。

---

# Phase P4｜Alas 本机化准备

这是技术风险最高的一条，但源码审计可以提前完成。

不上机阶段：

1. 列出当前 Python/native dependencies；
2. 标记 ARM64 已有 wheel / 特殊 wheel / native library；
3. 对 AidLux / Termux / proot / chroot / Root Linux / container 做证据比较；
4. 选择第一候选和一个明确 fallback 候选；
5. 写安装步骤草案；
6. 准备 localhost ADB proof 步骤。

不要同时实现六条 runtime 路线。

---

# Phase P5｜Static / Code Verification Gate

上机前要求：

```text
[ ] 当前 upstream revision 已锁
[ ] 安装包及 SHA256 已锁
[ ] 准备脚本语法检查通过
[x] 自制 scheduler / Supervisor 已经 Complexity Gate 删除；跨应用抢占合同已准备
[ ] 不存在提前引入的通用 Adapter / retry / watchdog fantasy
[ ] PDD live receipt 模板齐全
[ ] MFABD2 live checklist 齐全
[ ] Alas 第一候选 runtime 有 source-based 理由
[ ] 所有未真机验证项明确标 LIVE UNVERIFIED
```

---

# FINAL LIVE GATE｜最后才上 K20 Pro

到这里之前不碰 Node-01。

最后集中做：

## L0 基线

运行：

- `tools/node01/collect-baseline.js`
- `tools/node01/capture-screen.js`

确认：

- Android/API；
- AutoJs6；
- root；
- Accessibility；
- screenshot；
- foreground metadata。

## L1 PDD

采真实页面：

- UI tree；
- screenshot；
- 动态模块位置；
- 目标券状态；
- click/screenshot/template/OCR latency；
- refresh latency。

根据结果现场选择主检测路径，而不是事先硬编码。

## L2 Supervisor + PDD

证明：

```text
受控挂机任务
→ PDD 抢占
→ PDD 完成/超时
→ 恢复挂机
```

## L3 MFABD2

安装官方 APK，跑最小任务，观察真实暂停/退出/恢复边界。

然后才决定是否需要 integration shim / fork。

## L4 Alas

只跑第一候选 runtime 的最小 proof：

```text
Alas 本机进程
→ localhost ADB
→ 同机截图/识别
→ 一个无风险动作
```

失败时根据实际 blocker 再进入 fallback 候选，而不是预先同时铺开。

---

# 24×7 稳定化

只有 FINAL LIVE GATE 后开始。

Watchdog / Recovery 按真实出现的问题增量加入：

```text
observed failure
→ root cause
→ smallest recovery
→ verify
```

不先写“万能自愈系统”。

---

# 当前状态

| Area | 当前状态 | 上机前剩余 |
|---|---|---|
| Coding standards | READY | 无 |
| Upstream registry | READY | 最终 live 前刷新一次 |
| AutoJs6 source capability | SOURCE VERIFIED | 最终真机 timing 验收 |
| Node-01 collector | CODE PREPARED | 最终上机运行 |
| MFABD2 package/control boundary | PACKAGE/SOURCE VERIFIED | 最终 stop/release/resume 观察 |
| PDD | SCHEDULE/HARNESS PREPARED | 最终真实页面采样后写 live handler |
| Alas | SOURCE/DEPENDENCY AUDIT PREPARED | 最终 AidLux preflight |
| Physical K20 | LIVE UNVERIFIED | **最后阶段统一验证** |

## 当前下一步

不是上机。

当前主要 offline 准备已经完成。

最后只做：

```text
文档状态对齐
→ Complexity Gate removal pass
→ upstream 在 Final Live 前刷新一次
```

然后进入 Owner 指定的最后一步：FINAL LIVE GATE。
