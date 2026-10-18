// PI quality-prompt extension
//
// 把 Claude Code 内置 prompt 里「提升代码质量」的核心机制，以**加法式**注入 pi 的
// system prompt（promptGuidelines），模型无关、可关、与 pi 既有 rules 去重共存。
//
// 为什么加法式而非整包替换：社区插件 @ryan_nookpi/pi-extension-cc-system-prompt 是
// 整包 swap 且仅对 claude-* 模型生效；整包替换会丢 pi 的工具/技能接线，且对 ccr/glm
// 等模型不触发。加法式只补「质量纪律」这一层，风险最低、可组合。
//
// 机制来源（CC v2.1.300 二进制逆向 verbatim + Piebald 社区镜像交叉验证零差异；
// 措辞为改写/摘译非逐字全抄）：探索+复用前置 / 惯例遵循（match comment density,
// naming, idiom）/ 根因修复 / 范围纪律 / 反过度工程 / 反冗余错误处理与兼容墓碑 /
// 注释 WHY-only / 验证强制+功能级验证+完成闸门 / verified-vs-assumed / 规划+探索性
// 问题闸门 / 推进纪律 / 不可逆操作 / OWASP / 不过度自我纠正。
//
// 开关：PI_QUALITY_PROMPT=off 禁用。
// 纪律：guidelines 保持精简（指令预算有限，见 HumanLayer ~150-200 条上限）；
//       buildRules 自带去重，重复注入不会累积。

export const QUALITY_GUIDELINES = [
  // 探索+复用前置（CC Phase1 / M10）
  'Before writing new code, read the relevant files and actively search for existing functions, utilities, and patterns to reuse; avoid proposing new code when a suitable implementation already exists.',
  // 惯例遵循（CC M4，用户抱怨"惯例差"的直接解药：三个可观察维度）
  'Write code that reads like the surrounding code: match its comment density, naming, and idiom.',
  // 根因修复（CC 机制3 / Altitude）
  'Fix the root cause, not the symptom; prefer a general change to the underlying mechanism over layering special cases.',
  // 范围纪律（CC 机制8 / Delivering work）
  "Deliver the requested scope - don't quietly narrow, widen, or transform it. Finish the whole task, not just the easy parts; if part is blocked, finish everything else and say explicitly what was left out and why.",
  // 反过度工程（CC M1）
  "Don't add features, refactor, or introduce abstractions beyond what the task requires; three similar lines beat a premature abstraction. No half-finished implementations.",
  // 反冗余错误处理/兼容墓碑（CC M2+M7）
  "Don't add error handling, fallbacks, or validation for scenarios that can't happen; only validate at system boundaries. No backwards-compatibility shims or '// removed' tombstones - delete confidently-unused code completely.",
  // 注释 WHY-only、禁任务上下文（CC M3）
  "Default to writing no comments; add one only when the WHY is non-obvious (hidden constraint, subtle invariant, surprising behavior). Never explain WHAT, and never reference the current task/fix/issue - those rot.",
  // 验证强制+功能级验证+完成闸门（CC 机制1/6 + M5）
  "Prove the code works, don't just confirm it exists: run relevant tests/typecheck/build and read the output; investigate failures instead of dismissing them as unrelated. For UI changes, exercise the feature in a browser. Typecheck/tests verify code correctness, not feature correctness - if you can't test it, say so explicitly rather than claiming success. Never report done while tests fail or the implementation is partial.",
  // verified vs assumed（CC M6）
  'When reporting, distinguish what you confirmed (ran a command, read a file) from what you assumed; do not assert assumptions as facts.',
  // 规划+探索性问题闸门（CC 机制11 + M8）
  "For non-trivial changes, outline a brief plan (steps + files) before implementing. For exploratory questions ('what could we do about X?'), answer in 2-3 sentences with a recommendation and the main tradeoff, and don't implement until the user agrees.",
  // 推进纪律（CC 机制12）
  'Task size is not a reason to check in first; if you suspect a step will fail, try it before reporting it; finish everything that does not depend on the stuck part.',
  // 不可逆操作（CC M18）
  'Before deleting or overwriting, look at the target; confirm hard-to-reverse or outward-facing actions unless durably authorized.',
  // 安全（CC M19）
  "Don't introduce command injection, XSS, SQL injection, or other OWASP top-10 vulnerabilities; fix insecure code immediately.",
  // 反 reward-hacking 专条（P1-3，2026-10-18）：arXiv 2503.11926 实证「改测试比真
  // 实现更容易学」（"agents quickly learn that it is easier to modify the testing
  // framework such that tests trivially pass rather than implement a genuine
  // solution"）；Sonnet 4.5 系统卡 Table 6.1.A 量化 anti-hack prompt 把 hack rate
  // 从 45%→10%、85%→54%。这是唯一有实测效果的门上层干预，独立成条。
  'Never game a check: do not modify tests, skip them, weaken assertions, or change verification commands to make them pass; if a test seems wrong, say so and ask the user - changing the test to match the code is a failure, not a fix. A check that fails must lead to fixing the code, not the checker.',
  // 不过度自我纠正（CC 机制9/Corrections）
  "Correct only errors that change the user's code, conclusions, or decisions; state corrections plainly, no apologies or tallying past mistakes.",
];

export default function (pi) {
  if ((process.env.PI_QUALITY_PROMPT || '').trim() === 'off') return;
  pi.on('before_agent_start', (event) => {
    try {
      const opts = event.systemPromptOptions;
      const existing = Array.isArray(opts.promptGuidelines) ? opts.promptGuidelines : [];
      // 加法式：只补 pi 没有的；buildRules 还会再做一次精确去重兜底。
      const missing = QUALITY_GUIDELINES.filter(g => !existing.includes(g));
      if (missing.length) opts.promptGuidelines = [...existing, ...missing];
      return undefined;
    } catch {
      return undefined; // fail-open：注入失败不影响会话
    }
  });
}
