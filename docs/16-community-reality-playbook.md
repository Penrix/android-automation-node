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
└─ AidLux 0.9.2
   └─ Linux userspace
      ├─ current Alas source
      ├─ Python
      ├─ adb
      └─ 127.0.0.1:5555 → 同一台 Android
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

# 六、MFABD2：这条最接近“装了就用”

上游当前公开说明：

```text
Android 9+
ARM64
MFABD2 Android APK
Root 或 Shizuku
游戏语言简体中文
```

Node-01 正好是 Android 9 / ARM64 / Root。

MaaFwApp 自己还要求/建议处理：

- 通知；
- 电池白名单；
- 特权 backend；
- 运行期间 foreground service。

因此实际安装顺序应该是：

```text
安装 MFABD2 Android APK
→ root 授权
→ 按 App 提示补通知/电池白名单
→ 让它识别 Brown Dust 2
→ 只跑一个最小任务
→ 再跑完整日常
```

不是一装上就直接让它跑一整夜。

---

# 七、MFABD2 如何给 PDD 让路

固定 MaaFwApp 源码已经说明：

> 宿主 app 进程死亡后，特权进程会退出并释放虚拟屏。

所以第一候选：

```text
PDD prepare
→ root:
   am force-stop io.github.sunyink.mfabd2
```

然后观察：

- MFABD2 是否立即退出；
- privileged process 是否退出；
- virtual display 是否释放；
- Brown Dust 2 本体怎样；
- PDD 能否正常拿到物理前台。

PDD 结束后：

```text
app.launchPackage("io.github.sunyink.mfabd2")
```

只能称为“重新打开 MFABD2”。

是否能自动续上原任务，当前没有证据。

Final Live 观察后有三种可能：

```text
A. launch 后自动续跑
→ 什么都不加

B. launch 后需要点击一个明确 Resume/Start
→ AutoJs6 只补这一刀

C. 必须重建 MFABD2 run
→ 再研究上游已有 schedule/run config 入口
```

不要预先做 Adapter。

---

# 八、Alas：手机本机运行已经有人真实做过

这不是我们臆想。

## 1. 官方 Issue 的历史手机运行

Alas issue #921 记录了：

```text
手机内安装 Alas
→ 浏览器打开 127.0.0.1:22267
→ 在手机上启动 Alas
```

用户遇到的是 WebUI session 空闲后断开，刷新能继续，且“不影响实际运行”。

也就是说手机自托管 Alas 早就真实存在。

## 2. 2026 用户反馈正好撞上 Node-01 条件

issue #5739 的用户明确说：

```text
AidLux 0.9.2
+ Snapdragon 855
+ 低版本 Android
→ 运行顺利

Android 10
→ 正常

Android 13/14
→ AidLux 自身出问题
```

Node-01：

```text
Snapdragon 855
Android 9
```

恰好更接近旧教程成功区间，而不是高 Android 失败区间。

## 3. 社区甚至已经做过“手机 Docker 跑 Alas”

`linwei5d/AzurLaneAutoScript-Docker-Arm64` 明确描述：

- 在手机（类似 OnePlus 8 Pro）里跑 Docker；
- Alas WebUI 为 `127.0.0.1:22267`；
- 推荐手机自身提供 network ADB；
- 常见本机 ADB 地址为 `127.0.0.1:5555`；
- Docker 使用 `--restart=always`。

这个项目最后镜像停在 2024，不能直接作为我们的 2026 生产包。

它的价值是：

> 已经有人证明“Android 手机同时跑 Alas controller，再通过 localhost ADB 控制自己”这套拓扑真实存在。

---

# 九、Alas 在 Node-01 上的真实安装顺序

## Stage A：AidLux 本身

最终先手工安装 AidLux 0.9.2。

启动一次，让 Linux userspace 初始化完成。

然后不装 Alas，先跑：

`tools/alas/aidlux-preflight.sh`

我们要看到：

```text
/usr/bin/python
/usr/bin/git
/usr/bin/adb
ARM64
Python bitness
pip
```

实际是什么。

---

## Stage B：同机 ADB

Alas 最终必须看到 Android device。

目标：

```text
AidLux / Linux:
adb connect 127.0.0.1:5555
adb devices
→ Node-01
```

第一次 proof 可以临时启动 Android adbd TCP。

不在准备阶段写入永久 boot property。

只有 localhost ADB proof 成功以后，才决定日常运行时如何最简便地启动它。断电后的冷启动仍由 Owner 手动开机，不属于无人恢复范围。

---

## Stage C：当前 Alas，而不是旧镜像

成功的 AidLux preflight 后：

```text
clone current LmeSzinc/AzurLaneAutoScript
→ 使用它当前自带的 AidLux 0.92 requirements
→ deploy.template-AidLux.yaml
→ 安装依赖
```

不要直接运行 2024 社区 Docker 镜像。

---

## Stage D：依赖只按真实错误处理

目前有两个真正已知高风险：

### mxnet

- Termux 用户真实卡过 ARM64 mxnet；
- Alas ARM64 Docker 自己也替换过 ARM64 mxnet wheel。

### PyAV

- Alas Docker 为 `av==10.0.0` 专门安装 FFmpeg dev libs + Cython。

所以：

```text
pip install
→ 报 mxnet
   → 处理 mxnet

pip install
→ 报 PyAV/native build
   → 处理 PyAV
```

不要提前准备十套兼容分支。

---

## Stage E：最小 Alas proof

最终只证明：

```text
python gui.py
→ 127.0.0.1:22267 可开
→ ADB serial = 127.0.0.1:5555
→ Alas 取得一帧
→ 识别碧蓝航线主页
```

先不跑全日常。

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
