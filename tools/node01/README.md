# Node-01 Final Live Toolkit

这里的脚本是**最后上机阶段**使用的验收工具，不代表已经在 K20 Pro 上跑过。

当前状态：CODE/SOURCE PREPARED, LIVE UNVERIFIED。

## 目标

最终上机时一次性采集：

1. Node-01 基线；
2. AutoJs6 版本与能力；
3. Root shell；
4. Accessibility；
5. 当前前台 package/activity；
6. 屏幕截图；
7. PDD 页面 UI / 视觉材料；
8. 后续 latency benchmark 所需证据。

## 顺序

1. 安装已锁定版本 AutoJs6。
2. 运行 `collect-baseline.js`。
3. 运行 `capture-screen.js`。
4. 再进入 PDD 页面做专门采样。
5. 所有 live 结果写入 receipt，不用人工回忆补结论。

## 原则

- collector 尽量只读；
- 不自动修改系统设置；
- 不自动 force-stop 游戏；
- 不在准备脚本中执行真实抢券；
- 任何 destructive / externally visible action 留给最终专项验收。


## 已准备的 Final-Live 工具

```text
collect-baseline.js
  只读设备/AutoJs6/root/accessibility 基线

capture-screen.js
  截图能力与 capture latency

pdd-snapshot.js
  PDD Accessibility tree + screenshot + read-only timing

install-pdd-schedule.js
  最终 live handler 完成后，注册 09:00 / 16:00 / 21:00

remove-pdd-schedule.js
  移除上述持久定时任务

mfabd2-stop.js
  最终 live 阶段验证 root force-stop 是否释放 MFABD2 执行环境

mfabd2-launch.js
  最终 live 阶段验证普通 launcher 边界
```

注意：

- install/stop/launch 都有外部副作用，不属于第一轮只读采证；
- `install-pdd-schedule.js` 在 `runtime/pdd/live.js` 不存在时必须失败；
- 当前没有 `mfabd2-resume.js`，因为恢复行为没有 live 证据；
- 当前没有 PDD 最终点击脚本，因为真实页面证据尚未采集。
