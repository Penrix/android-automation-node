# 16｜真实用户经验与落地手册

更新时间：2026-09-30。

目标不是继续做架构讨论，而是回答：

> 真到了 K20 Pro 上，这几个东西到底怎么装、怎么连、怎么跑、哪里最可能卡住？

本页把上游源码、GitHub issue、社区真实使用分享分开看。社区经验是方向证据，不替代 Node-01 最终实测。

---

# 一、整体落地形态

最终手机上预期不是一个“大一统 App”，而是：

```text
Redmi K20 Pro / Android 9 / Root

Android
├─ AutoJs6 6.7.0
│  └─ PDD prepare/claim runtime
│
├─ 拼多多
│  └─ 已登录的百亿补贴会员页面
│
├─ MFABD2 Android APK
│  └─ 棕色尘埃2
│
└─ Azur Lane Android host（Final Live 二选一）
   ├─ first probe: ALAS-AOS + Shizuku
   └─ second probe: AzurPilot-for-Android + Root
      └─ both use 1280×720 virtual display
```

Windows/Codex 只在安装、调试、升级时参与。

---

# 二、AutoJs6 在小米/MIUI 上真实要处理什么

## 1. 不是“装完给无障碍”就结束

AutoJs6 6.7.0 已经专门增加：

- 小米/Vivo“后台弹出界面”；
- AlarmManager / WorkManager / JobScheduler 定时任务后端；
- 屏幕捕获权限相关改进。

社区长期运行 AutoJs6 的用户仍普遍把以下配置当成必需准备：

```text
Root 授权
无障碍
后台弹出界面
自启动
忽略电池优化
后台活动限制放开
最近任务锁定
必要时前台服务
修改安全设置
媒体投影/截图权限
```

来源：

- AutoJs6 official README/changelog
- wengzhenquan/autojs6 的长期小米自动化使用说明

社区还明确反馈：

- 无障碍会出现“开着但实际不工作”；
- 锁屏定时任务历史上出现过不唤醒/动作失效；
- 定时任务能否后台拉起不能只看手动运行成功；
- v6.7.0 后可以切换 scheduler backend，但仍需按设备实际测。

因此 Node-01 Final Live 不能只测：

> 手点运行脚本。

必须测：

> 手机处于我们长期挂机的真实状态时，TimedTask 是否按点把脚本真正跑起来。

---

# 三、PDD：没有现成可靠脚本可直接拿来

这一轮没有找到可信、当前、针对：

> 百亿补贴会员 → 积分兑 5 元无门槛券 → 09/16/21 刷新

的成熟开源脚本。

这反而确认了一件事：

> PDD 这条就是我们自己的设备定制任务，不能指望 fork 一个现成项目。

旧 Auto.js 社区里的拼多多/签到项目提供了一个仍然有价值的经验：

```text
先找 id / text / desc
→ 找不到控件
→ 截图找图定位
→ 必要时固定/相对坐标
```

这与我们目前的方向一致。

---

# 四、PDD 真正应该怎么跑

## 1. 首次人工准备

最终上机第一次：

1. 安装/登录拼多多；
2. 手动进入“百亿补贴会员”；
3. 手动进入积分兑券区域；
4. 保持账号和页面路径稳定；
5. 跑 `pdd-snapshot.js`；
6. 导出 Accessibility tree + screenshot。

这一步不抢券。

---

## 2. 先决定 detector，不先写 OCR

### 情况 A：Accessibility 直接看得到

如果 tree 里能看到类似：

```text
5元
无门槛
100积分
兑换
```

并且 node bounds/clickable 稳定：

> 直接用 Accessibility selector + node bounds/click。

这是首选。

### 情况 B：Accessibility 只看到大容器/WebView

则：

```text
截图
→ 截取积分兑券所在的大 ROI
→ 找“5元券卡片”或兑换按钮局部模板
→ 得到当前 y
→ 相对坐标点击
```

模块上下浮动就不再是问题，因为坐标来自当前画面，不是写死 y。

### 情况 C：模板也不稳

最后才让 OCR 只看小 ROI：

```text
ROI
→ OCR "5元" / "100积分" / "兑换"
→ 得到局部位置
```

不跑整屏 OCR。

---

## 3. 为什么不能整点才启动

真实流程必须是：

```text
T - prepare_lead
→ 停当前挂机
→ 唤醒/解锁（如果需要）
→ 拉起 PDD
→ 到目标页
→ 确认 detector ready

T = 09:00 / 16:00 / 21:00
→ 下拉刷新
→ 新内容出现
→ detect
→ tap
→ verify
```

`prepare_lead` 不能猜。

Final Live 要实测：

```text
停止 MFABD2/Alas
+
切到 PDD
+
恢复目标页面
+
首个可用 detector
```

花多少毫秒。

然后才直接用 AutoJs6 TimedTask 注册对应的提前启动时间。

例如如果实测安全提前量是 18 秒，才会注册类似：

```text
08:59:42
15:59:42
20:59:42
```

这里只是解释计算方法，不是提前接受 18 秒。

---

## 4. 点击延迟怎么解决

Final Live 同一页面比较：

```text
Accessibility click
RootAutomator
root shell input tap
```

不测“代码执行耗时”，测：

```text
发出动作的 monotonic time
→
下一帧首次观察到页面发生预期变化
```

谁快且稳定就用谁。

因为 Node-01 是固定机型/ROM/分辨率，所以最终允许利用固定设备优势。

---

# 五、AutoJs6 后台和锁屏现实

真实用户经验告诉我们：

- 锁屏状态下的 TimedTask 历史上出现过不唤醒；
- MIUI root 用户也出现过“定时执行异常但手动正常”；
- 长期用户会开后台弹出、自启动、忽略电池优化、最近任务锁定；
- 无障碍掉线是常见运行故障类别。

所以我们的 Final Live 要额外做两组，而不是只做一组：

```text
A. 屏幕亮 / 游戏前台
B. 实际长期状态（可能熄屏/后台）
```

PDD 抢券只接受 B 的证据。

如果 MFABD2/Alas 最终让物理屏熄灭，那么 PDD prepare 阶段要增加最小：

```text
wake
→ dismiss non-secure keyguard
→ launch PDD
```

Dedicated Node-01 不应设置需要人工输入的安全锁屏，否则无人值守本身无法成立。

---

# 六、MFABD2：Android 版真正的运行方式

MFABD2 当前官方 Android 路线不是“拿手机主屏硬点”。它把资源打进 MaaFwApp APK，MaaFramework 运行在 root/Shizuku 拉起的特权进程里，截图和输入走 AndroidNativeController。

更重要的是，MFABD2 当前固定的 MaaFwApp commit 已经支持 BACKGROUND：

```text
创建虚拟屏
→ Brown Dust 2 移到虚拟屏
→ 自动化在虚拟屏继续
→ 物理屏可正常使用
```

BACKGROUND 是默认 run mode，默认 P720。MFABD2 的识别基准本身就是 1280×720，因此第一候选直接保持默认 720P。

Node-01 已 Root，所以安装后的第一候选设置是：

```text
backend = Root
run mode = Background
resolution = 720P
```

第一次只跑最小任务，确认虚拟屏/物理屏并存后，再开完整日常。

这条 Reality 推翻了早先“PDD 前必须 force-stop MFABD2”的假设。只要 K20 真机 BACKGROUND 正常，就没有理由停掉棕色尘埃2。

---

# 七、MFABD2 仍需真机回答什么

- Root backend 在 MIUI 10 / Android 9 的稳定性；
- 720P virtual display 是否正常；
- Brown Dust 2 是否稳定被固定在虚拟屏；
- 物理屏同时使用是否真正互不干扰；
- Android 截图偏暗是否影响颜色识别；
- 完整任务、钓鱼等 agent 在真机的稳定性。

不要在这些结果出来前增加外部控制层。

---
# 八、碧蓝航线：真正可行的是两个 Android APK，不是泛 ARM64 fork

按 Reality Reconnaissance 重新检查源码、Release、Issue、真机报告和 Node-01 环境后，当前结论是：

```text
first live probe
→ Shinarin/ALAS-AOS

second live probe
→ wess09/AzurPilot-for-Android

fallback
→ original Alas + official AidLux 0.92
```

## 1. ALAS-AOS 为什么先试

它不是“更漂亮”，而是当前对手机 Reality 的处理更完整。

当前证据：

- Android 9+ / minSdk 28；
- ARM64 APK 已发布；
- Ubuntu 24.04 + Python 3.12 + original ALAS；
- 1280×720 后台虚拟屏；
- 本机截图/触控桥；
- 虚拟屏 `mCurrentFocus` 不可用时，会 fallback 到 `pidof <package>` 判断游戏进程；
- 已经在真机上发现桌面 ALAS 模板受手机 GPU 渲染差异影响，并重录手机模板；
- 已实际调查过虚拟屏抢主屏 SystemUI 手势的问题并在 flag 层规避。

代价：

- 仍依赖 Shizuku；
- Node-01 虽已 Root，但仍要维护 Shizuku 这个额外组件；
- 当前完整开发基线主要是较新 HONOR / Android 16；
- MIUI / Android 9 / K20 长稳没有现成证据。

所以状态是：

`CODE / PACKAGE VERIFIED, K20 LIVE UNVERIFIED`

## 2. AzurPilot-for-Android 为什么第二

它对 Node-01 的硬件匹配其实更漂亮：

- Android 9+；
- ARM64；
- Root / Shizuku 双后端；
- Node-01 可以直接 Root；
- modern AzurPilot / Python 3.14 runtime；
- 1280×720 后台虚拟屏；
- 推荐 6 GB+ RAM，Node-01 正好 6 GB。

但当前锁定 Runtime 有一个不能忽略的 Reality MISMATCH。

AzurPilot 真机 issue #1089 已经证明：

```text
游戏在虚拟屏仍正常运行
→ mCurrentFocus 几秒后变 null
→ runtime 把游戏误判成未运行
→ Restart 重试 / 循环
```

该 issue 后来 closed，不是因为修了，而是维护者说 Android backend bug 不在 AzurPilot 主仓收。

AzurPilot-for-Android 当前锁定的 AzurPilot commit：

`4ac2ae452ded4badc75b87ae68868aa8a819b689`

重新读取后，这段 `mCurrentFocus` 逻辑仍然存在，没有 `pidof` fallback。

同时还有 Redmi K50 用户报告过：

`touch down failed` / 滑动不到目标岗位。

因此它是：

`ARCHITECTURE / PACKAGE MATCH, KNOWN RUNTIME MISMATCH, K20 LIVE UNVERIFIED`

不是淘汰，只是不应该在没有 K20 证据前被写成“比 ALAS-AOS 更稳”。

## 3. original Alas + AidLux 为什么还要留

它不再是默认路线，但它有一个非常贴 Node-01 的历史现场证据：

```text
AidLux 0.9.2
+ Snapdragon 855
+ 低 Android
→ 用户报告运行顺利

Android 10
→ 用户报告正常
```

Node-01 就是 Snapdragon 855 + Android 9。

它的问题是部署成本：

- Python 3.7.6-era stack；
- mxnet 1.6；
- PyAV 10；
- local ADB；
- 主显示 1280×720 处理；
- 没有 Android 专用后台宿主这么省事。

所以只有两个 Android APK 都在 K20 出现明确 blocker 时再启用。

## 4. 为什么 Headless / Docker 不进入上机序列

Headless 自己的 support matrix 已经写明：

```text
rooted ARM64 physical Android
→ systemless ANGLE / NULL contract 有真实探索
→ 当前游戏：未验证
→ complete observer：未验证
→ ALAS：未验证
→ thermal / long soak：未验证
```

它是研究项目，不是当前节点运行时。

ARM64 Docker 项目证明的是“Alas 能在 ARM Linux 环境部署”，对 K20 来说只是依赖处理参考。我们已经有 Android APK host，再加 Docker 只会增加层级。

---

# 九、碧蓝航线 Final Live 只做最小证据链

先试 ALAS-AOS：

```text
安装 APK
→ Root 启动 Shizuku
→ 授权
→ Runtime 初始化
→ 建 1280×720 VD
→ 启动游戏
→ 确认主屏不受影响
→ 一个最小安全任务
→ Restart
→ click/swipe
→ 2~3h soak
```

如果有明确 blocker，保存日志和失败状态，再换 AzurPilot-for-Android：

```text
安装 full APK
→ Root backend
→ Runtime 初始化
→ VD
→ 游戏
→ 首先观察 app-current / Restart
→ 再观察 touch/swipe
→ 一个最小安全任务
→ 2~3h soak
```

不要现在给任何一个 fork 写兼容补丁。

Complexity Gate 的要求是：

> Node-01 没有复现的错误，不为它提前造 fallback / wrapper / retry。

只有真实 K20 证据出现后，才决定是修一处、换候选，还是退回 AidLux。

---

# 十、断电处理边界：Owner 手动开机

Owner 已明确实际设备行为和产品边界：

```text
断电
→ K20 Pro 关机
→ 恢复供电后不会自动 boot
→ Owner 手动按键开机
```

这不是项目缺陷，也不是本项目要解决的问题。

因此明确删除这些工作：

- 来电自启研究；
- charger-mode 修改；
- bootloader/init 改造；
- UPS 方案；
- “无人冷启动恢复”测试；
- 为断电恢复增加额外 daemon/watchdog。

软件验收边界从：

```text
Owner 手动开机
→ Android 已进入正常可用状态
```

开始。

如果以后 Owner 希望 Android 开机后自动拉起 AutoJs6 / AidLux / Alas，可以单独评估，但它不是当前 PDD/游戏挂机闭环的前置条件。

---

# 十一、现在真正的最终上机顺序

不是一次把所有软件装完再看哪里炸。

按照依赖逐层：

```text
0. Owner 手动开机
   Android 进入正常可用状态

1. AutoJs6
   root / A11y / screenshot / background / TimedTask

2. PDD 只读
   accessibility tree + screenshot
   detector 决策
   click/screenshot latency
   prepare_lead

3. PDD 单独闭环
   prepare
   refresh
   detect
   redeem
   verify
   claimed_date

4. MFABD2
   install
   root
   minimal run
   force-stop/release
   actual restore path

5. PDD × MFABD2
   game
   → preempt
   → PDD
   → restore

6. Azur Lane Android host
   ALAS-AOS minimal proof
   → blocker 才切 AzurPilot-for-Android
   → 两者都 blocker 才回退 AidLux / original Alas

7. PDD × final Azur Lane runtime
   只对最终通过的 runtime 验证 coexist / preempt / restore

8. 24h soak
   只观察 Android 已运行期间的真实稳定性
```

---

# 十二、目前哪些地方我已经“心里有数”

已经有具体落地路径：

- AutoJs6 在 MIUI 上需要哪些现实权限/保活项；
- PDD 为什么提前准备、整点只刷新/点击；
- PDD detector 的三层降级路线；
- 如何实测点击 latency；
- MFABD2 怎么安装；
- MFABD2 第一候选怎么让出手机；
- 为什么 Azur Lane 当前先试 ALAS-AOS、再试 AzurPilot-for-Android；
- 两个 Android host 的虚拟屏与特权链实际怎么工作；
- AidLux / localhost ADB / mxnet / PyAV 为什么只保留为 fallback；
- 如何把三个项目串起来；
- 断电由 Owner 手动开机，项目不做无人冷启动恢复。

还不知道、且现在不该假装知道：

- PDD 当前页面 Accessibility 到底给了什么；
- 最佳 prepare_lead 是几秒；
- Node-01 上三种点击方式谁最快；
- MFABD2 launch 后怎么恢复原 run；
- ALAS-AOS 的 Shizuku + VD 在 MIUI 10 / Android 9 是否稳定；
- AzurPilot-for-Android 的 Root + VD 是否会复现已知 app-current / touch 问题；
- 只有 Android host 都失败时，AidLux 0.9.2 / local ADB 的具体 fallback 状态。

这些全部已经变成 Final Live 的明确问题，而不是模糊风险。

---

# 十三、历史纠正

早期方案曾把“来电自动 boot / 断电后无人恢复”当作需要研究的节点能力。

Owner 随后明确：

> 这台 K20 Pro 不会来电自启动，也不需要解决；断电后 Owner 手动开机即可。

因此当前架构以这个 Owner 事实为准。早期推演只作为认知形成历史，不再进入实施范围。

---

# 十四、社区/公开证据入口

- AutoJs6 官方：
  https://github.com/SuperMonster003/AutoJs6
- AutoJs6 MIUI/定时真实 issue：
  https://github.com/SuperMonster003/AutoJs6/issues/225
  https://github.com/SuperMonster003/AutoJs6/issues/53
- 长期小米 AutoJs6 用户说明：
  https://github.com/wengzhenquan/autojs6
- 旧 Auto.js 拼多多/签到实践：
  https://github.com/auto-js/autojs-2
  https://github.com/bayson/autojs
- MFABD2：
  https://github.com/sunyink/MFABD2
- MaaFwApp：
  https://github.com/Aliothmoon/MaaFwApp
- Alas 手机真实运行：
  https://github.com/LmeSzinc/AzurLaneAutoScript/issues/921
- Alas 2026 Android/AidLux 反馈：
  https://github.com/LmeSzinc/AzurLaneAutoScript/issues/5739
- 手机 Docker + localhost ADB 架构证明：
  https://github.com/linwei5d/AzurLaneAutoScript-Docker-Arm64
- 当前 ARM64 Docker 参考：
  https://github.com/LittleMio/AzurLaneAutoScript-docker-arm64
- Xiaomi 关机接电自动开机说明：
  https://www.mi.com/global/support/faq/details/KA-544003/
