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
└─ AzurPilot-for-Android
   ├─ Root privileged bridge
   ├─ embedded Ubuntu/PRoot + AzurPilot
   └─ 1280×720 virtual display
      └─ Azur Lane
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
# 八、碧蓝航线：Android 专用版比原版 Alas 更适合当前目标

继续搜索 Alas forks / 衍生项目后，找到：

`wess09/AzurPilot-for-Android`

这不是普通 ARM64 Docker 包装，而是完整 Android 宿主。

## 1. 它解决了之前的四个大问题

旧方案：

```text
AidLux
→ Python 3.7 / 老依赖
→ local ADB
→ 改主屏到 1280×720
→ Alas 控主屏
```

Android 专用版：

```text
安装一个 ARM64 full APK
→ Root backend
→ App 内置 Ubuntu/PRoot + AzurPilot
→ 1280×720 虚拟屏
→ 游戏后台跑
```

因此不再需要：

- 单独安装 AidLux；
- 手工解决 mxnet / PyAV；
- 配 localhost ADB；
- 改 K20 主屏逻辑分辨率；
- 为别的 App 使用物理屏而暂停碧蓝航线。

## 2. K20 基础条件吻合

项目源码：

```text
minSdk = 28
Android 9+
ARM64
Root / Shizuku
```

Node-01：

```text
Android 9 / API 28
ARM64
Root
```

所以首选 Root backend。

## 3. 当前官方包

滚动 Latest 中当前最新已发布 ARM64 full APK：

`AzurPilot-Android-1.2.11-arm64-v8a-full.apk`

SHA-256：

`900a2b6e3ce7709bca43383cca72f4c4cd227d9fc4263ba61fc5a00876432872`

full APK 内置 Runtime，首次安装应使用 full，不用 update APK。

## 4. 真机成熟度不能高估

项目 2026-09-24 才建仓，非常新。

已有成功报告：

- Redmi K60 至尊版，Android 15，Root；
- iQOO Neo 9，Android 16，Shizuku-m；
- Redmi K Pad；
- Redmi Note 10 Pro / MIUI 12.5，Shizuku-m。

但尚未看到 K20 / Android 9 的全链路报告。

已有 bug 也真实存在：

- Android 虚拟屏应用前台判断在部分设备会误判；
- Redmi K50 某些岛屿任务触控/滑动失败；
- 调度停止行为曾有已知问题。

所以最终仍按：

`SOURCE / PACKAGE SUPPORTED, K20 LIVE UNVERIFIED`

处理。

## 5. 原版 Alas + AidLux 变成 fallback

如果 Android 专用版在 K20 遇到明确 blocker，再回退到：

```text
official AidLux 0.92
+ original Alas
+ local ADB
```

之前对 AidLux / ARM64 依赖 / 1280×720 的研究保留作为 fallback 资料，不再作为默认安装路线。

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

6. AidLux / Alas
   preflight
   localhost ADB
   dependency install
   one-frame proof
   one safe action

7. PDD × Alas
   同样验证 preempt/restore

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
- Alas 为什么优先 AidLux；
- Alas 如何通过 localhost ADB 自控同机；
- mxnet/PyAV 真正可能在哪卡；
- 如何把三个项目串起来；
- 断电由 Owner 手动开机，项目不做无人冷启动恢复。

还不知道、且现在不该假装知道：

- PDD 当前页面 Accessibility 到底给了什么；
- 最佳 prepare_lead 是几秒；
- Node-01 上三种点击方式谁最快；
- MFABD2 launch 后怎么恢复原 run；
- AidLux 0.9.2 在这台改机上的实际 Python/native 包状态；
- 本机 adbd TCP 的最终运行方式。

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
