# 10｜Alas 本机化准备：Android 9 / Snapdragon 855 路线收敛

## 当前结论

最终上机前，不同时铺开 Termux、proot、chroot、Docker 六条路线。

基于当前 Alas 源码和 2026 社区反馈，Node-01 的第一候选应收敛为：

> **AidLux 0.9.2 / Alas 自带 AidLux 配置路线优先验证。**

第二候选才是：

> **更标准的 Linux/chroot/container 类环境 + /usr/bin/adb。**

Termux 不作为第一候选。

这仍然只是 SOURCE/COMMUNITY EVIDENCE，不是 Node-01 LIVE 结论。

---

## 1. 为什么 AidLux 是第一候选

Node-01：

```text
Redmi K20 Pro
Snapdragon 855
Android 9
ARM64
Root
```

2026 年 Alas issue #5739 的提问者明确记录：

```text
AidLux 0.9.2
+ Snapdragon 855
+ 低版本 Android
→ 运行顺利
```

同一人还确认 Android 10 正常，而 Android 13/14 的 AidLux 自身会出问题。

这与 Node-01 的 Android 9 环境方向高度吻合。

更重要的是，这不是只有论坛传言。当前 Alas 源码本身仍保留 AidLux 专门支持：

- `deploy/AidLux/0.92/requirements.txt`
- `deploy/AidLux/0.92/pre-installed.txt`
- `config/deploy.template-AidLux.yaml`
- `module/config/config_updater.py` 中 AidLux 默认路径

其中 Alas 会为 AidLux 使用：

```text
GitExecutable: /usr/bin/git
PythonExecutable: /usr/bin/python
RequirementsFile: ./deploy/AidLux/0.92/requirements.txt
AdbExecutable: /usr/bin/adb
```

因此 AidLux 是当前最少“自己发明兼容层”的路线。

---

## 2. 为什么 Termux 不做首选

issue #5739 中：

- 用户尝试 Termux，遇到 ARM64 mxnet 依赖问题；
- Alas maintainer LmeSzinc 明确回复：Termux 坑很多，它既不是普通 Android 环境，也不是标准 Linux，建议看云手机安装路线；
- 用户后续虽然最终“磕磕绊绊地跑起来”，但说明需要混合旧版、新版和云手机教程，步骤零散且有错误。

此外当前 Alas 依赖仍有：

- `mxnet==1.6.0`
- `av==10.0.0`
- 老版本 scipy/numpy 组合
- uiautomator2 / adbutils 固定旧版本

这些都使 Termux 的包生态差异成为真实风险，而不是假想风险。

所以：

> 不把 Termux 当默认“最简单 Android Linux”。

---

## 3. ARM64 已经存在的源码证据

Alas 仓库的 `dev_tools/arm64/Dockerfile` 已经处理过 ARM64：

- Python 3.7.10；
- Linux adb；
- libGL；
- atlas / OpenCV / build tools；
- requirements；
- 单独安装 ARM64 mxnet 1.9.1 wheel。

这说明 Alas 在 ARM64 Linux 上的主要痛点已经被上游认知过。

但这个 Dockerfile是开发/构建证据，不代表直接适合 Android 9 手机上长期运行。

---

## 4. 第一候选最终上机 Proof 的边界

第一次上机不追求完整挂机。

只证明：

```text
AidLux 0.9.2 在 Node-01 可正常启动
→ /usr/bin/python 可用
→ /usr/bin/adb 可用
→ Alas 当前源码可安装/启动
→ localhost / 本机 ADB 可识别 Node-01
→ Alas 能取得一帧同机游戏截图
```

到这里就停。

只有这个 proof 通过，才继续：

- Benchmark；
- UI 识别；
- 一个无风险动作；
- 后续长期运行。

---

## 5. 第二候选什么时候进入

只有第一候选遇到**明确 blocker**时才进入。

例如：

- AidLux 在 Android 9/当前 MIUI 无法稳定启动；
- Python/runtime 与当前 Alas 明确不兼容；
- 本地 ADB 无法形成可用连接；
- 长期进程被 AidLux 本身限制。

第二候选优先研究标准 Linux/chroot/container，因为当前 Alas 的 Linux/AidLux配置已经天然假设：

```text
/usr/bin/python
/usr/bin/git
/usr/bin/adb
```

这比在 Termux 上重新解决路径、包、native wheel 兼容更接近上游结构。

---

## 6. 准备阶段不做什么

- 不下载并同时维护六套 runtime；
- 不修改 Alas 游戏逻辑；
- 不 fork Alas；
- 不升级 K20 的 Android；
- 不为了 Alas 安装新 ROM；
- 不写一个“兼容所有 Linux 环境”的安装器；
- 不声称 AidLux 一定成功。

---

## 7. 当前 Evidence Class

```text
Alas ARM64 Linux support:
SOURCE VERIFIED

AidLux-specific upstream support:
SOURCE VERIFIED

SD855 + low Android AidLux success:
COMMUNITY REPORTED

Node-01 Android 9 success:
LIVE UNVERIFIED
```

最终上机前只需再把具体安装命令与当前仓库 revision 对齐一次。
