import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockExec = vi.hoisted(() => vi.fn())
vi.mock('tinyexec', () => ({
  exec: mockExec,
}))

const mockCommandExists = vi.hoisted(() => vi.fn())
vi.mock('../../../../src/utils/platform', () => ({
  commandExists: mockCommandExists,
}))

const mockReadDefaultTomlConfig = vi.hoisted(() => vi.fn())
const mockReadZcfConfig = vi.hoisted(() => vi.fn())
const mockUpdateTomlConfig = vi.hoisted(() => vi.fn())
vi.mock('../../../../src/utils/zcf-config', () => ({
  readDefaultTomlConfig: mockReadDefaultTomlConfig,
  readZcfConfig: mockReadZcfConfig,
  updateTomlConfig: mockUpdateTomlConfig,
}))

const mockExists = vi.hoisted(() => vi.fn())
const mockEnsureDir = vi.hoisted(() => vi.fn())
const mockReadFile = vi.hoisted(() => vi.fn())
const mockWriteFile = vi.hoisted(() => vi.fn())
vi.mock('../../../../src/utils/fs-operations', () => ({
  exists: mockExists,
  ensureDir: mockEnsureDir,
  readFile: mockReadFile,
  writeFile: mockWriteFile,
}))

const mockReadJsonConfig = vi.hoisted(() => vi.fn())
const mockWriteJsonConfig = vi.hoisted(() => vi.fn())
vi.mock('../../../../src/utils/json-config', () => ({
  readJsonConfig: mockReadJsonConfig,
  writeJsonConfig: mockWriteJsonConfig,
}))

const mockMoveToTrash = vi.hoisted(() => vi.fn())
vi.mock('../../../../src/utils/trash', () => ({
  moveToTrash: mockMoveToTrash,
}))

const mockExistsSync = vi.hoisted(() => vi.fn())
vi.mock('node:fs', () => ({
  existsSync: mockExistsSync,
}))

vi.mock('../../../../src/i18n', () => ({
  ensureI18nInitialized: vi.fn(),
  i18n: {
    language: 'zh-CN',
    t: vi.fn((key: string, params?: Record<string, string>) => {
      if (params?.version)
        return `${key}:${params.version}`
      return key
    }),
  },
}))

vi.mock('ansis', () => ({
  default: {
    blue: (value: string) => value,
    green: (value: string) => value,
    gray: (value: string) => value,
  },
}))

describe('graphify-installer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockReadDefaultTomlConfig.mockReturnValue({
      codex: {
        enabled: true,
        systemPromptStyle: 'engineer-professional',
        gstackInstalled: false,
        gstackManaged: false,
        graphifyInstalled: false,
        graphifyManaged: false,
        graphifyScope: 'global',
      },
    })
    mockReadZcfConfig.mockReturnValue({
      templateLang: 'zh-CN',
      preferredLang: 'zh-CN',
    })
    mockReadJsonConfig.mockReturnValue({})
    mockExists.mockReturnValue(false)
    mockExistsSync.mockReturnValue(false)
  })

  it('should report installed version when python and package are available', async () => {
    mockCommandExists.mockResolvedValueOnce(true)
    mockExec.mockResolvedValueOnce({ stdout: '0.4.8\n', exitCode: 0 })

    const { detectGraphifyVersion } = await import('../../../../src/utils/code-tools/graphify-installer')

    await expect(detectGraphifyVersion()).resolves.toBe('0.4.8')
  })

  it('should install graphify package and write managed assets', async () => {
    mockCommandExists.mockResolvedValueOnce(true)
    mockExec
      .mockResolvedValueOnce({ stdout: '', exitCode: 0 })
      .mockResolvedValueOnce({ stdout: '0.4.8\n', exitCode: 0 })

    const { installOrUpdateGraphifyForCodex } = await import('../../../../src/utils/code-tools/graphify-installer')
    const { CODEX_GRAPHIFY_DIR, CODEX_HOOKS_FILE } = await import('../../../../src/constants')

    await expect(installOrUpdateGraphifyForCodex(true, 'zh-CN')).resolves.toBeUndefined()

    expect(mockExec).toHaveBeenCalledWith('python3', ['-m', 'pip', 'install', '--upgrade', 'graphifyy'])
    expect(mockEnsureDir).toHaveBeenCalledWith(CODEX_GRAPHIFY_DIR)
    expect(mockWriteFile).toHaveBeenCalled()
    expect(mockWriteJsonConfig).toHaveBeenCalledWith(CODEX_HOOKS_FILE, expect.objectContaining({
      hooks: expect.objectContaining({
        PreToolUse: expect.arrayContaining([
          expect.objectContaining({
            matcher: 'Bash',
          }),
        ]),
      }),
    }))
    expect(mockUpdateTomlConfig).toHaveBeenCalled()
  })

  it('should install project-scoped graphify assets into current workspace', async () => {
    mockCommandExists.mockResolvedValueOnce(true)
    mockExec
      .mockResolvedValueOnce({ stdout: '', exitCode: 0 })
      .mockResolvedValueOnce({ stdout: '0.4.8\n', exitCode: 0 })

    const { installOrUpdateGraphifyForCodex } = await import('../../../../src/utils/code-tools/graphify-installer')

    await expect(installOrUpdateGraphifyForCodex(true, 'zh-CN', 'project')).resolves.toBeUndefined()

    expect(mockWriteFile).toHaveBeenCalledWith(expect.stringContaining('/AGENTS.md'), expect.any(String))
    expect(mockWriteJsonConfig).toHaveBeenCalledWith(expect.stringContaining('/.codex/hooks.json'), expect.anything())
    expect(mockUpdateTomlConfig).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      codex: expect.objectContaining({
        graphifyScope: 'project',
      }),
    }))
  })

  it('should uninstall graphify package and skill directory', async () => {
    mockCommandExists.mockResolvedValueOnce(true)
    mockExec
      .mockResolvedValueOnce({ stdout: '0.4.8\n', exitCode: 0 })
      .mockResolvedValueOnce({ stdout: '', exitCode: 0 })
    mockExistsSync.mockReturnValue(true)
    mockExists.mockImplementation((target: string) =>
      target.includes('AGENTS.md') || target.includes('hooks.json'),
    )
    mockReadFile.mockReturnValue(`before\n<!-- ZCF_GRAPHIFY_START -->\nkeep\n<!-- ZCF_GRAPHIFY_END -->\nafter\n`)
    mockReadJsonConfig.mockReturnValue({
      hooks: {
        PreToolUse: [
          {
            matcher: 'Bash',
            hooks: [
              {
                type: 'command',
                command: 'graphify: Knowledge graph exists.',
              },
            ],
          },
        ],
      },
    })
    mockMoveToTrash.mockResolvedValue([{ success: true, path: '/tmp/graphify' }])

    const { uninstallGraphifyForCodex } = await import('../../../../src/utils/code-tools/graphify-installer')
    const { CODEX_GRAPHIFY_DIR } = await import('../../../../src/constants')

    await expect(uninstallGraphifyForCodex()).resolves.toEqual({ removed: true })
    expect(mockExec).toHaveBeenCalledWith('python3', ['-m', 'pip', 'uninstall', '-y', 'graphifyy'])
    expect(mockMoveToTrash).toHaveBeenCalledWith(CODEX_GRAPHIFY_DIR)
    expect(mockWriteJsonConfig).toHaveBeenCalled()
    expect(mockUpdateTomlConfig).toHaveBeenCalled()
  })

  it('should uninstall project-scoped graphify config from workspace paths', async () => {
    mockCommandExists.mockResolvedValueOnce(true)
    mockExec
      .mockResolvedValueOnce({ stdout: '0.4.8\n', exitCode: 0 })
      .mockResolvedValueOnce({ stdout: '', exitCode: 0 })
    mockExistsSync.mockReturnValue(true)
    mockExists.mockReturnValue(true)
    mockReadFile.mockReturnValue(`before\n<!-- ZCF_GRAPHIFY_START -->\nkeep\n<!-- ZCF_GRAPHIFY_END -->\nafter\n`)
    mockReadJsonConfig.mockReturnValue({
      hooks: {
        PreToolUse: [
          {
            matcher: 'Bash',
            hooks: [
              {
                type: 'command',
                command: 'graphify: Knowledge graph exists.',
              },
            ],
          },
        ],
      },
    })
    mockMoveToTrash.mockResolvedValue([{ success: true, path: '/tmp/graphify' }])

    const { uninstallGraphifyForCodex } = await import('../../../../src/utils/code-tools/graphify-installer')

    await expect(uninstallGraphifyForCodex('project')).resolves.toEqual({ removed: true })
    expect(mockWriteFile).toHaveBeenCalledWith(expect.stringContaining('/AGENTS.md'), expect.any(String))
    expect(mockWriteJsonConfig).toHaveBeenCalledWith(expect.stringContaining('/.codex/hooks.json'), expect.anything())
  })
})
