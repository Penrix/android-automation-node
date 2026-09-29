# 05｜上游复用与 fork 策略

## 核心原则

> **我们拥有编排层，上游拥有专业执行器。**

这个仓库不应该变成 AutoJs6、MFABD2、Alas 三个项目的混合 fork。

---

## 1. 当前上游关系

```text
Penrix/android-automation-node
│
├─ 自己拥有
│  ├─ Supervisor
│  ├─ Scheduler
│  ├─ Watchdog
│  ├─ Recovery
│  ├─ Persistent State
│  ├─ PDD Task
│  └─ Upstream Adapters
│
├─ 直接复用
│  ├─ SuperMonster003/AutoJs6
│  ├─ sunyink/MFABD2
│  └─ LmeSzinc/AzurLaneAutoScript
│
└─ 只有出现真实修改需求才 fork
   ├─ Penrix/AutoJs6
   ├─ Penrix/MFABD2
   └─ Penrix/AzurLaneAutoScript
```

---

## 2. AutoJs6：现在不要 fork

AutoJs6 当前角色是：

- 自定义 Android 自动化 runtime；
- PDD 任务候选执行环境；
- Accessibility；
- screenshot；
- template matching；
- OCR；
- Root / shell；
- JavaScript 状态机。

只要官方版本能完成这些，本仓库直接依赖它。

### 什么时候才 fork AutoJs6

只有出现真实证据：

- Root 输入路径有必须修改的 bug；
- Android 9 兼容问题无法通过脚本规避；
- 截图延迟需要改 native 层；
- 必须暴露新的系统 API；
- upstream 不接受或无法及时提供关键修复；

才创建 fork。

---

## 3. MFABD2：先跑官方 Android APK

当前顺序：

```text
官方 APK
→ Node-01 实测
→ 记录兼容问题
→ 尝试外部 Adapter
→ 仍解决不了
→ 才 fork
```

### 值得 fork 的真实理由

例如：

- MIUI 10 / Android 9 特有 bug；
- Root 权限流程需要修；
- 截图接口在 Node-01 上有问题；
- 需要一个明确的 pause / resume / health IPC；
- 需要让 Supervisor 安全接管前台；
- 上游更新器与私人部署目标冲突。

不要因为“以后可能想改”而提前 fork。

---

## 4. Alas：先解决运行环境，不先改游戏逻辑

Alas 当前核心问题：

> Python 主控如何在 K20 Pro 本机稳定运行。

这属于部署 / runtime 问题。

所以首先应该在本仓库维护：

```text
tasks/azurlane/
├─ runtime research
├─ install scripts
├─ localhost ADB setup
└─ supervisor adapter
```

如果官方 Alas 本体无需改动：

> 不 fork。

只有当前 Alas 源码里存在阻碍 Android ARM64 本机化的真实代码边界，才 fork。

---

## 5. Adapter 优先于 Patch

如果可以：

```text
Supervisor
→ shell / intent / file / local API
→ upstream app
```

解决，就不要改上游源码。

Adapter 的好处：

- 上游可以继续自动更新；
- 我们的逻辑保持小；
- upstream bugfix 能直接吃到；
- fork 不会长期落后；
- Codex 后续认知更清楚。

---

## 6. 不复制上游源码进主仓库

禁止为了“方便”把整个上游源码复制到：

```text
vendor/AutoJs6
vendor/MFABD2
vendor/Alas
```

除非后面有明确 vendoring 理由。

复制会导致：

- 来源不清；
- license 混乱；
- 版本过期；
- diff 难看；
- 不知道我们到底改过什么。

---

## 7. 版本记录

本仓库只需要记录：

```text
tested upstream version / commit
tested Node-01 environment
known incompatibilities
local adapter expectations
```

例如以后可以有：

```yaml
mfabd2:
  upstream_commit: ...
  node01_status: verified
  notes: ...

alas:
  upstream_commit: ...
  runtime: ...
  node01_status: ...
```

但现在不要提前实现复杂 manifest。

---

## 8. Fork 后也要保持边界

如果真的 fork：

> fork 只解决“必须改上游本体”的问题。

不要顺手把 Supervisor、PDD、其他游戏逻辑塞进 fork。

仍然保持：

```text
android-automation-node
        ↓
      Adapter
        ↓
     our fork
```

---

## 9. 开源许可证意识

### MFABD2

当前项目采用文件级双许可证：

- 1.1.0 之前创建或修改的文件：MIT；
- 1.1.0 及之后创建或修改的文件：Apache-2.0。

如果 fork / 修改，需要按具体文件和上游说明保留相应许可。

### Alas

Alas 仓库当前为 GPL-3.0。

如果未来分发修改版，需要遵守 GPL-3.0。

### AutoJs6

如果未来需要 fork，先重新核对当时上游仓库 LICENSE，不凭记忆写死。

---

## 10. 当前仓库建议目录

当前阶段只需要保持简单：

```text
android-automation-node/
├─ README.md
├─ docs/
│  ├─ 00-origin-and-cognition.md
│  ├─ 01-architecture.md
│  ├─ 02-k20pro-baseline.md
│  ├─ 03-pdd-coupon.md
│  ├─ 04-game-automation.md
│  └─ 05-upstream-strategy.md
│
├─ supervisor/      # 真正开始实现时再建
├─ tasks/           # 真正开始实现时再建
├─ adapters/        # 真正开始实现时再建
└─ tools/           # 开发辅助需要时再建
```

不要为了目录好看提前创建空目录和占位文件。

---

## 11. 判断“现在要不要 fork”的最简单问题

每次先问：

> 不改上游源码，能不能完成我们当前已经明确的真实任务？

如果答案是：

- 能 → 不 fork；
- 不能，而且有实机 / 源码证据 → fork；
- 不确定 → 先实验，不 fork。

这条规则优先于“私人项目所以 fork 也无所谓”的冲动。
