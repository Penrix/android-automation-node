# 05｜上游复用与 fork 策略

## 核心原则

> 能直接用上游，就不 fork；能直接调用，就不包 Adapter。

当前项目自己真正拥有的只有：

```text
PDD 自定义自动化
+
PDD 到点时的最小跨应用抢占
+
Node-01 相关证据 / 配置
```

游戏内部能力继续归上游。

---

## 当前关系

```text
AutoJs6
→ PDD runtime / TimedTask / Android automation primitives

MFABD2
→ Brown Dust 2 全部游戏自动化

Alas
→ Azur Lane 全部游戏自动化
```

本仓库不复制这三个上游源码。

---

## 什么时候不 fork

以下都不是 fork 理由：

- 想统一接口；
- 想让目录更整齐；
- “以后可能要改”；
- 想先加 pause/resume/health/recover；
- 想把上游都纳入一个框架。

先用上游现成边界。

---

## 什么时候才 fork

只有出现当前、真实、source-level 的必要改动，例如：

- Node-01 上确认存在上游 bug；
- 上游缺少完成当前用户行为所必须的能力；
- 外部调用无法解决；
- 修改范围和许可证影响都已经查清。

顺序：

```text
direct upstream use
→ direct shell / app / existing API
→ smallest project-local glue
→ only then fork if source change is truly required
```

---

## 当前三个上游的决策

### AutoJs6

现在直接使用官方版本。

只有真机证明必须修改底层截图、输入或 Android 9 兼容代码时才 fork。

### MFABD2

先使用官方 Android ARM64 APK。

当前已有 launcher package 和 force-stop 候选，不先造 Adapter。

### Alas

先解决 K20 Pro 本机运行环境。

游戏逻辑本身不改；只有当前 Alas 源码真的阻碍 ARM64/Android 本机运行时才考虑 fork。

---

## 上游版本记录

只记录真正影响 live evidence 的：

```text
upstream revision/package
× Node-01 environment
× behavior exercised
× observation time
```

不维护第二套复杂 dependency manifest。

`upstreams/` 目录只保存当前审查入口和必要 artifact 信息。

---

## 许可证

如果未来真的 fork，再按当时实际文件重新核对许可证。

当前已知：

- MFABD2：文件级 MIT / Apache-2.0 双许可；
- Alas：GPL-3.0；
- AutoJs6：fork 前重新核对当前 LICENSE。

许可证事实不构成提前 fork 的理由。

---

## 判断题

每次只问：

> 不改上游源码，当前用户要求能不能完成？

- 能 → 不 fork。
- 不确定 → 先实测。
- 不能，而且有证据 → 再考虑 fork。
