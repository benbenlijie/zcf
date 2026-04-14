# 任务：优化 graphify 缺少 Python 3 时的报错体验

- 时间：2026-04-15 00:20:50
- 项目：`/home/ben/Documents/projects/zcf`
- 目标：让 `zcf` 在安装、更新或切换 `graphify` 作用域时，如果系统缺少 Python 3，不再直接抛出异常，而是输出清晰、可恢复的诊断和下一步建议。

## 已确认问题

1. `src/utils/code-tools/graphify-installer.ts` 在检测不到 `python3` / `python` 时直接抛出普通异常。
2. `src/utils/code-tools/codex.ts` 的 `graphify` 相关入口没有统一消费这类异常，最终体验仍然是底层错误。
3. 当前文案只有“安装 graphify 前需要先安装 Python 3”，缺少平台化安装建议、文档链接和重试提示。

## 执行计划

1. 为 `graphify` 前置依赖检查增加结构化错误对象，包含缺失依赖和平台化提示。
2. 在 `codex.ts` 中抽出统一的 `graphify` 安装执行器，复用到初始化、更新、菜单、切换作用域入口。
3. 补充中英文文案和单元测试，覆盖缺少 Python 3 时的交互。
4. 运行针对性测试与类型检查，确认没有回归。

## 预期结果

- 缺少 Python 3 时，CLI 会明确告诉用户缺了什么、当前平台推荐怎么安装、安装后该怎么重试。
- `graphify` 相关入口不会再把普通前置依赖问题展示成底层异常堆栈。
- 与 `gstack` 的依赖诊断体验保持一致，减少用户认知成本。
