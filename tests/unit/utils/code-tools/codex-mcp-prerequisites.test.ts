import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockExec = vi.fn()
const mockFindCommandPath = vi.fn()
const mockGetPlatform = vi.fn()
const mockExistsSync = vi.fn()

vi.mock('tinyexec', () => ({
  exec: mockExec,
}))

vi.mock('../../../../src/utils/platform', () => ({
  findCommandPath: mockFindCommandPath,
  getPlatform: mockGetPlatform,
}))

vi.mock('node:fs', () => ({
  existsSync: mockExistsSync,
}))

vi.mock('node:os', () => ({
  homedir: () => '/home/test',
}))

describe('codex-mcp-prerequisites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetPlatform.mockReturnValue('linux')
    mockExistsSync.mockReturnValue(false)
  })

  it('should skip prerequisite resolution when serena is not selected', async () => {
    const { resolveCodexMcpCommandOverrides } = await import('../../../../src/utils/code-tools/codex-mcp-prerequisites')

    const result = await resolveCodexMcpCommandOverrides(['context7', 'spec-workflow'])

    expect(result).toEqual({})
    expect(mockExec).not.toHaveBeenCalled()
  })

  it('should return existing serena executable without installing anything', async () => {
    mockFindCommandPath.mockImplementation(async (command: string) => {
      if (command === 'serena')
        return '/home/test/.local/bin/serena'
      return null
    })
    mockExistsSync.mockImplementation((path: string) => path === '/home/test/.serena/serena_config.yml')

    const { ensureSerenaForCodex } = await import('../../../../src/utils/code-tools/codex-mcp-prerequisites')

    const result = await ensureSerenaForCodex()

    expect(result).toBe('/home/test/.local/bin/serena')
    expect(mockExec).not.toHaveBeenCalled()
  })

  it('should install serena-agent with uv and initialize serena when missing', async () => {
    mockFindCommandPath.mockImplementation(async (command: string) => {
      if (command === 'serena') {
        const installCalled = mockExec.mock.calls.some(
          ([cmd, args]) => cmd === '/home/test/.local/bin/uv' && Array.isArray(args) && args.includes('serena-agent@latest'),
        )
        return installCalled ? '/home/test/.local/bin/serena' : null
      }
      if (command === 'uv')
        return '/home/test/.local/bin/uv'
      return null
    })

    const { ensureSerenaForCodex } = await import('../../../../src/utils/code-tools/codex-mcp-prerequisites')

    const result = await ensureSerenaForCodex()

    expect(result).toBe('/home/test/.local/bin/serena')
    expect(mockExec).toHaveBeenCalledWith('/home/test/.local/bin/uv', ['tool', 'install', '-p', '3.13', 'serena-agent@latest', '--prerelease=allow'])
    expect(mockExec).toHaveBeenCalledWith('/home/test/.local/bin/serena', ['init'])
  })

  it('should install uv first on Linux when uv is missing', async () => {
    mockFindCommandPath.mockImplementation(async (command: string) => {
      if (command === 'uv') {
        const installerCalled = mockExec.mock.calls.some(([cmd]) => cmd === 'sh')
        return installerCalled ? '/home/test/.local/bin/uv' : null
      }
      if (command === 'serena') {
        const installCalled = mockExec.mock.calls.some(
          ([cmd, args]) => cmd === '/home/test/.local/bin/uv' && Array.isArray(args) && args.includes('serena-agent@latest'),
        )
        return installCalled ? '/home/test/.local/bin/serena' : null
      }
      return null
    })

    const { ensureSerenaForCodex } = await import('../../../../src/utils/code-tools/codex-mcp-prerequisites')

    await ensureSerenaForCodex()

    expect(mockExec).toHaveBeenCalledWith('sh', ['-c', 'curl -LsSf https://astral.sh/uv/install.sh | env UV_NO_MODIFY_PATH=1 sh'])
    expect(mockExec).toHaveBeenCalledWith('/home/test/.local/bin/uv', ['tool', 'install', '-p', '3.13', 'serena-agent@latest', '--prerelease=allow'])
  })
})
