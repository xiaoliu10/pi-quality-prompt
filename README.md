# @wengine-ai/pi-quality-prompt

pi coding agent 的**质量纪律**扩展：把 Claude Code 内置 prompt 里「提升代码质量」的核心机制，以**加法式**注入 pi 的 system prompt（`promptGuidelines`）——模型无关、可关、与 pi 既有 rules 去重共存。

规则来源：Claude Code **v2.1.300** 二进制逆向提取（UTF-16-LE），与社区镜像 [Piebald-AI/claude-code-system-prompts](https://github.com/Piebald-AI/claude-code-system-prompts) 交叉验证**逐字零差异**。措辞为改写/摘译，非逐字全抄。

## 安装

```bash
pi install npm:@wengine-ai/pi-quality-prompt
```

重启 pi 会话后生效。禁用：`PI_QUALITY_PROMPT=off`。

## 注入的 14 条规则

| # | 规则要点 | CC 机制出处 |
|---|---|---|
| 1 | 先读代码、主动搜可复用的函数/工具/模式，有现成实现就不新写 | Phase 1 / plan 5-phase |
| 2 | **Write code that reads like the surrounding code: match its comment density, naming, and idiom.** | M4 |
| 3 | 修根因不修症状；优先改底层机制而非叠特例 | Altitude |
| 4 | 不悄悄缩小/扩大/改变任务范围；做完整任务不做容易部分；受阻部分明说 | Delivering work |
| 5 | 不加任务外的功能/重构/抽象；三行重复优于过早抽象；不留半成品 | M1 |
| 6 | 不为不可能的场景加错误处理；只在系统边界校验；不留兼容 shim / `// removed` 墓碑 | M2/M7 |
| 7 | 默认不写注释，只在 WHY 非显然时写；不解释 WHAT、不引用当前任务/issue（会腐化） | M3 |
| 8 | **Prove the code works**：跑测试/typecheck/build 并读输出；UI 改动要在浏览器里走功能；测不了就明说；测试失败/实现不全不许报完成 | 验证强制/M5 |
| 9 | 汇报区分已验证（跑过/读过）与假设；不把假设当事实 | M6 |
| 10 | 非平凡改动先列计划（步骤+文件）；探索性问题 2-3 句给建议+取舍，用户同意前不动手 | plan / M8 |
| 11 | 任务大不是先 check-in 的理由；怀疑会失败先试了再说；先做不依赖受阻部分的全部工作 | reasoning formats |
| 12 | 删除/覆写前先看目标；不可逆或对外操作先确认（除非已持久授权） | M18 |
| 13 | 不引入 command injection/XSS/SQLi 等 OWASP 漏洞；发现立即修 | M19 |
| 14 | 只纠正影响用户代码/结论的错误；不道歉、不盘点旧错 | Corrections |

## 为什么是加法式而不是整包替换

社区插件 `@ryan_nookpi/pi-extension-cc-system-prompt` 把 pi 的 system prompt 整包换成 CC 的，且仅对 `claude-*` 模型生效——整包替换会丢 pi 的工具/技能接线，对 ccr/glm 等模型也不触发。本扩展只补「质量纪律」这一层：风险最低、模型无关、可与其它扩展组合。

## 配套（可选）

- [`pi-lens`](https://www.npmjs.com/package/pi-lens)：LSP/lint/typecheck 实时反馈（机械验证层）
- [`@juicesharp/rpiv-todo`](https://www.npmjs.com/package/@juicesharp/rpiv-todo)：todo 面板（进度可观测）

## 开发与测试

```bash
npm test   # node --test test.mjs，5 个用例
```

## License

MIT
