import type { CodexConfig } from '../../types/toml-config'
import type { SupportedLang } from '../../constants'
import ansis from 'ansis'
import { existsSync } from 'node:fs'
import process from 'node:process'
import { join } from 'pathe'
import { exec } from 'tinyexec'
import { CODEX_AGENTS_FILE, CODEX_GRAPHIFY_DIR, CODEX_HOOKS_FILE, ZCF_CONFIG_FILE } from '../../constants'
import { ensureI18nInitialized, i18n } from '../../i18n'
import { ensureDir, exists, readFile, writeFile } from '../fs-operations'
import { readJsonConfig, writeJsonConfig } from '../json-config'
import { commandExists } from '../platform'
import { moveToTrash } from '../trash'
import { readDefaultTomlConfig, readZcfConfig, updateTomlConfig } from '../zcf-config'

const GRAPHIFY_PACKAGE = 'graphifyy'
const GRAPHIFY_SECTION_START = '<!-- ZCF_GRAPHIFY_START -->'
const GRAPHIFY_SECTION_END = '<!-- ZCF_GRAPHIFY_END -->'
const GRAPHIFY_HOOK_MARKER = 'graphify: Knowledge graph exists.'

export type GraphifyScope = 'global' | 'project'

interface CodexHooksConfig {
  hooks?: {
    PreToolUse?: Array<{
      matcher?: string
      hooks?: Array<{
        type?: string
        command?: string
      }>
    }>
  }
}

export interface GraphifyStatus {
  installed: boolean
  managed: boolean
  version: string | null
  path: string
  pythonCommand: string | null
  scope: GraphifyScope
  agentsPath: string
  hooksPath: string
}

export interface GraphifyUpdateStatus extends GraphifyStatus {
  latestVersion: string | null
  needsUpdate: boolean
}

function persistGraphifyState(state: { installed?: boolean, managed?: boolean, version?: string | null }): void {
  const current = readDefaultTomlConfig()
  const codexState: Partial<CodexConfig> = {
    enabled: current?.codex?.enabled ?? false,
    systemPromptStyle: current?.codex?.systemPromptStyle ?? 'engineer-professional',
    installMethod: current?.codex?.installMethod,
    envKeyMigrated: current?.codex?.envKeyMigrated,
    gstackInstalled: current?.codex?.gstackInstalled ?? false,
    gstackManaged: current?.codex?.gstackManaged ?? false,
    gstackVersion: current?.codex?.gstackVersion,
    graphifyInstalled: state.installed ?? current?.codex?.graphifyInstalled ?? false,
    graphifyManaged: state.managed ?? current?.codex?.graphifyManaged ?? false,
    graphifyVersion: state.version ?? current?.codex?.graphifyVersion,
    graphifyScope: current?.codex?.graphifyScope ?? 'global',
  }

  updateTomlConfig(ZCF_CONFIG_FILE, {
    codex: codexState as CodexConfig,
  })
}

function persistGraphifyScope(scope: GraphifyScope): void {
  const current = readDefaultTomlConfig()
  const codexState: Partial<CodexConfig> = {
    enabled: current?.codex?.enabled ?? false,
    systemPromptStyle: current?.codex?.systemPromptStyle ?? 'engineer-professional',
    installMethod: current?.codex?.installMethod,
    envKeyMigrated: current?.codex?.envKeyMigrated,
    gstackInstalled: current?.codex?.gstackInstalled ?? false,
    gstackManaged: current?.codex?.gstackManaged ?? false,
    gstackVersion: current?.codex?.gstackVersion,
    graphifyInstalled: current?.codex?.graphifyInstalled ?? false,
    graphifyManaged: current?.codex?.graphifyManaged ?? false,
    graphifyVersion: current?.codex?.graphifyVersion,
    graphifyScope: scope,
  }

  updateTomlConfig(ZCF_CONFIG_FILE, {
    codex: codexState as CodexConfig,
  })
}

function getGraphifySkillContent(lang: SupportedLang): string {
  if (lang === 'zh-CN') {
    return `---
name: graphify
description: "将代码、文档、图片等语料转换为知识图谱，并生成报告、HTML 与 JSON"
---

# graphify

当用户明确要求分析代码库结构、生成知识图谱、构建 graph report，或直接提到 \`graphify\` 时使用本技能。

## 使用方式

\`\`\`bash
$graphify .
$graphify ./path/to/project
$graphify ./path --update
\`\`\`

## 执行规则

1. 优先确认 \`graphify\` 命令可用。
2. 默认对当前目录运行，除非用户明确指定其他路径。
3. 如果项目中存在 \`graphify-out/GRAPH_REPORT.md\`，优先阅读该报告，再决定是否重新扫描原始文件。
4. 需要刷新图谱时，优先使用 \`graphify <path> --update\`。
5. 回答时说明图谱输出位置：
   - \`graphify-out/GRAPH_REPORT.md\`
   - \`graphify-out/graph.json\`
   - \`graphify-out/graph.html\`
`
  }

  return `---
name: graphify
description: "Turn code, docs, and assets into a knowledge graph with report, HTML, and JSON outputs"
---

# graphify

Use this skill when the user explicitly asks for graphify, a codebase knowledge graph, architecture graph, or graph report.

## Usage

\`\`\`bash
$graphify .
$graphify ./path/to/project
$graphify ./path --update
\`\`\`

## Execution Rules

1. Verify the \`graphify\` command is available before use.
2. Default to the current directory unless the user provided a path.
3. If \`graphify-out/GRAPH_REPORT.md\` already exists, read it before scanning raw files again.
4. Prefer \`graphify <path> --update\` when the graph only needs a refresh.
5. Tell the user where outputs are written:
   - \`graphify-out/GRAPH_REPORT.md\`
   - \`graphify-out/graph.json\`
   - \`graphify-out/graph.html\`
`
}

function getGraphifyAgentsSection(lang: SupportedLang): string {
  if (lang === 'zh-CN') {
    return `${GRAPHIFY_SECTION_START}
## graphify

- 当仓库中存在 \`graphify-out/GRAPH_REPORT.md\` 时，回答架构、模块关系、跨文件依赖问题前优先阅读该报告。
- 当用户要求生成或刷新知识图谱时，优先使用已安装的 \`graphify\` 技能或 \`graphify\` CLI，而不是手工拼接一次性分析结果。

${GRAPHIFY_SECTION_END}`
  }

  return `${GRAPHIFY_SECTION_START}
## graphify

- If \`graphify-out/GRAPH_REPORT.md\` exists, read it before broad raw-file searching for architecture and codebase questions.
- If the user asks to build or refresh a knowledge graph, prefer the installed \`graphify\` skill or CLI instead of ad-hoc manual graph reconstruction.

${GRAPHIFY_SECTION_END}`
}

const GRAPHIFY_HOOK_ENTRY = {
  matcher: 'Bash',
  hooks: [
    {
      type: 'command',
      command: `[ -f graphify-out/graph.json ] && echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","additionalContext":"${GRAPHIFY_HOOK_MARKER} Read graphify-out/GRAPH_REPORT.md for god nodes and community structure before searching raw files."}}' || true`,
    },
  ],
}

function getPreferredGraphifyLang(): SupportedLang {
  const zcfConfig = readZcfConfig()
  const lang = zcfConfig?.templateLang || zcfConfig?.preferredLang || i18n.language
  return lang === 'zh-CN' ? 'zh-CN' : 'en'
}

export function getGraphifyScope(): GraphifyScope {
  return readDefaultTomlConfig()?.codex?.graphifyScope === 'project' ? 'project' : 'global'
}

function resolveGraphifyPaths(scope: GraphifyScope): { agentsPath: string, hooksPath: string } {
  if (scope === 'project') {
    return {
      agentsPath: join(process.cwd(), 'AGENTS.md'),
      hooksPath: join(process.cwd(), '.codex', 'hooks.json'),
    }
  }

  return {
    agentsPath: CODEX_AGENTS_FILE,
    hooksPath: CODEX_HOOKS_FILE,
  }
}

async function detectPythonCommand(): Promise<string | null> {
  if (await commandExists('python3'))
    return 'python3'
  if (await commandExists('python'))
    return 'python'
  return null
}

async function execPython(pythonCommand: string, args: string[]): Promise<string | null> {
  try {
    const result = await exec(pythonCommand, args)
    return result.stdout.trim() || null
  }
  catch {
    return null
  }
}

function mergeAgentsSection(existingContent: string, section: string): string {
  const sectionPattern = new RegExp(`${GRAPHIFY_SECTION_START}[\\s\\S]*?${GRAPHIFY_SECTION_END}\\s*`, 'g')
  const trimmed = existingContent.replace(sectionPattern, '').trimEnd()
  if (!trimmed)
    return `${section}\n`
  return `${trimmed}\n\n${section}\n`
}

function removeAgentsSection(existingContent: string): string {
  const sectionPattern = new RegExp(`\\n?${GRAPHIFY_SECTION_START}[\\s\\S]*?${GRAPHIFY_SECTION_END}\\s*`, 'g')
  return existingContent.replace(sectionPattern, '\n').trimEnd()
}

function readHooksConfig(hooksPath: string): CodexHooksConfig {
  return readJsonConfig<CodexHooksConfig>(hooksPath, { defaultValue: {} }) || {}
}

function filterGraphifyHooks(entries: NonNullable<CodexHooksConfig['hooks']>['PreToolUse'] = []): NonNullable<CodexHooksConfig['hooks']>['PreToolUse'] {
  return entries.filter((entry) => {
    const hooks = entry.hooks || []
    return !hooks.some(hook => hook.command?.includes(GRAPHIFY_HOOK_MARKER))
  })
}

function installGraphifySkill(preferredLang: SupportedLang): void {
  ensureDir(CODEX_GRAPHIFY_DIR)
  writeFile(join(CODEX_GRAPHIFY_DIR, 'SKILL.md'), getGraphifySkillContent(preferredLang))
}

function installGraphifyAgents(preferredLang: SupportedLang, agentsPath: string): void {
  const section = getGraphifyAgentsSection(preferredLang)
  const current = exists(agentsPath) ? readFile(agentsPath) : ''
  const merged = mergeAgentsSection(current, section)
  writeFile(agentsPath, merged)
}

function installGraphifyHook(hooksPath: string): void {
  const config = readHooksConfig(hooksPath)
  const hooks = config.hooks || {}
  const preToolUse = filterGraphifyHooks(hooks.PreToolUse || []) || []
  hooks.PreToolUse = [...preToolUse, GRAPHIFY_HOOK_ENTRY]
  config.hooks = hooks
  writeJsonConfig(hooksPath, config)
}

function removeGraphifyAgents(agentsPath: string): void {
  if (!exists(agentsPath))
    return

  const updated = removeAgentsSection(readFile(agentsPath))
  if (updated.trim()) {
    writeFile(agentsPath, `${updated}\n`)
  }
}

function removeGraphifyHook(hooksPath: string): void {
  if (!exists(hooksPath))
    return

  const config = readHooksConfig(hooksPath)
  const hooks = config.hooks || {}
  hooks.PreToolUse = filterGraphifyHooks(hooks.PreToolUse || [])
  config.hooks = hooks
  writeJsonConfig(hooksPath, config)
}

export async function detectGraphifyVersion(pythonCommand?: string | null): Promise<string | null> {
  const resolvedPython = pythonCommand || await detectPythonCommand()
  if (!resolvedPython)
    return null

  return await execPython(resolvedPython, [
    '-c',
    'import importlib.metadata as m; print(m.version("graphifyy"))',
  ])
}

async function detectLatestGraphifyVersion(pythonCommand?: string | null): Promise<string | null> {
  const resolvedPython = pythonCommand || await detectPythonCommand()
  if (!resolvedPython)
    return null

  return await execPython(resolvedPython, [
    '-c',
    'import json, urllib.request; print(json.load(urllib.request.urlopen("https://pypi.org/pypi/graphifyy/json", timeout=10))["info"]["version"])',
  ])
}

export function getManagedGraphifyFlag(): boolean {
  return readDefaultTomlConfig()?.codex?.graphifyManaged === true
}

export async function isGraphifyInstalled(): Promise<boolean> {
  return Boolean(await detectGraphifyVersion())
}

export async function getGraphifyStatus(scope: GraphifyScope = getGraphifyScope()): Promise<GraphifyStatus> {
  const pythonCommand = await detectPythonCommand()
  const version = await detectGraphifyVersion(pythonCommand)
  const paths = resolveGraphifyPaths(scope)
  return {
    installed: Boolean(version),
    managed: getManagedGraphifyFlag(),
    version,
    path: CODEX_GRAPHIFY_DIR,
    pythonCommand,
    scope,
    agentsPath: paths.agentsPath,
    hooksPath: paths.hooksPath,
  }
}

export async function checkGraphifyUpdate(scope: GraphifyScope = getGraphifyScope()): Promise<GraphifyUpdateStatus> {
  const status = await getGraphifyStatus(scope)
  const latestVersion = status.installed ? await detectLatestGraphifyVersion(status.pythonCommand) : null
  return {
    ...status,
    latestVersion,
    needsUpdate: Boolean(status.installed && status.version && latestVersion && status.version !== latestVersion),
  }
}

export async function installOrUpdateGraphifyForCodex(
  markManaged: boolean = true,
  preferredLang: SupportedLang = getPreferredGraphifyLang(),
  scope: GraphifyScope = getGraphifyScope(),
): Promise<void> {
  ensureI18nInitialized()

  const pythonCommand = await detectPythonCommand()
  if (!pythonCommand) {
    throw new Error(i18n.t('codex:graphifyPythonRequired'))
  }

  const paths = resolveGraphifyPaths(scope)

  console.log(ansis.blue(i18n.t('codex:graphifyInstalling')))
  await exec(pythonCommand, ['-m', 'pip', 'install', '--upgrade', GRAPHIFY_PACKAGE])
  installGraphifySkill(preferredLang)
  installGraphifyAgents(preferredLang, paths.agentsPath)
  installGraphifyHook(paths.hooksPath)

  const version = await detectGraphifyVersion(pythonCommand)
  persistGraphifyState({
    installed: true,
    managed: markManaged,
    version,
  })
  persistGraphifyScope(scope)

  console.log(ansis.green(i18n.t('codex:graphifyInstallSuccess')))
  console.log(ansis.gray(`  ${i18n.t('codex:graphifyCurrentScope', { scope: i18n.t(`codex:graphifyScope.${scope}`) })}`))
  if (version) {
    console.log(ansis.gray(`  ${i18n.t('codex:currentVersion', { version })}`))
  }
}

export async function uninstallGraphifyForCodex(scope: GraphifyScope = getGraphifyScope()): Promise<{ removed: boolean, warning?: string }> {
  ensureI18nInitialized()

  const pythonCommand = await detectPythonCommand()
  const installedVersion = await detectGraphifyVersion(pythonCommand)
  let removed = false
  const paths = resolveGraphifyPaths(scope)

  if (installedVersion && pythonCommand) {
    await exec(pythonCommand, ['-m', 'pip', 'uninstall', '-y', GRAPHIFY_PACKAGE])
    removed = true
  }

  if (existsSync(CODEX_GRAPHIFY_DIR)) {
    const trashResult = await moveToTrash(CODEX_GRAPHIFY_DIR)
    if (!trashResult[0]?.success) {
      throw new Error(trashResult[0]?.error || 'Failed to move graphify skill to trash')
    }
    removed = true
  }

  removeGraphifyAgents(paths.agentsPath)
  removeGraphifyHook(paths.hooksPath)

  persistGraphifyState({
    installed: false,
    managed: false,
    version: null,
  })
  persistGraphifyScope(scope)

  if (!removed) {
    return { removed: false, warning: i18n.t('codex:graphifyNotInstalled') }
  }

  return { removed: true }
}
