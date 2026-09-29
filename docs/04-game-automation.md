# 04｜游戏自动化：通用认知与两条现成路线

## 1. 游戏挂机的成熟形态

目标不是“自动点几下”。

能力通常从：

```text
固定坐标宏
↓
Accessibility
↓
截图 / 找图 / OCR
↓
状态机
↓
定时调度
↓
Watchdog
↓
Recovery
↓
长期无人值守
```

真正高价值的是：

> 用户只保留想玩的部分，把重复性劳动全部交给节点。

---

## 2. 保活型挂机是最便宜的自动化

如果游戏本身已经有：

- 自动战斗；
- 自动寻路；
- 自律；
- 重复战斗；

那么外部自动化不应该重新实现战斗 AI。

只需要负责：

```text
启动
→ 进入目标玩法
→ 开自动
→ 等结算
→ 重复
→ 资源满 / 异常时处理
```

这种最稳定。

---

## 3. 手机上只建议同时跑一个主要重游戏

Node-01 是 6 GB RAM。

当前原则：

```text
常驻：
1 个主要游戏
+
轻量 Supervisor

其他游戏：
按时启动
→ 做完日常
→ 退出
```

不要为了“多任务”让多个大型游戏、OCR、Python 环境同时抢内存。

---

# 《棕色尘埃2》

## 4. 现成项目：MFABD2

上游：

- https://github.com/sunyink/MFABD2

项目基于 MaaFramework。

当前仓库已经明确提供：

```text
MFABD2-<版本>-android-arm64.apk
```

Android 端要求：

- Android 9+；
- ARM64；
- Root 或 Shizuku 授权；
- 游戏使用项目要求的语言 / 画面配置。

Node-01：

```text
Android 9
ARM64
Root
```

从基础条件上吻合。

---

## 5. MFABD2 已覆盖的能力

当前上游 README 已列出大量完整任务，例如：

- 启动 / 更新游戏；
- 自动前置配置；
- 狩猎场；
- 圣石洞穴；
- 肉鸽塔；
- PVP；
- 赛季活动；
- 装备制作 / 强化 / 分解 / 精炼；
- 每日免费抽；
- 优惠抽；
- 卡池保底停抽；
- 地图资源；
- 宠物派遣；
- 餐馆；
- 公会；
- 日常 / 活动 / 通行证 / 邮件；
- 自动钓鱼；
- 跑商。

因此：

> 不应先用 AutoJs6 重写这些能力。

---

## 6. Android 版的现实边界

Android APK 是上游当前明确支持的路线，但它是比较新的端。

上游文档也保留了真机验收边界：

- 部分 agent 回调已验证；
- 完整任务仍需更多实机验收；
- 截图亮度 / 颜色匹配等上游问题可能影响真机；
- 启动、更新、覆盖升级等路径仍在演进。

因此本仓库不能写成：

> “MFABD2 在 K20 Pro 已验证完美可用。”

当前状态应是：

```text
ARCHITECTURE SUPPORTED
NODE-01 LIVE UNVERIFIED
```

下一步应该先装官方 APK 实测。

---

## 7. MFABD2 与 Supervisor 的关系

理想形态：

```text
Supervisor
↓
BrownDust2Adapter
↓
MFABD2 Android
↓
棕色尘埃2
```

Adapter 至少要能表达：

```text
start
pause / safe-stop
resume
health
recover
```

如果上游没有这些控制接口，再决定：

- 外部通过 Android process / Activity 控；
- 通过配置 / Intent 控；
- 还是 fork 增加接口。

不要一开始 fork。

---

# 《碧蓝航线》

## 8. 现成项目：AzurLaneAutoScript / Alas

上游：

- https://github.com/LmeSzinc/AzurLaneAutoScript

Alas 是成熟的碧蓝航线专用机器人。

上游定位本身就是：

> 为 7×24 场景设计，接管近乎全部碧蓝航线玩法。

能力包括：

- 主线；
- 活动；
- 委托；
- 科研；
- 后宅；
- 战术学院；
- 商店；
- 舰队 / 猫；
- 每日；
- 演习；
- 作战档案；
- 大世界；
- 心情控制；
- 无缝调度。

因此同样：

> 不应从零写一个 AutoJs6 碧蓝航线机器人。

---

## 9. Alas 的结构问题

Alas 传统形态：

```text
Python 主控
→ ADB
→ Android 设备 / 模拟器
```

如果 Python 主控在 Windows：

> Windows 必须长期运行。

这不符合本项目目标。

本项目要求：

```text
电脑关掉
→ K20 Pro 仍可挂机
```

所以问题不是“Alas 功能够不够”。

而是：

> **如何把 Alas 主控也放到 K20 Pro 本机。**

---

## 10. Alas 本机化已有历史先例

社区曾有 ARM64 Android / Docker 运行 Alas 的方案。

也有用户在旧 Android + Snapdragon 855 一代环境中，通过类似 AidLux 的 Linux/Python 环境运行 Alas。

概念结构：

```text
K20 Pro
├─ 碧蓝航线 Android App
│
├─ Linux / Python runtime
│   └─ Alas
│
└─ localhost ADB
    └─ Alas 控制同一台手机
```

Node-01 正好是：

```text
Snapdragon 855
Android 9
ARM64
Root
```

这使“本机化”值得研究。

但要注意：

> 这不是当前 Alas 官方的一键 Android APK 路线。

当前状态是：

```text
COMMUNITY-PROVEN CONCEPT
NODE-01 DEPLOYMENT UNVERIFIED
```

---

## 11. Alas 本机化的研究顺序

不要直接照抄旧 Docker 镜像。

应该：

1. 检查当前 Alas 2026 版 Python 依赖；
2. 检查 ARM64 wheel / native dependency；
3. 确定 Android 9 上最干净的 Linux/Python 运行方式；
4. 测试 localhost ADB；
5. 测试截图速度；
6. 测试长期进程稳定性；
7. 最后再做开机自启动 / Supervisor 接入。

候选运行方式可以研究：

- AidLux 类环境；
- Termux；
- proot；
- chroot；
- Root Linux 环境；
- ARM64 Docker 类方案。

不要在没有依赖证据前提前选定。

---

## 12. Alas 与 Supervisor

最终理想形态：

```text
Supervisor
↓
AzurLaneAdapter
↓
Alas runtime (on-device)
↓
localhost ADB
↓
碧蓝航线
```

当拼多多时间到：

```text
Supervisor
→ 请求 Alas 停在安全状态 / 暂停调度
→ 释放前台
→ 跑 PDD
→ 恢复 Alas
```

不要让 Alas 和 PDD 自动化同时操作屏幕。

---

# 通用开发工具

## 13. uiautomator2

适合开发 / 检查：

- UI hierarchy；
- screenshot；
- ADB 设备控制；
- 结构化点击。

但不作为 24×7 PC 依赖。

---

## 14. Airtest / OpenCV

当游戏 UI 不暴露 Accessibility 节点时：

- 模板匹配；
- 图像识别；
- 找色；
- 视觉判断。

只在 AutoJs6 / 上游项目能力不足时加。

不要为了“可能有用”先常驻。

---

## 15. GKD

GKD 仍可用于很简单的响应式 UI 任务：

```text
出现 A
→ 做 B
```

它的规则引擎、selector、snapshot 和 Inspect 能力都很强。

但当前项目的主线需要：

- 调度；
- 状态；
- 多任务切换；
- 游戏；
- 恢复；

所以不把 GKD 作为总控。

---

## 16. 游戏自动化的安全边界

本项目不做：

- 反作弊绕过；
- Root 隐藏；
- Hook 反检测；
- 伪造设备以逃避封禁；
- 绕过游戏安全机制。

只处理：

- 自己账号上的重复 UI 操作；
- 日常；
- 收菜；
- 自动战斗外围调度；
- 异常恢复。

游戏本身仍可能禁止自动化。

是否使用由用户自行判断游戏规则和账号风险。
