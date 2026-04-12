import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'pathe'
import { exec } from 'tinyexec'
import { findCommandPath, getPlatform } from '../platform'

const UV_INSTALL_ARGS = ['tool', 'install', '-p', '3.13', 'serena-agent@latest', '--prerelease=allow']

function getExecutableCandidates(command: 'uv' | 'serena'): string[] {
  const home = homedir()
  const extension = getPlatform() === 'windows' ? '.exe' : ''

  return [
    join(home, '.local', 'bin', `${command}${extension}`),
    join(home, '.cargo', 'bin', `${command}${extension}`),
  ]
}

async function resolveExecutablePath(command: 'uv' | 'serena'): Promise<string | null> {
  const discoveredPath = await findCommandPath(command)
  if (discoveredPath) {
    return discoveredPath
  }

  for (const candidate of getExecutableCandidates(command)) {
    if (existsSync(candidate)) {
      return candidate
    }
  }

  return null
}

async function installUv(): Promise<void> {
  if (getPlatform() === 'windows') {
    await exec('powershell', ['-ExecutionPolicy', 'ByPass', '-c', 'irm https://astral.sh/uv/install.ps1 | iex'])
    return
  }

  await exec('sh', ['-c', 'curl -LsSf https://astral.sh/uv/install.sh | env UV_NO_MODIFY_PATH=1 sh'])
}

async function ensureUvPath(): Promise<string> {
  const existingPath = await resolveExecutablePath('uv')
  if (existingPath) {
    return existingPath
  }

  await installUv()

  const installedPath = await resolveExecutablePath('uv')
  if (!installedPath) {
    throw new Error('uv installation completed but the uv executable was not found')
  }

  return installedPath
}

async function installSerenaAgent(uvPath: string): Promise<void> {
  await exec(uvPath, UV_INSTALL_ARGS)
}

async function initializeSerena(serenaPath: string): Promise<void> {
  const serenaConfigFile = join(homedir(), '.serena', 'serena_config.yml')
  if (existsSync(serenaConfigFile)) {
    return
  }

  await exec(serenaPath, ['init'])
}

export async function ensureSerenaForCodex(): Promise<string> {
  let serenaPath = await resolveExecutablePath('serena')
  if (!serenaPath) {
    const uvPath = await ensureUvPath()
    await installSerenaAgent(uvPath)
    serenaPath = await resolveExecutablePath('serena')
  }

  if (!serenaPath) {
    throw new Error('Serena installation completed but the serena executable was not found')
  }

  await initializeSerena(serenaPath)
  return serenaPath
}

export async function resolveCodexMcpCommandOverrides(serviceIds: string[]): Promise<Partial<Record<string, string>>> {
  const normalizedIds = serviceIds.map(id => id.toLowerCase())
  if (!normalizedIds.includes('serena')) {
    return {}
  }

  return {
    serena: await ensureSerenaForCodex(),
  }
}
