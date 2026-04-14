# 任务：修复 Codex MCP 中的 Serena / Spec Workflow 配置与前置依赖

- 时间：2026-04-12 18:05:30
- 项目：`/home/ben/Documents/projects/zcf`
- 目标：让 `zcf` 以后在配置 Codex 相关 MCP 时，不再生成会导致 `serena` 启动失败和 `spec-workflow` 冷启动超时的配置。

## 已确认问题

1. `src/config/mcp-services.ts` 中 `serena` 仍使用过期的 `uvx --from git+...` 配置。
2. `src/utils/code-tools/codex-configure.ts` 只会改写 `serena` 的 `--context`，不会补：
   - `--project-from-cwd`
   - `spec-workflow` 的 `SPEC_WORKFLOW_HOME`
   - `spec-workflow` 的更高 `startup_timeout_sec`
   - `serena` 的前置安装与初始化
3. 文档里仍存在过期的 Codex TOML 示例，如 `[mcp_server...]`、`uvx`、缺少 `SPEC_WORKFLOW_HOME` 等。
4. 相关单元测试固化了旧行为，需要同步更新，避免回归。

## 执行计划

1. 新增 Codex MCP 前置依赖辅助模块，负责检测并安装 `uv` / `serena-agent`，并初始化 `serena`。
2. 调整 `src/config/mcp-services.ts` 中 `serena` 的默认元数据，移除旧 `uvx` 启动方式。
3. 重构 `src/utils/code-tools/codex-configure.ts`：
   - 仅在选择 `serena` 时准备前置依赖
   - 为 Codex 生成 `serena start-mcp-server --context=codex --project-from-cwd --enable-web-dashboard false`
   - 为 `spec-workflow` 注入 `SPEC_WORKFLOW_HOME` 和 `startup_timeout_sec = 90`
4. 更新 Codex / MCP / Spec Workflow 相关文档的中英文与必要的日文内容。
5. 更新并新增测试，覆盖新的配置生成与前置依赖逻辑。
6. 运行相关测试与类型检查，确认没有回归。

## 预期结果

- `zcf` 生成的 Codex MCP 配置不会再复现：
  - `serena` 因缺少 `uvx` 或过期启动命令而失败
  - `spec-workflow` 因默认 30 秒冷启动超时而失败
- 文档与真实实现一致。
- 测试覆盖新的默认行为，减少后续回归风险。
