# Changelog

## [0.0.1] - 2026-10-15

### 首次发布
- 14 条从 Claude Code v2.1.300 二进制逆向提取的质量纪律规则（Piebald 社区镜像交叉验证零差异），以加法式注入 pi 的 promptGuidelines。
- 覆盖：探索+复用前置、惯例遵循（comment density/naming/idiom）、根因修复、范围纪律、反过度工程、反冗余错误处理与兼容墓碑、注释 WHY-only、验证强制+功能级验证+完成闸门、verified-vs-assumed、规划+探索性问题闸门、推进纪律、不可逆操作、OWASP、不过度自我纠正。
- 模型无关；`PI_QUALITY_PROMPT=off` 可完全禁用；与 pi 既有 rules 去重共存（fail-open）。
