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
    <a href="README.md">English</a> | <b>中文</b> | <a href="README_ja-JP.md">日本語</a> | <a href="CHANGELOG.md">更新日志</a>

**✨ 完整文档**: [文档入口](https://zcf.ufomiao.com/zh-CN/)

> 零配置,一键搞定 Claude Code & Codex 环境设置 - 支持中英文双语配置、智能代理系统和个性化 AI 助手
  </p>
</div>

## ♥️ 赞助商

[![GLM](./src/assets/GLM.png)](https://www.bigmodel.cn/claude-code?ic=RRVJPB5SII)
本项目由 Z智谱 提供赞助, 他们通过 GLM CODING PLAN 对本项目提供技术支持。

GLM CODING PLAN 是专为AI编码打造的订阅套餐，每月最低仅需20元，即可在十余款主流AI编码工具如 Claude Code、Cline、Roo Code 中畅享智谱旗舰模型GLM-4.7（受限于算力，GLM-5 目前仅限Pro用户开放），为开发者提供顶尖的编码体验。

智谱AI为本产品提供了特别优惠，使用以下链接购买可以享受九折优惠：https://www.bigmodel.cn/claude-code?ic=RRVJPB5SII

---

[![302.ai](./src/assets/302.ai.jpg)](https://share.302.ai/gAT9VG)
[302.AI](https://share.302.ai/gAT9VG) 是一个按用量付费的企业级AI资源平台，提供市场上最新、最全面的AI模型和API，以及多种开箱即用的在线AI应用。

---

<table>
<tbody>
<tr>
<td width="180"><a href="https://www.packyapi.com/register?aff=zcf"><img src="./src/assets/packycode.png" alt="PackyCode" width="150"></a></td>
<td>感谢 PackyCode 赞助了本项目！PackyCode 是一家稳定、高效的API中转服务商，提供 Claude Code、Codex、Gemini 等多种中转服务。PackyCode 为本软件的用户提供了特别优惠，使用<a href="https://www.packyapi.com/register?aff=zcf">此链接</a>注册并在充值时填写"zcf"优惠码，可以享受9折优惠。</td>
</tr>
<tr>
<td width="180"><a href="https://www.aicodemirror.com/register?invitecode=ZCFZCF"><img src="./src/assets/AICodeMirror.jpg" alt="AICodeMirror" width="150"></a></td>
<td>感谢 AICodeMirror 赞助了本项目！AICodeMirror 提供 Claude Code/Codex/Gemini CLI 官方高稳定中转服务，支持企业级高并发、极速开票、7x24专属技术支持。Claude Code/Codex/Gemini 官方渠道低至 3.8/0.2/10.9 折，充值更有折上折！AICodeMirror 为 ZCF 的用户提供了特别福利，通过<a href="https://www.aicodemirror.com/register?invitecode=ZCFZCF">此链接</a>注册的用户，可享受首充8折，企业客户最高可享 7.5折！</td>
</tr>
<tr>
<td width="180"><a href="https://crazyrouter.com/?utm_source=github&utm_medium=sponsor&utm_campaign=zcf&aff=yJFo"><img src="./src/assets/crazyrouter.svg" alt="Crazyrouter" width="150"></a></td>
<td>感谢 Crazyrouter 赞助了本项目！Crazyrouter 是一个高性能 AI API 聚合网关 — 一个 Key 调用 300+ 模型（GPT、Claude、Gemini、DeepSeek 等），所有模型低至官方价格 5.5 折，支持自动故障转移、智能路由和无限并发。完全兼容 OpenAI 格式，可无缝接入 Claude Code、Codex 和 Gemini CLI。Crazyrouter 为 ZCF 用户提供了专属福利，通过<a href="https://crazyrouter.com/?utm_source=github&utm_medium=sponsor&utm_campaign=zcf&aff=yJFo">此链接</a>注册即送 $2 免费额度！</td>
</tr>
</tbody>
</table>

## 🚀 快速开始

- 推荐：`npx @benbenwu/zcf` 打开交互式菜单，按需选择。
- 常用命令：

```bash
npx @benbenwu/zcf i        # 完整初始化：安装 + 工作流 + API/CCR + MCP
npx @benbenwu/zcf u        # 仅更新工作流
npx @benbenwu/zcf --lang zh-CN  # 切换界面语言示例
npx @benbenwu/zcf i -s -T codex # 非交互完成 Codex 安装
```

- 无交互示例（预设提供商）：

```bash
npx @benbenwu/zcf i -s -p 302ai -k "sk-xxx"
```

- 本地开发验证请使用仓库内命令，而不是裸 `npx @benbenwu/zcf`。

### 本地仓库如何使用

如果你正在这个仓库里改代码，最重要的一点是：

- `npx @benbenwu/zcf` 调用的是 npm 上已发布版本，不会自动使用你当前仓库里的本地修改。
- 想直接运行你本地刚改过的源码，请优先使用 `pnpm dev -- ...`。

#### 1. 首次准备

```bash
pnpm install
```

#### 2. 最简单的本地用法

如果你不想记参数，直接打开本地交互式菜单：

```bash
pnpm dev --
```

这会直接运行 `src/cli.ts`，也就是你当前仓库里的最新源码。

#### 3. 本地安装 Codex，仍然走交互式流程

如果你只是想明确指定目标是 Codex，但其它选项仍然通过菜单选择：

```bash
pnpm dev -- i -T codex
```

这个命令的意思是：

- `pnpm dev --`：运行本地源码入口
- `i`：执行 `init`，也就是完整初始化
- `-T codex`：目标工具指定为 Codex

#### 4. 本地非交互安装 Codex

如果你想一次性跑完，适合脚本化或重复验证：

```bash
pnpm dev -- i -s -T codex -p 302ai -k "sk-xxx"
```

这个命令的意思是：

- `i`：完整初始化
- `-s` / `--skip-prompt`：跳过交互式提问
- `-T codex`：安装目标是 Codex
- `-p 302ai` / `--provider 302ai`：使用内置提供商预设
- `-k "sk-xxx"` / `--api-key`：写入 API Key

#### 5. 只想更新 Codex 的 skills / 工作流

当你修改了模板或 Codex 安装逻辑，通常不需要重新走完整初始化，只更新即可：

```bash
pnpm dev -- u -T codex
```

#### 6. 想验证打包后的入口

如果你不是要验证源码，而是要验证“发布后用户实际执行的入口”，先构建，再跑打包产物：

```bash
pnpm build
pnpm start -- i -T codex

# 或者直接跑打包后的 bin 入口
node bin/zcf.mjs i -T codex
```

这里要注意：

- `pnpm start` 和 `node bin/zcf.mjs` 走的是 `dist/cli.mjs`
- 所以它们只会读取你最近一次 `pnpm build` 生成的内容
- 如果你刚改了 `src/` 但没重新 build，这两个命令不会体现最新改动

### 常用参数说明

下面这些参数是本地调试 Codex 时最常用的：

| 参数 | 含义 | 常见示例 |
| --- | --- | --- |
| `i` / `init` | 完整初始化 | `pnpm dev -- i -T codex` |
| `u` / `update` | 更新工作流/模板 | `pnpm dev -- u -T codex` |
| `-T codex` | 指定目标工具为 Codex | `pnpm dev -- i -T codex` |
| `-s` | 跳过所有交互提问 | `pnpm dev -- i -s -T codex` |
| `-p <provider>` | 使用提供商预设 | `-p 302ai`、`-p glm` |
| `-k <key>` | API Key | `-k "sk-xxx"` |
| `-t <type>` | API 类型 | `-t api_key`、`-t auth_token`、`-t ccr_proxy`、`-t skip` |
| `-u <url>` | 自定义 API 地址 | `-u "https://api.example.com/v1"` |
| `-w <list>` | 只安装指定工作流 | `-w sixStepsWorkflow,gitWorkflow` |
| `-m <list>` | 只安装指定 MCP 服务 | `-m context7,exa` |
| `-g <lang>` | 一次性设置全部语言参数 | `-g zh-CN` 或 `-g en` |
| `-l <lang>` | 设置 ZCF 界面语言 | `-l zh-CN` |

### 更简单的使用方法

如果你的目标只是“先用起来”，不需要一次把所有参数记住，可以按下面三档来选：

#### 方案 A：最省心

```bash
pnpm dev --
```

适合：

- 正在本地开发
- 想确保一定走本地源码
- 不想记参数

#### 方案 B：只指定 Codex，其它都交互选择

```bash
pnpm dev -- i -T codex
```

适合：

- 明确要测 Codex
- 但 provider、MCP、workflow 想现场选

#### 方案 C：完全脚本化

```bash
pnpm dev -- i -s -T codex -p 302ai -k "sk-xxx"
```

适合：

- 重复验证安装结果
- 写 CI / 自动化脚本
- 快速回归测试

#### 查看完整帮助

```bash
pnpm dev -- --help
pnpm dev -- init --help
pnpm dev -- update --help
```

更多用法、参数与工作流说明请查看文档。

## 📦 发布到 npm

如果你希望 `npx @benbenwu/zcf` 获取到你当前仓库里的改动，就必须发布一个新的 npm 版本；同一版本号不能重复发布。

推荐使用本仓库的发布流程：

```bash
# 1. 创建 changeset，并选择版本升级类型
pnpm changeset

# 2. 应用版本变更
pnpm changeset version

# 3. 执行发布前校验
pnpm lint
pnpm typecheck
pnpm test:run
pnpm build

# 4. 如有需要，登录 npm
npm login

# 5. 使用仓库脚本发布
pnpm release
```

注意：

- `package.json` 已设置 `"publishConfig": { "access": "public" }`，因此 `pnpm release` / `changeset publish` 默认会以 public 包发布。
- 如果你的 npm 账号使用的是 passkey / WebAuthn，而 `changeset publish` 仍然提示输入 `one-time password`，先检查当前项目实际使用的 `@changesets/cli` 版本是否为 `2.30.0` 或更高：

```bash
pnpm exec changeset --version
pnpm list @changesets/cli
```

- 较旧版本的 Changesets 会在自身进程里处理 OTP，只支持旧式 OTP 流程，无法走 npm 新的网页认证链路；遇到这种情况，请升级 Changesets，并重新使用 web auth 登录：

```bash
pnpm add -D @changesets/cli@latest
npm login --auth-type=web
pnpm release
```

- 当前仓库已经声明 `@changesets/cli@^2.30.0`，这是开始把 OTP / web auth 交还给包管理器原生处理的版本线。
- 如果你已经执行过 `pnpm changeset version` 与 `pnpm build`，也可以把 `pnpm publish --access public` 作为手动兜底方案，但它不是本仓库的主流程。

## 📖 完整文档

- https://zcf.ufomiao.com/zh-CN/

## 💬 社区

加入我们的 Telegram 群组，获取支持、参与讨论和接收更新：

[![Telegram](https://img.shields.io/badge/Telegram-加入群组-blue?style=flat&logo=telegram)](https://t.me/ufomiao_zcf)

## 🙏 鸣谢

本项目的灵感来源和引入的开源项目：

- [LINUX DO - 新的理想型社区](https://linux.do)
- [CCR](https://github.com/musistudio/claude-code-router)
- [CCometixLine](https://github.com/Haleclipse/CCometixLine)
- [ccusage](https://github.com/ryoppippi/ccusage)
- [BMad Method](https://github.com/bmad-code-org/BMAD-METHOD)

  感谢这些社区贡献者的分享！


## ❤️ 支持与赞助

如果您觉得这个项目有帮助，请考虑赞助它的开发。非常感谢您的支持！

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/UfoMiao)

<table>
  <tr>
    <td><img src="/src/assets/alipay.webp" width="200" alt="Alipay" /></td>
    <td><img src="/src/assets/wechat.webp" width="200" alt="WeChat Pay" /></td>
  </tr>
</table>

### 我们的赞助商

非常感谢所有赞助商的慷慨支持！

【企业赞助商】

- [302.AI](https://share.302.ai/gAT9VG) （第一个企业赞助商 🤠）
- [GLM](https://www.bigmodel.cn/claude-code?ic=RRVJPB5SII) （第一个 AI 模型赞助商 🤖）
- [PackyCode](https://www.packyapi.com/register?aff=zcf) （第一个 API 中转服务商赞助商 🧝🏻‍♀️）
- [AICodeMirror](https://www.aicodemirror.com/register?invitecode=ZCFZCF) （官方高稳定中转服务赞助商 🪞）
- [UUCode](https://www.uucode.org/auth?ref=JQ2DJ1T8)（赞助了 100$ 中转站额度 💰）
- [Crazyrouter](https://crazyrouter.com/?utm_source=github&utm_medium=sponsor&utm_campaign=zcf&aff=yJFo)（AI API 聚合网关赞助商 🚀）

【个人赞助商】

- Tc (第一个赞助者 1️⃣)
- Argolinhas (第一个 ko-fi 赞助者 ٩(•̤̀ᵕ•̤́๑))
- r\*r (第一个不愿透露姓名的赞助者 🤣)
- \*\*康 (第一个 KFC 赞助者 🍗)
- \*东 (第一个咖啡赞助者 ☕️)
- 炼\*3 (第一个 termux 用户赞助者 📱)
- [chamo101](https://github.com/chamo101) (第一个 GitHub issue 赞助者 🎉)
- 初屿贤 (第一个 codex 用户赞助者 🙅🏻‍♂️)
- Protein (第一个一路发发赞助者 😏)
- [musistudio](https://github.com/musistudio) (第一个开源项目作者赞助者，[CCR](https://github.com/musistudio/claude-code-router) 的作者哦 🤩)
- \*年 (第一个百元赞助者 💴)
- [BeatSeat](https://github.com/BeatSeat) (社区大佬 😎，提供了 $1000 Claude 额度)
- [wenwen](https://github.com/wenwen12345) (社区大佬 🤓，提供了每日 $100 Claude&GPT 额度)
- 16°C 咖啡 (我的好基友 🤪, 提供了 ChatGPT Pro $200 套餐)

### 推广感谢

感谢以下推广本项目的作者：

- 逛逛 GitHub，推文：https://mp.weixin.qq.com/s/phqwSRb16MKCHHVozTFeiQ
- Geek，推文：https://x.com/geekbb/status/1955174718618866076

## 📄 许可证

[MIT License](LICENSE)

---

## 🚀 贡献者

<a href="https://github.com/UfoMiao/zcf/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=UfoMiao/zcf" />
</a>
<br /><br />

## ⭐️ Star 历史

如果这个项目对你有帮助，请给我一个 ⭐️ Star！
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
