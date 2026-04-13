[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Claude Code][claude-code-src]][claude-code-href]
[![codecov][codecov-src]][codecov-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![Ask DeepWiki][deepwiki-src]][deepwiki-href]

<div align="center">
  <img src="./src/assets/banner.webp" alt="Banner"/>

  <h1>
    ZCF - Zero-Config Code Flow
  </h1>

  <p align="center">
  <b>English</b> | <a href="README_zh-CN.md">中文</a> | <a href="README_ja-JP.md">日本語</a> | <a href="CHANGELOG.md">Changelog</a>

**✨ Full Documentation**: [ZCF Docs](https://zcf.ufomiao.com/)

> Zero-config, one-click setup for Claude Code & Codex with bilingual support, intelligent agent system and personalized AI assistant
</p>
</div>

## 🚀 Quick Start

- Recommended: `npx @benbenwu/zcf` opens the interactive menu — pick what you need.
- Common commands:

```bash
npx @benbenwu/zcf i        # Full initialization: install + workflows + API/CCR + MCP
npx @benbenwu/zcf u        # Update workflows only
npx @benbenwu/zcf --lang zh-CN  # Switch interface language (example)
npx @benbenwu/zcf i -s -T codex # Non-interactive Codex setup
```

- Non-interactive example (provider preset):

```bash
npx @benbenwu/zcf i -s -p 302ai -k "sk-xxx"
```

- For local development validation, use the repo entrypoints instead of bare `npx @benbenwu/zcf`:

```bash
pnpm dev -- i -s -T codex
pnpm start -- i -s -T codex
node bin/zcf.mjs i -s -T codex
```

Bare `npx @benbenwu/zcf` resolves the published npm package, so it will not automatically use your local repository changes.

## 📦 Release to npm

If you want `npx @benbenwu/zcf` to pick up your local changes, you must publish a new npm version. Republishing the same version is not allowed.

Recommended release flow for this repository:

```bash
# 1. Create a changeset and choose version bump type
pnpm changeset

# 2. Apply the version bump
pnpm changeset version

# 3. Run validation
pnpm lint
pnpm typecheck
pnpm test:run
pnpm build

# 4. Login to npm if needed
npm login

# 5. Publish using the repo release script
pnpm release
```

Notes:

- `package.json` already sets `"publishConfig": { "access": "public" }`, so `pnpm release` / `changeset publish` will publish as a public package.
- If your npm account uses passkeys / WebAuthn and `changeset publish` still asks for a `one-time password`, first verify the project is using `@changesets/cli@2.30.0` or newer:

```bash
pnpm exec changeset --version
pnpm list @changesets/cli
```

- Older Changesets releases handled OTP in-process and could not use npm's newer web-based authentication flow. If you hit that issue, upgrade Changesets and log in again with web auth:

```bash
pnpm add -D @changesets/cli@latest
npm login --auth-type=web
pnpm release
```

- This repository already declares `@changesets/cli@^2.30.0`, which is the first series that delegates OTP / web auth handling back to the package manager.
- `pnpm publish --access public` can still be used as a manual fallback after you run `pnpm changeset version` and `pnpm build`, but it is not the primary workflow in this repo.

More usage, options, and workflows: see documentation.

## 📖 Full Documentation

- https://zcf.ufomiao.com/

## 💬 Community

Join our Telegram group for support, discussions, and updates:

[![Telegram](https://img.shields.io/badge/Telegram-Join%20Chat-blue?style=flat&logo=telegram)](https://t.me/ufomiao_zcf)

## 🙏 Acknowledgments

This project is inspired by and incorporates work from:

- [LINUX DO - New Ideal Community](https://linux.do)
- [CCR](https://github.com/musistudio/claude-code-router)
- [CCometixLine](https://github.com/Haleclipse/CCometixLine)
- [ccusage](https://github.com/ryoppippi/ccusage)
- [BMad Method](https://github.com/bmad-code-org/BMAD-METHOD)

Thanks to these community contributors for sharing!

## 📄 License

[MIT License](LICENSE)

---

## 🚀 Contributors

<a href="https://github.com/UfoMiao/zcf/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=UfoMiao/zcf" />
</a>
<br /><br />

## ⭐️ Star History

If this project helps you, please give me a ⭐️ Star!

[![Star History Chart](https://api.star-history.com/svg?repos=UfoMiao/zcf&type=Date)](https://star-history.com/#UfoMiao/zcf&Date)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/%40benbenwu%2Fzcf?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/@benbenwu/zcf
[npm-downloads-src]: https://img.shields.io/npm/dm/%40benbenwu%2Fzcf?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/@benbenwu/zcf
[license-src]: https://img.shields.io/github/license/ufomiao/zcf.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/ufomiao/zcf/blob/main/LICENSE
[claude-code-src]: https://img.shields.io/badge/Claude-Code-1fa669?style=flat&colorA=080f12&colorB=1fa669
[claude-code-href]: https://claude.ai/code
[codecov-src]: https://codecov.io/gh/UfoMiao/zcf/graph/badge.svg?token=HZI6K4Y7D7&style=flat&colorA=080f12&colorB=1fa669
[codecov-href]: https://codecov.io/gh/UfoMiao/zcf
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-1fa669?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/zcf
[deepwiki-src]: https://img.shields.io/badge/Ask-DeepWiki-1fa669?style=flat&colorA=080f12&colorB=1fa669
[deepwiki-href]: https://deepwiki.com/UfoMiao/zcf
