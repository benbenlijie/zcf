import type { CodexFullInitOptions, CodexMcpService } from './codex'
import { homedir } from 'node:os'
import ansis from 'ansis'
import inquirer from 'inquirer'
import { join } from 'pathe'
import { getMcpServices, MCP_SERVICE_CONFIGS } from '../../config/mcp-services'
import { ensureI18nInitialized, i18n } from '../../i18n'
import { selectMcpServices } from '../mcp-selector'
import { getSystemRoot, isWindows } from '../platform'
import { updateZcfConfig } from '../zcf-config'
import { backupCodexComplete, getBackupMessage, readCodexConfig } from './codex'
import { resolveCodexMcpCommandOverrides } from './codex-mcp-prerequisites'
import { applyCodexPlatformCommand } from './codex-platform'
import { batchUpdateCodexMcpServices } from './codex-toml-updater'

function buildSerenaArgs(): string[] {
  return ['start-mcp-server', '--context=codex', '--project-from-cwd', '--enable-web-dashboard', 'false']
}

function applyCodexSpecificMcpOverrides(
  id: string,
  command: string,
  args: string[],
  env: Record<string, string>,
): { command: string, args: string[], env: Record<string, string>, startupTimeoutSec: number } {
  const nextCommand = command
  let nextArgs = args
  let startupTimeoutSec = 30

  if (id === 'serena') {
    nextArgs = buildSerenaArgs()
  }

  if (id === 'spec-workflow') {
    env.SPEC_WORKFLOW_HOME = join(homedir(), '.codex', 'memories', 'spec-workflow')
    startupTimeoutSec = 90
  }

  return {
    command: nextCommand,
    args: nextArgs,
    env,
    startupTimeoutSec,
  }
}

export async function configureCodexMcp(options?: CodexFullInitOptions): Promise<void> {
  ensureI18nInitialized()

  const { skipPrompt = false } = options ?? {}
  const existingConfig = readCodexConfig()
  const backupPath = backupCodexComplete()
  if (backupPath)
    console.log(ansis.gray(getBackupMessage(backupPath)))

  // Skip-prompt 模式：自动安装无 API Key 的默认 MCP
  if (skipPrompt) {
    // Ensure workflows/prompts are installed in non-interactive mode
    // Respect options.workflows if provided
    const { runCodexWorkflowSelection } = await import('./codex')
    await runCodexWorkflowSelection({ skipPrompt: true, workflows: options?.workflows ?? [] })

    // Respect options.mcpServices if provided
    // If mcpServices is false, skip MCP installation entirely
    if (options?.mcpServices === false) {
      updateZcfConfig({ codeToolType: 'codex' })
      console.log(ansis.green(i18n.t('codex:mcpConfigured')))
      return
    }

    // Use provided mcpServices list or default to all non-API-key services
    const defaultServiceIds = Array.isArray(options?.mcpServices)
      ? options.mcpServices
      : MCP_SERVICE_CONFIGS
          .filter(service => !service.requiresApiKey)
          .map(service => service.id)
    const commandOverrides = await resolveCodexMcpCommandOverrides(defaultServiceIds)

    const existingServices = existingConfig?.mcpServices || []
    const selection: CodexMcpService[] = []

    for (const id of defaultServiceIds) {
      const configInfo = MCP_SERVICE_CONFIGS.find(service => service.id === id)
      if (!configInfo)
        continue

      let command = commandOverrides[id.toLowerCase()] || configInfo.config.command || id
      let args = (configInfo.config.args || []).map(arg => String(arg))
      const env = { ...(configInfo.config.env || {}) }
      const serviceConfigOverride = applyCodexSpecificMcpOverrides(id, command, args, env)
      command = serviceConfigOverride.command
      args = serviceConfigOverride.args

      const serviceConfig: CodexMcpService = { id: id.toLowerCase(), command, args }
      applyCodexPlatformCommand(serviceConfig)
      command = serviceConfig.command
      args = serviceConfig.args || []
      if (isWindows()) {
        const systemRoot = getSystemRoot()
        if (systemRoot)
          serviceConfigOverride.env.SYSTEMROOT = systemRoot
      }

      selection.push({
        id: id.toLowerCase(),
        command,
        args,
        env: Object.keys(serviceConfigOverride.env).length > 0 ? serviceConfigOverride.env : undefined,
        startup_timeout_sec: serviceConfigOverride.startupTimeoutSec,
      })
    }

    const mergedMap = new Map<string, CodexMcpService>()
    for (const svc of existingServices)
      mergedMap.set(svc.id.toLowerCase(), { ...svc })
    for (const svc of selection)
      mergedMap.set(svc.id.toLowerCase(), { ...svc })

    const finalServices = Array.from(mergedMap.values()).map((svc) => {
      if (isWindows()) {
        const systemRoot = getSystemRoot()
        if (systemRoot) {
          return {
            ...svc,
            env: {
              ...(svc.env || {}),
              SYSTEMROOT: systemRoot,
            },
          }
        }
      }
      return svc
    })

    // Use targeted MCP updates - preserves existing SSE-type services
    batchUpdateCodexMcpServices(finalServices)
    updateZcfConfig({ codeToolType: 'codex' })
    console.log(ansis.green(i18n.t('codex:mcpConfigured')))
    return
  }

  const selectedIds = await selectMcpServices()
  if (!selectedIds)
    return

  const servicesMeta = await getMcpServices()
  const commandOverrides = await resolveCodexMcpCommandOverrides(selectedIds)
  const selection: CodexMcpService[] = []
  const existingServices = existingConfig?.mcpServices || []

  if (selectedIds.length === 0) {
    console.log(ansis.yellow(i18n.t('codex:noMcpConfigured')))

    // No new services to add, but ensure Windows SYSTEMROOT is set for existing services
    const preserved = (existingServices || []).map((svc) => {
      if (isWindows()) {
        const systemRoot = getSystemRoot()
        if (systemRoot) {
          return {
            ...svc,
            env: {
              ...(svc.env || {}),
              SYSTEMROOT: systemRoot,
            },
          }
        }
      }
      return svc
    })

    // Use targeted MCP updates - preserves existing SSE-type services
    batchUpdateCodexMcpServices(preserved)
    updateZcfConfig({ codeToolType: 'codex' })
    return
  }

  for (const id of selectedIds) {
    const configInfo = MCP_SERVICE_CONFIGS.find(service => service.id === id)
    if (!configInfo)
      continue

    const serviceMeta = servicesMeta.find(service => service.id === id)
    let command = commandOverrides[id.toLowerCase()] || configInfo.config.command || id
    let args = (configInfo.config.args || []).map(arg => String(arg))
    const env = { ...(configInfo.config.env || {}) }
    const serviceConfigOverride = applyCodexSpecificMcpOverrides(id, command, args, env)
    command = serviceConfigOverride.command
    args = serviceConfigOverride.args

    const serviceConfig: CodexMcpService = { id: id.toLowerCase(), command, args }
    applyCodexPlatformCommand(serviceConfig)
    command = serviceConfig.command
    args = serviceConfig.args || []

    if (isWindows()) {
      const systemRoot = getSystemRoot()
      if (systemRoot)
        serviceConfigOverride.env.SYSTEMROOT = systemRoot
    }

    if (configInfo.requiresApiKey && configInfo.apiKeyEnvVar) {
      const promptMessage = serviceMeta?.apiKeyPrompt || i18n.t('mcp:apiKeyPrompt')
      const { apiKey } = await inquirer.prompt<{ apiKey: string }>([{
        type: 'input',
        name: 'apiKey',
        message: promptMessage,
        validate: (input: string) => !!input || i18n.t('api:keyRequired'),
      }])

      if (!apiKey)
        continue

      serviceConfigOverride.env[configInfo.apiKeyEnvVar] = apiKey
    }

    selection.push({
      id: id.toLowerCase(),
      command: serviceConfig.command,
      args: serviceConfig.args,
      env: Object.keys(serviceConfigOverride.env).length > 0 ? serviceConfigOverride.env : undefined,
      startup_timeout_sec: serviceConfigOverride.startupTimeoutSec,
    })
  }

  const mergedMap = new Map<string, CodexMcpService>()
  for (const svc of existingServices)
    mergedMap.set(svc.id.toLowerCase(), { ...svc })
  for (const svc of selection)
    mergedMap.set(svc.id.toLowerCase(), { ...svc })

  const finalServices = Array.from(mergedMap.values()).map((svc) => {
    if (isWindows()) {
      const systemRoot = getSystemRoot()
      if (systemRoot) {
        return {
          ...svc,
          env: {
            ...(svc.env || {}),
            SYSTEMROOT: systemRoot,
          },
        }
      }
    }
    return svc
  })

  // Use targeted MCP updates - preserves existing SSE-type services
  batchUpdateCodexMcpServices(finalServices)

  updateZcfConfig({ codeToolType: 'codex' })
  console.log(ansis.green(i18n.t('codex:mcpConfigured')))
}
