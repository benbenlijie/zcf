import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockExistsSync = vi.hoisted(() => vi.fn())
const mockReadFileSync = vi.hoisted(() => vi.fn())
vi.mock('node:fs', () => ({
  existsSync: mockExistsSync,
  readFileSync: mockReadFileSync,
}))

const mockExec = vi.hoisted(() => vi.fn())
vi.mock('tinyexec', () => ({
  exec: mockExec,
}))

const mockCommandExists = vi.hoisted(() => vi.fn())
vi.mock('../../../../src/utils/platform', () => ({
  commandExists: mockCommandExists,
}))

const mockUpdateTomlConfig = vi.hoisted(() => vi.fn())
const mockReadDefaultTomlConfig = vi.hoisted(() => vi.fn())
vi.mock('../../../../src/utils/zcf-config', () => ({
  updateTomlConfig: mockUpdateTomlConfig,
  readDefaultTomlConfig: mockReadDefaultTomlConfig,
}))

const mockMoveToTrash = vi.hoisted(() => vi.fn())
vi.mock('../../../../src/utils/trash', () => ({
  moveToTrash: mockMoveToTrash,
}))

vi.mock('../../../../src/i18n', () => ({
  ensureI18nInitialized: vi.fn(),
  i18n: {
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

describe('gstack-installer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockReadDefaultTomlConfig.mockReturnValue({
      codex: {
        enabled: true,
        systemPromptStyle: 'engineer-professional',
        gstackInstalled: false,
        gstackManaged: false,
      },
    })
  })

  it('should report not installed when .git is missing', async () => {
    mockExistsSync.mockReturnValue(false)

    const { isGstackInstalled } = await import('../../../../src/utils/code-tools/gstack-installer')

    await expect(isGstackInstalled()).resolves.toBe(false)
  })

  it('should throw when git prerequisite is missing', async () => {
    mockCommandExists
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)

    const { installOrUpdateGstackForCodex } = await import('../../../../src/utils/code-tools/gstack-installer')

    await expect(installOrUpdateGstackForCodex()).rejects.toThrow('codex:gstackGitRequired')
  })

  it('should install gstack and persist managed state', async () => {
    mockCommandExists
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
    mockExistsSync
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
    mockExec
      .mockResolvedValueOnce({ stdout: '', exitCode: 0 })
      .mockResolvedValueOnce({ stdout: '', exitCode: 0 })
      .mockResolvedValueOnce({ stdout: 'abc1234\n', exitCode: 0 })

    const { installOrUpdateGstackForCodex } = await import('../../../../src/utils/code-tools/gstack-installer')
    const { CODEX_GSTACK_DIR } = await import('../../../../src/constants')

    await expect(installOrUpdateGstackForCodex(true)).resolves.toBeUndefined()
    expect(mockExec).toHaveBeenCalledWith('git', ['clone', 'https://github.com/garrytan/gstack.git', CODEX_GSTACK_DIR])
    expect(mockUpdateTomlConfig).toHaveBeenCalled()
  })

  it('should detect local version from git rev-parse', async () => {
    mockExistsSync.mockReturnValue(true)
    mockExec.mockResolvedValue({ stdout: 'deadbee\n', exitCode: 0 })

    const { detectGstackVersion } = await import('../../../../src/utils/code-tools/gstack-installer')

    await expect(detectGstackVersion()).resolves.toBe('deadbee')
  })

  it('should uninstall gstack by moving directory to trash', async () => {
    mockExistsSync.mockReturnValue(true)
    mockMoveToTrash.mockResolvedValue([{ success: true, path: '/home/test/.codex/skills/gstack' }])

    const { uninstallGstackForCodex } = await import('../../../../src/utils/code-tools/gstack-installer')
    const { CODEX_GSTACK_DIR } = await import('../../../../src/constants')

    await expect(uninstallGstackForCodex()).resolves.toEqual({ removed: true })
    expect(mockMoveToTrash).toHaveBeenCalledWith(CODEX_GSTACK_DIR)
  })
})
