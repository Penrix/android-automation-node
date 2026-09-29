# 08｜执行计划：Node-01 四条主线

## 总目标

把 Redmi K20 Pro 变成一个脱离 Windows/Codex 也能长期自主运行的 Android Automation Node。

最终闭环：

```text
Node-01 常态运行游戏
        ↓
高优先级任务到时
        ↓
Supervisor 安全抢占
        ↓
执行 PDD / 其他任务
        ↓
验证结果
        ↓
恢复原游戏/执行器
        ↓
异常可自救，状态可恢复
```

这不是四个互不相关项目。依赖关系是：

```text
Node Foundation / Supervisor
        │
        ├── PDD Coupon
        ├── MFABD2
        └── Alas on-device
                ↓
        Integrated 24×7 Node
```

---

# Track A｜Node-01 基础与 Supervisor

这是其他三条线的公共底座，优先级最高。

## A0｜真实设备基线

目标：把“我们以为这台手机是什么”变成实际设备证据。

采集：

- Android / API / build；
- 分辨率 / density / orientation；
- root；
- ADB；
- 当前前台 Activity；
- AutoJs6 是否可安装/运行；
- Accessibility 是否可启用；
- 截图权限；
- shell / Root input；
- 后台保活行为。

交付：

- `device/node-01.json` 或同等最小状态文件；
- 一份 live receipt；
- 所有设备相关结论标明 evidence class。

完成条件：

> Node-01 基础环境 LIVE VERIFIED。

## A1｜最薄 Supervisor

第一版只做：

```text
IDLE
GAME
PDD_PREPARE
PDD_CLAIM
RECOVERY
ERROR
```

只实现当前真实需要：

- 单一 screen owner；
- 任务启动/停止；
- 最小持久状态；
- 日志；
- 超时；
- 恢复到前一个任务。

暂不做：

- 通用插件系统；
- 多节点；
- Web UI；
- 远程控制平台；
- 泛化 workflow DSL；
- 复杂优先级队列。

完成条件：

> 能用一个假 GameTask + 一个假 HighPriorityTask 在手机本机完成“运行→抢占→恢复”。

## A2｜Watchdog / Recovery v1

只接入真实观察到的故障。

第一版可接受的恢复层：

- 子任务进程消失；
- 目标 App 不在前台；
- 任务超时；
- Supervisor 重启后读取状态。

不要提前实现“任何异常都自动重启手机”。

完成条件：

> 已观察到的首批故障可以恢复；未观察故障不预写幻想式 fallback。

---

# Track B｜拼多多百亿补贴抢券

这是最高优先级、最需要真机实测的业务任务。

## B0｜页面勘察

在真实 PDD 页面采：

- UI / Accessibility tree；
- 页面截图；
- 刷新前后；
- 积分兑券模块不同垂直位置；
- 5 元券局部；
- 兑换按钮；
- 成功 / 已兑换 / 抢完状态。

目标不是抢券，而是回答：

> 哪个信号最稳定、最快？

## B1｜输入延迟 Benchmark

至少比较：

- Accessibility click；
- RootAutomator；
- shell input tap。

记录：

```text
command issued
→
screen observable change
```

同时测：

- screenshot latency；
- template match latency；
- OCR latency；
- refresh 到目标出现时间。

完成条件：

> 关键路径靠实测选择，而不是凭直觉。

## B2｜PDD Detector v1

路线按证据选择：

```text
Accessibility 可用
→ semantic locate

否则
→ screenshot ROI
→ template / color
→ relative tap

OCR
→ fallback / diagnostics
```

第一版只识别：

- 目标券存在；
- 可兑换；
- 成功 / 已兑换 / 不可兑换。

不要做泛化电商页面识别框架。

## B3｜抢券闭环

接 Supervisor：

```text
08:59:40
→ 抢占游戏
→ 打开/准备 PDD
→ 预热

09:00 左右
→ refresh
→ detect
→ tap
→ verify
→ persist claimed_today
→ recover previous task
```

16:00 / 21:00 同理；当天成功则跳过。

完成条件：

> 至少一次真实刷新窗口完整跑通，并且恢复原任务。

---

# Track C｜棕色尘埃2 / MFABD2

这里优先复用上游，不自己重写游戏自动化。

## C0｜官方 APK 直接验收

先不写 Adapter、不 fork。

验证：

- K20 Pro 能否安装；
- Root / Shizuku 授权；
- 能否连接游戏；
- 截图/识别正常；
- 至少跑一个最小日常；
- 后台/前台切换后状态如何；
- MFABD2 停止后能否干净释放屏幕。

完成条件：

> MFABD2 Android 在 Node-01 的真实能力边界被确认。

## C1｜BrownDust2 Adapter

只实现 Supervisor 真正需要的接口。

候选：

```text
start
safe_stop
resume
health
recover
```

先尝试外部控制：

- Activity；
- process；
- Intent；
- 文件/配置；
- 上游已有接口。

只有外部无法完成真实需求，才考虑 fork。

## C2｜PDD 抢占 MFABD2

验证：

```text
MFABD2 正在跑
→ Supervisor 请求停止
→ PDD 抢券
→ MFABD2 / 游戏恢复
```

这是棕色尘埃2线真正与主项目合流的验收。

---

# Track D｜碧蓝航线 / Alas 本机化

这是技术风险最高的一条，放在 PDD 和 MFABD2 之后。

## D0｜2026 当前 Alas 依赖审计

检查当前上游：

- Python 版本；
- native dependencies；
- ARM64 wheel；
- ADB / screenshot backend；
- Web UI/daemon；
- Windows-only 假设；
- Linux ARM64 假设。

输出：

> 当前 Alas 放进 Android 9 / ARM64 最真正的 blocker 是什么。

## D1｜选择最小本机 runtime

候选只根据证据比较：

- AidLux 类环境；
- Termux；
- proot；
- chroot；
- Root Linux；
- container/docker 类环境。

选择标准：

1. 当前 Alas 能跑；
2. ARM64 依赖可安装；
3. localhost ADB 可控同机；
4. 资源占用可接受；
5. 能长期运行；
6. 能被 Supervisor 启停。

不要为了“技术漂亮”选最复杂方案。

## D2｜最小 Alas on-device Proof

只证明：

```text
Alas process 在 K20 Pro
→ localhost ADB
→ 截图同一台手机
→ 识别碧蓝航线页面
→ 执行一个无风险动作
```

先不做 24×7。

## D3｜AzurLane Adapter

和 MFABD2 一样，只做 Supervisor 所需控制边界：

- start；
- safe_stop / pause；
- resume；
- health；
- recover。

## D4｜PDD 抢占 Alas

最终验证：

```text
Alas 正在挂机
→ 到 PDD 时间
→ 安全暂停 Alas
→ PDD
→ 恢复 Alas
```

---

# Track E｜长期无人值守

等 A/B/C 至少稳定后再做。

## E0｜日志与未知状态

统一记录：

- task；
- start/end；
- success/failure；
- failure reason；
- recovery action；
- unknown-screen screenshot。

不要先做云端日志平台。

## E1｜断电/重启恢复

目标：

```text
runtime / phone restart
→ Supervisor 启动
→ 读取持久状态
→ 不重复已完成任务
→ 恢复合理的当前任务
```

来电自动开机是否能做，单独实机研究，不假设。

## E2｜24h Soak

至少连续观察：

- 内存；
- Accessibility；
- AutoJs6/runtime；
- 游戏；
- PDD 调度；
- MFABD2 / Alas；
- 网络异常；
- App 闪退。

记录所有首次出现的真实故障，再决定要不要增加新的 recovery 机制。

---

# 执行顺序

严格按依赖和收益排序：

```text
1. A0 真实设备基线
2. A1 最薄 Supervisor
3. B0 PDD 页面勘察
4. B1 延迟 benchmark
5. B2/B3 PDD 真闭环
6. C0 MFABD2 官方 APK 真机验收
7. C1/C2 接 Supervisor
8. D0 Alas 当前依赖审计
9. D1/D2 Alas 本机 proof
10. D3/D4 接 Supervisor
11. A2 + E0/E1/E2 长期稳定化
```

这个排序的理由：

- PDD 没有成熟上游替我们做，且有准点竞争，应该早解决；
- MFABD2 已有 Android APK，收益高、集成成本预计最低；
- Alas 本机化价值高，但技术风险最大，所以放后；
- Watchdog 不提前幻想所有故障，而是在真实任务跑起来后按故障补。

---

# 第一阶段不做什么

明确禁止首期膨胀：

- 不做多设备管理；
- 不做云端后台；
- 不做可视化 workflow 编辑器；
- 不做完整插件平台；
- 不做所有游戏统一抽象；
- 不 fork 三个上游；
- 不为未知异常预写十层恢复；
- 不把 Codex/Windows 变成 runtime；
- 不把 OCR 当通用锤子；
- 不做反作弊/Root 隐藏。

---

# 项目状态表

| Track | 当前状态 | 下一动作 | 目标证据 |
|---|---|---|---|
| A Supervisor | DESIGN READY | A0 真机基线 | LIVE VERIFIED on Node-01 |
| B PDD | DESIGN READY, LIVE UNVERIFIED | B0 页面勘察 | UI tree + screenshots + latency |
| C MFABD2 | UPSTREAM SUPPORTED, NODE-01 UNVERIFIED | C0 官方 APK | live minimal task |
| D Alas | COMMUNITY-PROVEN CONCEPT, NODE-01 UNVERIFIED | D0 依赖审计 | source/runtime feasibility |
| E 24×7 | NOT STARTED | 等 A/B/C 有真实运行 | soak evidence |

---

# 下一步

现在直接从 **A0 → A1** 开始。

第一件实际工程工作不是写 PDD OCR，也不是 fork MFABD2/Alas，而是建立 Node-01 的真实设备基线，然后写一个最薄 Supervisor 骨架。

这两步完成后，PDD、MFABD2、Alas 才有共同的接入点。
