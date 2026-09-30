> **REFERENCE ONLY — not default authority.** Current behavior is governed by `START-HERE.md`, `docs/01-architecture.md`, `docs/08-execution-plan.md`, and live evidence. This file preserves preparation/research details and may contain superseded intermediate wording.

# 14｜Alas / AidLux 0.9.2 依赖审计

审查基线：

`LmeSzinc/AzurLaneAutoScript@77f4d01fcd2b0acab05a4d89260e8a0a9cd03d21`

目标不是现在安装，而是让最后上机时先跑最小 preflight，再决定是否进入安装。

---

## 1. 上游没有把 AidLux 当普通 Linux

Alas 自己维护：

- `deploy/AidLux/0.92/pre-installed.txt`
- `deploy/AidLux/0.92/requirements.txt`
- `deploy/AidLux/requirements_generator.py`
- `config/deploy.template-AidLux.yaml`

requirements generator 的逻辑不是简单复制主 requirements。

它会：

1. 读取 AidLux 预装包；
2. 对已有包沿用 AidLux 的版本；
3. 排除 Windows-only `alas-webapp`；
4. 对 numpy 特意取消固定版本，让 pip 处理冲突。

因此我们的准备也不应该自己重新发明一份 requirements。

---

## 2. AidLux 0.9.2 上游预装里与 Alas 直接相关的项目

上游 `pre-installed.txt` 已有：

```text
numpy 1.20.3
scipy 1.7.1
pycryptodome 3.10.4
opencv-contrib-python 4.5.2.54
requests 2.26.0
```

其中生成后的 AidLux requirements：

- scipy 固定为 1.7.1；
- pycryptodome 固定为 3.10.4；
- numpy 留给 pip 解决，不硬钉主仓库旧值。

这正是为什么第一候选应优先使用上游 AidLux 路径，而不是拿主 `requirements.txt` 直接 pip。

---

## 3. 仍需要安装/加载的关键依赖

AidLux 专用 requirements 仍包含：

```text
adbutils==0.11.0
av==10.0.0
cnocr==1.2.2
jellyfish==0.11.2
lz4
mxnet==1.6.0
pillow
psutil==5.9.3
pywebio==1.6.2
pyzmq==22.3.0
uiautomator2==2.16.17
uiautomator2cache==0.3.0.1
uvicorn[standard]==0.17.6
zerorpc==0.6.3
...
```

高风险项目前主要是 native/ABI 相关：

- mxnet；
- av/PyAV；
- psutil；
- pyzmq；
- lz4；
- jellyfish；
- Pillow。

不要在准备阶段逐个写 fallback wheel 逻辑。

先让 `aidlux-preflight.sh` 报告真实 AidLux 环境。

---

## 4. mxnet 是已知真实风险，不是假想风险

Alas 自己的 ARM64 Dockerfile：

- 先装 requirements；
- 再卸载主 mxnet；
- 改装社区 ARM64 `mxnet-1.9.1-py3-none-any.whl`；
- 追加 `LD_LIBRARY_PATH`。

2026 issue #5739 的 Termux 尝试也正好卡过 ARM64 mxnet。

因此 mxnet 是允许进入 blocker ledger 的真实项。

但：

> 不代表现在就把 ARM64 Docker 的 mxnet 方案复制到 AidLux。

AidLux 0.9.2 自己可能有不同 native 环境，必须先 probe。

---

## 5. PyAV 是第二个真实风险

当前 Alas 固定 `av==10.0.0`。

仓库 Dockerfile为了它显式安装：

```text
build-essential
pkg-config
libavformat-dev
libavcodec-dev
libavdevice-dev
libavutil-dev
libswscale-dev
libswresample-dev
libavfilter-dev
Cython==0.29.37
```

并使用：

`pip install av==10.0.0 --no-build-isolation`

因此如果 AidLux 没有可用 wheel，PyAV 很可能需要 native FFmpeg/Cython 环境。

这属于 Final Live 安装阶段需要根据真实 pip 输出处理的 blocker。

不提前写“若 A 失败就 B/C/D”的自动 fallback。

---

## 6. 第一轮 Final Live 只跑 preflight

准备脚本：

`tools/alas/aidlux-preflight.sh`

它只读检查：

- CPU/ABI；
- `/usr/bin/git`；
- `/usr/bin/python`；
- `/usr/bin/adb`；
- pip；
- Python pointer width；
- adb devices；
- 当前是否已经能 import 关键依赖。

它不：

- apt install；
- pip install；
- git clone；
- 修改 ADB；
- 启动 Alas。

这使第一轮真机证据可以直接决定下一步安装命令，不靠猜。

---

## 7. 安装草案（当前不是执行合同）

只有 preflight 符合预期时，第二步才准备沿上游原生结构做：

```sh
git clone https://github.com/LmeSzinc/AzurLaneAutoScript
cd AzurLaneAutoScript

cp config/deploy.template-AidLux.yaml config/deploy.yaml

/usr/bin/python -m pip install -r ./deploy/AidLux/0.92/requirements.txt

/usr/bin/python gui.py
```

这只是 source-derived draft。

最终命令必须根据 preflight 的实际：

- Python version；
- pip 行为；
- native packages；
- mxnet/PyAV 安装结果；

现场收窄。

---

## 8. 当前 blocker ledger

```text
B1 AidLux 0.9.2 是否能在当前 MIUI/Android 9 稳定重启
   → LIVE UNVERIFIED

B2 /usr/bin/python 实际版本和 ABI
   → LIVE UNVERIFIED

B3 /usr/bin/adb 是否可用并可连接同机 Android
   → LIVE UNVERIFIED

B4 mxnet ARM64
   → SOURCE + COMMUNITY KNOWN RISK

B5 PyAV 10 native build/wheel
   → SOURCE KNOWN RISK

B6 当前 Alas 在这套 AidLux Python 上完整 import
   → LIVE UNVERIFIED
```

没有证据的“潜在兼容问题”不进入 blocker ledger。
