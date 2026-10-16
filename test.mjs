import test from 'node:test';
import assert from 'node:assert/strict';
import quality, { QUALITY_GUIDELINES } from './index.mjs';

const register = () => {
  const handlers = {};
  quality({ on: (e, h) => { handlers[e] = h; } });
  return handlers;
};

test('guidelines 非空且覆盖 CC 逆向出的质量机制', () => {
  assert.ok(QUALITY_GUIDELINES.length >= 12);
  const joined = QUALITY_GUIDELINES.join(' ').toLowerCase();
  for (const kw of [
    'existing functions, utilities, and patterns', // 探索+复用
    'reads like the surrounding code', // 惯例遵循
    'root cause', // 根因
    'requested scope', // 范围纪律
    'premature abstraction', // 反过度工程
    'system boundaries', // 反冗余错误处理
    'default to writing no comments', // 注释 WHY-only
    'prove the code works', // 验证强制
    'assumptions as facts', // verified vs assumed
    'outline a brief plan', // 规划
    'look at the target', // 不可逆
    'owasp', // 安全
    'apologies', // 不过度自纠
  ]) {
    assert.ok(joined.includes(kw), `missing mechanism: ${kw}`);
  }
});

test('before_agent_start 加法式注入 promptGuidelines', () => {
  const handlers = register();
  const opts = { promptGuidelines: ['Be concise in your responses'] };
  handlers.before_agent_start({ systemPromptOptions: opts });
  assert.deepEqual(opts.promptGuidelines, ['Be concise in your responses', ...QUALITY_GUIDELINES]);
});

test('重复注入幂等（不累积）', () => {
  const handlers = register();
  const opts = { promptGuidelines: [] };
  handlers.before_agent_start({ systemPromptOptions: opts });
  const once = opts.promptGuidelines.length;
  handlers.before_agent_start({ systemPromptOptions: opts });
  assert.equal(opts.promptGuidelines.length, once);
});

test('promptGuidelines 缺失时也能注入（undefined → 数组）', () => {
  const handlers = register();
  const opts = {};
  handlers.before_agent_start({ systemPromptOptions: opts });
  assert.deepEqual(opts.promptGuidelines, QUALITY_GUIDELINES);
});

test('PI_QUALITY_PROMPT=off 时不注册', () => {
  const prev = process.env.PI_QUALITY_PROMPT;
  process.env.PI_QUALITY_PROMPT = 'off';
  const handlers = {};
  try { quality({ on: (e, h) => { handlers[e] = h; } }); } finally { if (prev === undefined) delete process.env.PI_QUALITY_PROMPT; else process.env.PI_QUALITY_PROMPT = prev; }
  assert.equal(Object.keys(handlers).length, 0);
});
