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
   <a href="README.md">English</a> | <a href="README_zh-CN.md">中文</a> | <b>日本語</b> | <a href="CHANGELOG.md">更新履歴</a>

**✨ 完全ドキュメント**: [ドキュメント入口](https://zcf.ufomiao.com/ja-JP/)

> ゼロ設定、ワンクリックで Claude Code & Codex 環境セットアップ - 多言語設定、インテリジェントプロキシシステム、パーソナライズされたAIアシスタント対応
  </p>
</div>

## 🚀 クイックスタート

- 推奨：`npx @benbenwu/zcf` でインタラクティブメニューを開き、必要な操作を選択。
- よく使うコマンド：

```bash
npx @benbenwu/zcf i        # フル初期化：インストール + ワークフロー + API/CCR + MCP
npx @benbenwu/zcf u        # ワークフローのみ更新
npx @benbenwu/zcf --lang ja  # インターフェース言語を切り替え（例）
```

- 非対話例（プロバイダープリセット）：

```bash
npx @benbenwu/zcf i -s -p 302ai -k "sk-xxx"
```

より詳しい使い方・オプション・ワークフローはドキュメントを参照してください。

## 📦 npm への公開

`npx @benbenwu/zcf` で現在のローカル変更を反映させたい場合は、新しい npm バージョンを公開する必要があります。同じバージョン番号の再公開はできません。

このリポジトリで推奨する公開フロー:

```bash
# 1. changeset を作成し、バージョン更新種別を選ぶ
pnpm changeset

# 2. バージョン変更を適用する
pnpm changeset version

# 3. 公開前の検証を実行する
pnpm lint
pnpm typecheck
pnpm test:run
pnpm build

# 4. 必要なら npm にログインする
npm login

# 5. リポジトリの公開スクリプトで公開する
pnpm release
```

注意:

- `package.json` では `"publishConfig": { "access": "public" }` が設定されているため、`pnpm release` / `changeset publish` は public パッケージとして公開されます。
- npm アカウントが passkey / WebAuthn を使っているのに、`changeset publish` がまだ `one-time password` を要求する場合は、まずこのプロジェクトで使われている `@changesets/cli` が `2.30.0` 以上か確認してください。

```bash
pnpm exec changeset --version
pnpm list @changesets/cli
```

- 古い Changesets は OTP を自前で処理しており、npm の新しい web-based auth フローを利用できません。この問題に当たった場合は Changesets を更新し、web auth で再ログインしてください。

```bash
pnpm add -D @changesets/cli@latest
npm login --auth-type=web
pnpm release
```

- このリポジトリはすでに `@changesets/cli@^2.30.0` を宣言しており、OTP / web auth の処理をパッケージマネージャー側へ委譲する系列を使っています。
- `pnpm changeset version` と `pnpm build` 実行後であれば、`pnpm publish --access public` を一時的な代替手段として使うこともできますが、このリポジトリの主フローは `pnpm release` です。

## 📖 完全ドキュメント

- https://zcf.ufomiao.com/ja-JP/

## 💬 コミュニティ

Telegramグループに参加して、サポートやディスカッション、アップデート情報を入手しましょう：

[![Telegram](https://img.shields.io/badge/Telegram-参加-blue?style=flat&logo=telegram)](https://t.me/ufomiao_zcf)

## 🙏 謝辞

本プロジェクトは以下のオープンソースプロジェクトからインスピレーションを受け、さまざまな要素を取り入れています：

- [LINUX DO - 新たな理想郷コミュニティ](https://linux.do)
- [CCR](https://github.com/musistudio/claude-code-router)
- [CCometixLine](https://github.com/Haleclipse/CCometixLine)
- [ccusage](https://github.com/ryoppippi/ccusage)
- [BMad Method](https://github.com/bmad-code-org/BMAD-METHOD)

これらのコミュニティ貢献者のシェアに感謝します！


## 📄 ライセンス

[MITライセンス](LICENSE)

---

## 🚀 コントリビューター

<a href="https://github.com/UfoMiao/zcf/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=UfoMiao/zcf" />
</a>
<br /><br />

## ⭐️ スター履歴

このプロジェクトが役立った場合は、⭐️ Starをお願いします！

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
