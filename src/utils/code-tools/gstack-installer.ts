import type { CodexConfig } from '../../types/toml-config'
import { existsSync, readFileSync } from 'node:fs'
import ansis from 'ansis'
import { join } from 'pathe'
import { exec } from 'tinyexec'
import { CODEX_GSTACK_DIR, ZCF_CONFIG_FILE } from '../../constants'
import { ensureI18nInitialized, i18n } from '../../i18n'
import { commandExists } from '../platform'
import { moveToTrash } from '../trash'
import { readDefaultTomlConfig, updateTomlConfig } from '../zcf-config'

const GSTACK_REPO_URL = 'https://github.com/garrytan/gstack.git'

export interface GstackStatus {
  installed: boolean
  managed: boolean
  version: string | null
  path: string
}

export interface GstackUpdateStatus extends GstackStatus {
  latestVersion: string | null
  needsUpdate: boolean
}

function persistGstackState(state: { installed?: boolean, managed?: boolean, version?: string | null }): void {
  const current = readDefaultTomlConfig()
  const codexState: Partial<CodexConfig> = {
    enabled: current?.codex?.enabled ?? false,
    systemPromptStyle: current?.codex?.systemPromptStyle ?? 'engineer-professional',
    installMethod: current?.codex?.installMethod,
    envKeyMigrated: current?.codex?.envKeyMigrated,
    gstackInstalled: state.installed ?? current?.codex?.gstackInstalled ?? false,
    gstackManaged: state.managed ?? current?.codex?.gstackManaged ?? false,
    gstackVersion: state.version ?? current?.codex?.gstackVersion,
  }
  updateTomlConfig(ZCF_CONFIG_FILE, {
    codex: codexState as CodexConfig,
  })
}

export async function isGstackInstalled(): Promise<boolean> {
  return existsSync(join(CODEX_GSTACK_DIR, '.git'))
}

export function getGstackInstallPath(): string {
  return CODEX_GSTACK_DIR
}

export function getManagedGstackFlag(): boolean {
  return readDefaultTomlConfig()?.codex?.gstackManaged === true
}

export async function detectGstackVersion(repoDir: string = CODEX_GSTACK_DIR): Promise<string | null> {
  try {
    if (!existsSync(join(repoDir, '.git')))
      return null

    const result = await exec('git', ['-C', repoDir, 'rev-parse', '--short', 'HEAD'])
    return result.stdout.trim() || null
  }
  catch {
    return null
  }
}

async function detectLatestRemoteVersion(repoDir: string = CODEX_GSTACK_DIR): Promise<string | null> {
  try {
    if (!existsSync(join(repoDir, '.git')))
      return null

    const result = await exec('git', ['-C', repoDir, 'ls-remote', 'origin', 'HEAD'])
    const hash = result.stdout.trim().split(/\s+/)[0]
    return hash ? hash.slice(0, 7) : null
  }
  catch {
    return null
  }
}

async function ensurePrerequisites(): Promise<void> {
  const [hasGit, hasBun] = await Promise.all([
    commandExists('git'),
    commandExists('bun'),
  ])

  if (!hasGit) {
    throw new Error(i18n.t('codex:gstackGitRequired'))
  }

  if (!hasBun) {
    throw new Error(i18n.t('codex:gstackBunRequired'))
  }
}

async function runSetup(repoDir: string): Promise<void> {
  await exec('bash', ['-lc', `cd ${JSON.stringify(repoDir)} && ./setup --host codex`])
}

async function cloneOrPullRepo(repoDir: string = CODEX_GSTACK_DIR): Promise<'installed' | 'updated'> {
  const gitDir = join(repoDir, '.git')
  if (!existsSync(gitDir)) {
    await exec('git', ['clone', GSTACK_REPO_URL, repoDir])
    return 'installed'
  }

  await exec('git', ['-C', repoDir, 'pull', '--ff-only'])
  return 'updated'
}

export async function getGstackStatus(): Promise<GstackStatus> {
  const installed = await isGstackInstalled()
  const managed = getManagedGstackFlag()
  const version = installed ? await detectGstackVersion() : null
  return {
    installed,
    managed,
    version,
    path: CODEX_GSTACK_DIR,
  }
}

export async function checkGstackUpdate(): Promise<GstackUpdateStatus> {
  const status = await getGstackStatus()
  const latestVersion = status.installed ? await detectLatestRemoteVersion() : null
  return {
    ...status,
    latestVersion,
    needsUpdate: Boolean(status.installed && status.version && latestVersion && status.version !== latestVersion),
  }
}

export async function installOrUpdateGstackForCodex(markManaged: boolean = true): Promise<void> {
  ensureI18nInitialized()
  await ensurePrerequisites()

  const phase = await cloneOrPullRepo()
  console.log(ansis.blue(i18n.t(phase === 'installed' ? 'codex:gstackInstalling' : 'codex:gstackUpdating')))
  await runSetup(CODEX_GSTACK_DIR)

  const version = await detectGstackVersion()
  persistGstackState({
    installed: true,
    managed: markManaged,
    version,
  })

  console.log(ansis.green(i18n.t(phase === 'installed' ? 'codex:gstackInstallSuccess' : 'codex:gstackUpdateSuccess')))
  if (version) {
    console.log(ansis.gray(`  ${i18n.t('codex:currentVersion', { version })}`))
  }
}

export async function uninstallGstackForCodex(): Promise<{ removed: boolean, warning?: string }> {
  ensureI18nInitialized()

  if (!existsSync(CODEX_GSTACK_DIR)) {
    persistGstackState({
      installed: false,
      managed: false,
      version: null,
    })
    return { removed: false, warning: i18n.t('codex:gstackNotInstalled') }
  }

  const trashResult = await moveToTrash(CODEX_GSTACK_DIR)
  if (!trashResult[0]?.success) {
    throw new Error(trashResult[0]?.error || 'Failed to move gstack to trash')
  }

  persistGstackState({
    installed: false,
    managed: false,
    version: null,
  })

  return { removed: true }
}

export function detectGstackManagedByRepo(): boolean {
  const readmePath = join(CODEX_GSTACK_DIR, 'README.md')
  if (!existsSync(readmePath)) {
    return false
  }

  try {
    const content = readFileSync(readmePath, 'utf-8')
    return content.includes('garrytan/gstack')
  }
  catch {
    return false
  }
}
