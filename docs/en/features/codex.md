---
title: Codex Support
---

# Codex Support

[Codex](https://www.npmjs.com/package/@openai/codex) is OpenAI's official code generation CLI tool. ZCF now supports complete Codex integration with the same configuration convenience as Claude Code.

## Core Features

ZCF provides a complete automated configuration experience for Codex, with core features including:

- **Unified Tool Management**: Seamlessly switch between Claude Code and Codex through ZCF menu
- **Smart Configuration System**: Automatic Codex CLI installation, API provider setup, and MCP service integration
- **Complete Backup Mechanism**: All configuration changes include timestamped backups with restore functionality
- **Multi-Provider Support**: Configure multiple API providers (OpenAI, custom endpoints) with easy switching
- **System Prompt Integration**: Install professional AI personalities (engineer, nekomata engineer, laowang engineer)
- **Workflow Templates**: Import structured development workflows optimized for code generation tasks
- **Advanced Uninstaller**: Selectively remove Codex components with conflict resolution support

## Installation and Upgrade

### Auto Detection and Installation

ZCF automatically detects whether `@openai/codex` CLI is installed on the system:

```bash
# Initialize Codex (auto-detect and install)
npx @benbenwu/zcf i -s -T codex -p 302ai -k "sk-xxx"
```

If Codex is not detected, ZCF will automatically execute:
```bash
npm install -g @openai/codex
```

### Upgrade Codex

ZCF supports one-click Codex CLI upgrade:

```bash
# Upgrade through update check
npx @benbenwu/zcf check-updates --code-type codex

# Or through menu
npx @benbenwu/zcf → Select + (Check Updates) → Select Codex
```

> ✅ **Automatic Processing**: If upgrade fails, ZCF will provide detailed error information to help diagnose issues.

## Optional Enhancement: gstack

ZCF can manage [garrytan/gstack](https://github.com/garrytan/gstack) as an optional enhancement pack for Codex. It is not required for Codex itself and is not installed by default.

### When to use it

- You want additional Codex workflow/skills capabilities
- You want ZCF to handle install, update, and uninstall flows for it

### Prerequisites

- `git`
- `bun`

If either prerequisite is missing, ZCF stops with a clear error instead of trying to install system tooling automatically.

### Installation

```bash
# Install gstack together with Codex in non-interactive mode
npx @benbenwu/zcf i -s -T codex --install-gstack true
```

In interactive mode:

- `npx @benbenwu/zcf`
- switch to `Codex`
- choose `1. Full initialization`
- confirm the `gstack` prompt near the end of initialization

### Standalone Management

You can manage gstack directly from the Codex menu:

- `npx @benbenwu/zcf`
- switch to `Codex`
- choose `7. Manage gstack`

The menu supports:

- install/reinstall
- update
- uninstall

### Updates and Uninstall

- `check-updates --code-type codex` now checks ZCF-managed `gstack` after the Codex CLI update flow
- custom Codex uninstall now includes a `gstack` item

> 💡 **Boundary**: ZCF only manages the `gstack` instance it installed and marked as managed. It does not try to take over unknown third-party modifications.

## Configuration File Management

### Directory Structure

ZCF creates the following directory structure for Codex:

```
~/.codex/
├── config.toml          # Codex main configuration file (TOML format)
├── auth.json            # Authentication information
├── AGENTS.md            # AI agent configuration and system prompts
├── skills/              # Codex skills installed by ZCF
│   ├── zcf-six-step/
│   │   └── SKILL.md     # Six-stage workflow
│   ├── zcf-git-commit/
│   │   └── SKILL.md
│   └── ...
└── backup/              # Configuration backup directory
    └── YYYY-MM-DD_HH-mm-ss/
```

### Backup Mechanism

ZCF provides a complete backup mechanism:

- **Automatic Backup**: Automatically creates timestamped backups on each configuration modification
- **Backup Location**: `~/.codex/backup/YYYY-MM-DD_HH-mm-ss/`
- **Backup Content**: Includes configuration files, authentication, system prompt, and ZCF-managed workflow skills
- **Selective Backup**: Supports backing up only specific items (config, auth, API, MCP, etc.)

> 💡 **Restore Configuration**: If you need to restore previous configuration, you can restore corresponding files from the backup directory.

### Management Mode Identifier

ZCF adds `managed = true` identifier in configuration files to ensure:

- Automatically determine if configuration is managed by ZCF
- Avoid overwriting handwritten configurations
- Intelligently merge ZCF-managed configurations and user custom configurations

## API Providers and Models

### API Configuration Methods

Codex supports the same API configuration methods as Claude Code:

#### 1. Provider Preset (Recommended)

```bash
# Use 302.AI provider
npx @benbenwu/zcf i -s -T codex -p 302ai -k "sk-xxx"

# Use other providers
npx @benbenwu/zcf i -s -T codex -p glm -k "sk-xxx"
npx @benbenwu/zcf i -s -T codex -p minimax -k "sk-xxx"
```

#### 2. Official Login

```bash
npx @benbenwu/zcf
# Select S (Switch to Codex)
# Select 3 (Configure API)
# Select "Use Official Login"
```

#### 3. Custom API

```bash
npx @benbenwu/zcf i -s -T codex \
  --api-type api_key \
  --api-key "sk-xxx" \
  --api-url "https://api.example.com" \
  --api-model "gpt-5"
```

### Multi-Provider Configuration

Codex supports configuring multiple API providers:

```bash
npx @benbenwu/zcf i -s -T codex --api-configs '[
  {"provider":"302ai","key":"sk-xxx","default":true},
  {"name":"custom","type":"api_key","key":"sk-yyy","url":"https://custom.api.com","primaryModel":"gpt-5"}
]'
```

> 📖 **Switch Provider**: Use `npx @benbenwu/zcf config-switch -T codex` to switch between multiple providers.

### Model Configuration

Codex supports configuring primary and fast models:

```bash
npx @benbenwu/zcf i -s -T codex -p 302ai -k "sk-xxx" \
  --api-model "gpt-5" \
  --api-fast-model "gpt-4"
```

## MCP Service Integration

### Supported MCP Services

Codex supports the same MCP services as Claude Code:

| Service | Description | Requires API Key |
|------|------|-----------------|
| Context7 | Document query | ❌ |
| Open Web Search | Web search | ❌ |
| Spec Workflow | Workflow management | ❌ |
| DeepWiki | GitHub documentation | ❌ |
| Playwright | Browser control | ❌ |
| Exa | Exa search | ✅ |
| Serena | Semantic code search | ❌ |

### Configure MCP Services

```bash
# Install all MCP services
npx @benbenwu/zcf i -s -T codex --mcp-services all

# Selective installation
npx @benbenwu/zcf i -s -T codex --mcp-services context7,open-websearch

# Configure through menu
npx @benbenwu/zcf → Select S (Switch to Codex) → Select 4 (Configure MCP)
```

### Configuration File Location

MCP service configuration is saved in the `[mcp_servers]` entries of `~/.codex/config.toml`.

For Codex, ZCF also applies two extra compatibility safeguards to avoid common first-run startup failures:

- **Spec Workflow**: automatically writes an absolute `SPEC_WORKFLOW_HOME` path and raises `startup_timeout_sec` to `90`
- **Serena**: detects or installs `uv` and `serena-agent`, runs `serena init` when needed, then writes the resolved absolute `serena` executable path into the Codex config

A typical generated config looks like this:

```toml
[mcp_servers."spec-workflow"]
command = "npx"
args = ["-y", "@pimzino/spec-workflow-mcp@latest"]
env = { SPEC_WORKFLOW_HOME = "/home/you/.codex/memories/spec-workflow" }
startup_timeout_sec = 90

[mcp_servers.serena]
command = "/home/you/.local/bin/serena"
args = ["start-mcp-server", "--context=codex", "--project-from-cwd", "--enable-web-dashboard", "false"]
```

## Workflow System

Codex currently supports the following workflow templates, invoked via `skills` after installation:

| Workflow | Codex Command | Claude Code Command | Description |
|--------|-----------|-----------------|------|
| **Six-Stage Workflow** | `$zcf-six-step <task-description>` | `/zcf:workflow` | Complete six-stage development process (Research→Ideation→Planning→Execution→Optimization→Review) |
| **Git Workflow** | `$zcf-git-commit [args]` | `/git-commit` | Smart Git commit |
| | `$zcf-git-rollback [args]` | `/git-rollback` | Safe rollback |
| | `$zcf-git-clean-branches [args]` | `/git-cleanBranches` | Clean merged branches |
| | `$zcf-git-worktree [args]` | `/git-worktree` | Git worktree management |

> 💡 **Tip**:
> - Type `/skills` first if you want to inspect installed skills
> - ZCF installs workflows into `~/.codex/skills/zcf-*`, not the legacy `~/.codex/prompts/`
> - Codex currently only supports six-stage workflow and Git workflows. Feature development workflow (feat), project initialization (init-project), and BMad workflow are not yet available in Codex

### Differences from Claude Code

Although Codex and Claude Code share the same MCP services, there are differences in workflow support:

| Workflow Type | Claude Code | Codex |
|-----------|------------|-------|
| Six-Stage Workflow | ✅ `/zcf:workflow` | ✅ `$zcf-six-step` |
| Feature Development Workflow | ✅ `/zcf:feat` | ❌ Not yet supported |
| Project Initialization | ✅ `/init-project` | ❌ Not yet supported |
| Git Workflow | ✅ `/git-commit` etc. | ✅ `$zcf-git-commit` etc. |
| BMad Workflow | ✅ `/bmad-init` | ❌ Not yet supported |

### Import Workflows

```bash
# Install all workflows
npx @benbenwu/zcf i -s -T codex --workflows all

# Selective installation
npx @benbenwu/zcf i -s -T codex --workflows commonTools,sixStepsWorkflow

# Import through menu
npx @benbenwu/zcf → Select S (Switch to Codex) → Select 4 (Import Workflows)
```

Workflow skills are saved in the `~/.codex/skills/zcf-*` directories.

## System Prompts and Output Styles

### System Prompt Configuration

Codex system prompts are saved in `~/.codex/AGENTS.md`, including:

- AI output language settings
- Global output style configuration
- Custom instructions and rules

### Output Styles

Codex supports the same output styles as Claude Code:

- `engineer-professional` - Professional Engineer
- `nekomata-engineer` - Nekomata Engineer
- `laowang-engineer` - Laowang Aggressive Tech Flow
- `ojousama-engineer` - Ojousama Engineer

```bash
# Install output styles
npx @benbenwu/zcf i -s -T codex --output-styles engineer-professional

# Set default output style
npx @benbenwu/zcf i -s -T codex --default-output-style engineer-professional
```

## Tool Switching

### Switch Through Menu

```bash
npx @benbenwu/zcf
# Enter S to switch between Claude Code and Codex
```

After switching, menu options will dynamically adjust based on current tool:

- **In Codex mode**:
  - `3` is API and MCP configuration
  - `4` is workflow import

### Tool Migration

ZCF allows seamless switching between Claude Code and Codex while preserving your preference settings and workflow configurations:

- **Shared Configuration**: Both tools share the same MCP services and workflow templates
- **Independent Configuration**: API configuration and system prompts are managed independently
- **Consistent Experience**: Ensures consistent development experience across both tools

> 💡 **Best Practices**:
> - On first use, it's recommended to complete configuration in Claude Code first
> - Then switch to Codex, configurations will automatically sync MCP and workflows
> - Both tools can be used simultaneously without interference

## Common Operations

### Initialize Codex

```bash
# Command line method
npx @benbenwu/zcf i -s -T codex -p 302ai -k "sk-xxx"

# Interactive method
npx @benbenwu/zcf → Select S (Switch to Codex) → Select 1 (Complete Initialization)
```

### Update Workflows

```bash
npx @benbenwu/zcf update -T codex -g zh-CN
```

### Configuration Switch

```bash
# List all providers
npx @benbenwu/zcf config-switch -T codex --list

# Switch to specified provider
npx @benbenwu/zcf config-switch -T codex provider-name
```

### Uninstall Codex

```bash
npx @benbenwu/zcf uninstall -T codex
```

## Comparison with Claude Code

| Feature | Claude Code | Codex |
|------|------------|-------|
| **Configuration File Format** | JSON (`settings.json`) | TOML (`config.toml`) |
| **System Prompt File** | `CLAUDE.md` | `AGENTS.md` |
| **Workflow Directory** | `workflows/` | `prompts/` |
| **API Configuration** | Supports three modes | Supports three modes |
| **MCP Services** | ✅ Fully supported | ✅ Fully supported |
| **Output Styles** | ✅ Supported | ✅ Supported |
| **Workflow Templates** | ✅ Supported | ✅ Supported |

> 💡 **Note**: Although configuration file formats differ, ZCF provides a unified configuration interface, ensuring consistent user experience across both tools.

## Next Steps

Learn more about Codex related features:

- 📚 [Workflow Details](../workflows/) - Learn about workflows available in Codex
- 🔧 [Configuration Management](../advanced/configuration.md) - Deep dive into Codex configuration management
- 🎯 [MCP Service Integration](mcp.md) - Detailed information about MCP service usage in Codex
