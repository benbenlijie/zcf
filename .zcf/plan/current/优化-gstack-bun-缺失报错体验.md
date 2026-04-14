# 任务：优化 gstack 缺少 bun 时的报错体验

- 时间：2026-04-15 00:08:01
- 项目：`/home/ben/Documents/projects/zcf`
- 目标：让 `zcf` 在安装或更新 Codex 的 `gstack` 时，如果系统缺少 `bun`，不要只抛出堆栈错误，而是给出清晰、可恢复的下一步操作指引。

## 已确认问题

1. `src/utils/code-tools/gstack-installer.ts` 的 `ensurePrerequisites()` 在缺少 `bun` 时直接抛出普通异常。
2. `src/utils/code-tools/codex.ts` 的 `manageCodexGstack()` 与其他 gstack 入口没有消费这类异常，导致最终体验是报错并暴露堆栈。
3. 当前国际化文案只有“安装 gstack 前需要先安装 bun”，没有提供安装命令建议、文档链接和重试提示。

## 执行计划

1. 为 gstack 前置依赖检查增加结构化错误对象，包含缺失依赖和修复建议。
2. 补充中英文文案，为 `git` / `bun` 缺失提供明确指引。
3. 在 Codex 的 gstack 安装、更新、菜单入口统一捕获并展示友好提示，避免堆栈直接暴露给用户。
4. 更新单元测试，覆盖新的诊断对象和菜单层提示逻辑。
5. 运行相关测试，确认没有回归。

## 预期结果

- 缺少 `bun` 时，CLI 会明确告诉用户缺了什么、推荐如何安装、安装后该做什么。
- gstack 相关入口不会再把普通依赖缺失展示成底层异常堆栈。
- 测试覆盖新的错误处理分支，降低后续回归风险。
