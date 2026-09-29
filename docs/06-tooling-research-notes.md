# 06｜工具研究附录：已经确认过什么

这份文档保存“底座选择”阶段已经做过的研究，避免后续窗口重复调查。

---

# GKD

上游：

- https://github.com/gkd-kit/gkd

## 1. 已确认：GKD 不是固定坐标点击器

源码阅读后确认，GKD 更接近：

> 基于 Android Accessibility 树的状态化规则执行器。

大致执行链：

```text
Accessibility event
→ 当前 App / Activity
→ 筛选可运行规则
→ timing / count / cooldown / precondition
→ query node
→ selector match
→ stale-state recheck
→ action
→ 更新触发状态
→ 下一轮 query
```

因此它很适合：

```text
看到某种 UI 状态
→ 执行动作
```

---

## 2. 已读过的核心区域

曾重点检查：

- A11yRuleEngine
- A11yContext
- A11yRuntime
- A11yState
- A11yService
- AutomationService
- Raw / Resolved rules and groups
- GkdAction
- selector parser / compiler / relations
- snapshot model / repository
- HttpService
- local rule editor
- manifest / accessibility config

这些研究形成了后续“GKD 可用但不做总控”的判断。

---

## 3. GKD 的重要行为认知

### ResolvedRule 是有状态的

规则运行时会记录：

- action time；
- action count；
- match timing；
- cooldown；
- shared counter / shared cooldown bindings。

所以不能把它理解成“每次屏幕变化都从零跑一次 selector”。

---

### matchDelay / actionDelay 不是盲等后点击

延迟后最终仍会重新查询 UI，而不是直接操作一个已经过期的旧节点。

这对动态 UI 很重要。

---

### preKeys 不是简单“以前触发过”

它表达的是：

> 前一个成功触发的规则必须满足绑定的前置规则条件。

因此它可以表达一定程度的局部状态链。

---

### actionMaximumKey / actionCdKey 可以共享实际状态

规则之间可以绑定共享计数 / 冷却，而不是只共享一个配置数字。

---

### App / Activity 切换会影响规则状态

当前应用 / Activity 变化时，规则会依据 resetMatch 等配置重置状态。

所以 GKD 是“带上下文的规则运行时”，不是纯 selector 库。

---

## 4. GKD selector 认知

selector 会被解析 / 编译成内部 instruction。

支持：

- 属性；
- 逻辑关系；
- 节点关系；
- target selection；
- `@` 指定最终目标。

重要点：

> 成功匹配链中的节点不一定就是最终 action target。

如果使用 `@`，可以把“用于判断的节点”和“真正点击的节点”分开。

---

## 5. fastQuery 不是纯性能优化

GKD 对精确 id / vid / text 等条件可走 Android 的快速查找 API。

例如：

- findAccessibilityNodeInfosByViewId
- findAccessibilityNodeInfosByText

这可能和完整 DFS 的“第一个匹配”顺序不完全相同。

因此 fastQuery 可能影响 first-match 语义，不能无脑视为完全等价的加速开关。

---

## 6. Snapshot / Inspect 很有价值

GKD snapshot 保存：

- Accessibility tree；
- screenshot。

这比只看截图更适合写 selector。

另外当前 GKD 有本地 HTTP Inspect 服务。

研究时确认过的接口包括：

```text
/api/getServerInfo
/api/getSnapshot
/api/getScreenshot
/api/captureSnapshot
/api/getSnapshots
/api/deleteSnapshot
/api/updateSubscription
/api/execSelector
```

当时默认 HTTP server port 为：

```text
8888
```

因此开发期可以：

```text
adb forward tcp:8888 tcp:8888
```

然后从 Windows/Codex 侧读取真实 GKD 视角下的 snapshot、测试 selector。

如果以后重新使用 GKD，这比普通 `uiautomator dump` 更贴近真实运行环境。

---

## 7. 为什么 GKD 最后没有成为主底座

不是因为它弱。

而是当前项目需要：

- 精确时间调度；
- 多任务互斥；
- 持久状态；
- 游戏任务；
- 循环；
- 分支；
- watchdog；
- recovery；
- 外部程序控制。

这些更自然地属于完整程序 / Supervisor。

所以：

```text
GKD
= 很强的 reactive rule engine

Supervisor
= 跨任务 orchestration
```

两者职责不同。

---

# AutoJs6

上游：

- https://github.com/SuperMonster003/AutoJs6

## 8. 为什么 AutoJs6 进入主线

AutoJs6 提供一台 Android 本机上完成完整自动化程序需要的关键能力组合：

```text
JavaScript
Accessibility
截图
Template Matching
OCR
Root / shell
点击 / 滑动
文件和状态
```

这使它特别适合：

- PDD 自定义任务；
- Supervisor；
- 没有成熟专用项目的 App；
- 简单游戏状态机。

---

## 9. 已确认的源码能力

研究过当前仓库中的：

- screenshot / requestScreenCapture；
- TemplateMatching；
- shell；
- RootAutomator。

因此：

> “局部模板匹配 + Root 点击”不是假想能力，AutoJs6 本身存在对应底层。

后续仍需在 Node-01 上 benchmark 实际速度。

---

## 10. OCR 的角色经过了修正

一开始 OCR 被视为解决动态 UI 的重要手段。

后来 PDD 场景让策略发生变化：

```text
OCR
从“主识别器”
变成
“最后兜底 / 诊断工具”
```

原因：

- 抢券看重延迟；
- 模块虽然上下移动，但内部视觉结构可能稳定；
- Accessibility / template / color 往往更直接；
- OCR 没必要承担“定位一个固定按钮”的成本。

---

# uiautomator2

上游：

- https://github.com/openatx/uiautomator2

## 11. 当前定位

uiautomator2 很适合成为：

> Codex / Windows 开发期的结构化眼睛和手。

优势：

- UI hierarchy；
- screenshot；
- 文本 / 控件点击；
- Python 接口；
- ADB / HTTP；
- 当前项目还有面向 agent 工作流的 CLI 能力。

但因为本项目要求 PC 可关：

> 不作为长期 runtime 依赖。

---

# Airtest / OpenCV

上游：

- https://github.com/AirtestProject/Airtest

## 12. 当前定位

当目标游戏：

- 没有 Accessibility node；
- 是 Unity / Unreal / OpenGL 等纯渲染 UI；
- 需要模板 / 图像判断；

Airtest / OpenCV 是开发和重视觉任务的“重武器”。

但不要默认常驻。

优先顺序是：

```text
已有专用游戏项目
↓
AutoJs6 / Accessibility
↓
局部图像识别
↓
需要时才 Airtest / OpenCV
```

---

# 专用游戏项目改变了底座策略

## 13. Alas 和 MFABD2 带来的认知

原本容易想成：

```text
AutoJs6
→ 所有 App
→ 所有游戏
```

搜索真实社区后修正为：

```text
通用任务
→ AutoJs6 / 自己写

复杂且已有成熟社区项目的游戏
→ 复用专用机器人
```

也就是：

- 《碧蓝航线》：Alas；
- 《棕色尘埃2》：MFABD2。

这降低了大量重复开发成本。

---

# 当前工具层结论

```text
Supervisor / Orchestration
    ↓
我们自己拥有

PDD / 普通 Android 自动化
    ↓
AutoJs6 候选主 runtime

简单 reactive UI
    ↓
GKD 可选

开发检查
    ↓
ADB + uiautomator2

困难视觉场景
    ↓
Airtest / OpenCV

Brown Dust 2
    ↓
MFABD2

Azur Lane
    ↓
Alas
```

工具不是按“谁最强”统一。

而是：

> 每个工具只承担它最自然、已经被证明擅长的那一层。
