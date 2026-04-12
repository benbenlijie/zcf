---
title: 貢献ガイド
---

# 貢献ガイド

ZCF にコントリビュートする際の手順と基準です。

## 開発環境

```bash
pnpm install
pnpm dev          # ウォッチ実行
pnpm lint
pnpm typecheck
pnpm test
```

Node.js 22+ を推奨。IDE の ESLint/TS 設定を有効にしてください。

## リリースと npm 公開

`npx @benbenwu/zcf` で利用者に変更を届けるには、新しい npm バージョンを公開する必要があります。同じバージョン番号は再公開できないため、先にバージョンを上げてください。

### 推奨フロー

このリポジトリでは `changeset` を使う前提です。

```bash
# 1. changeset を作成し、semver の上げ方を選ぶ
pnpm changeset

# 2. バージョンを反映
pnpm changeset version

# 3. 公開前の検証
pnpm lint
pnpm typecheck
pnpm test:run
pnpm build

# 4. 必要なら npm にログイン
npm login

# 5. npm に公開
pnpm release
```

### 補足

- `pnpm release` は `pnpm build && changeset publish` を実行します
- `package.json` には `publishConfig.access = "public"` があるため、通常は public パッケージとして公開されます
- npm アカウントが passkey / WebAuthn を使っているのに、`changeset publish` が従来の `one-time password` を要求する場合は、まずプロジェクトで使われている `@changesets/cli` が `2.30.0` 以上か確認してください

```bash
pnpm exec changeset --version
pnpm list @changesets/cli
```

- 古い Changesets はレガシー OTP フローしか扱えず、npm の web auth を正しく利用できません。このケースでは Changesets を更新し、web auth で再ログインしてからやり直してください

```bash
pnpm add -D @changesets/cli@latest
npm login --auth-type=web
pnpm release
```

- 詳しい切り分けは [トラブルシューティング - 公開時の問題](../advanced/troubleshooting.md#公開時の問題) を参照してください
- 手動で行う場合のフォールバックは次です

```bash
pnpm publish --access public
```

### 公開後の確認

```bash
npm view @benbenwu/zcf version
npx @benbenwu/zcf --version
```

## コーディング規約

- TypeScript ESM、2 スペース、シングルクォート  
- 変数/関数は camelCase、型/クラスは PascalCase  
- 副作用はエントリポイントのみに集約  
- できるだけ DRY/KISS/SOLID を守る

## 変更フロー

1. Issue またはディスカッションで方向性を共有  
2. ブランチを切り、作業内容に応じてテストを追加  
3. `pnpm lint && pnpm typecheck && pnpm test` を通す  
4. Conventional Commits でコミット（例：`feat(config): add provider preset`）  
5. PR では概要・検証手順を簡潔に記載し、関連 Issue をリンク

## テストとカバレッジ

- Vitest を使用。ユニットは `tests/unit/`、統合は `tests/integration/`。  
- 既存しきい値を下回らないこと。必要に応じ `:coverage` で確認。  
- テストヘルパー/フィクスチャは再利用し、重複を避ける。

## ドキュメント

- コマンドやテンプレートに変更があれば `docs/`（必要なら各言語）を更新  
- `src/i18n/` や `templates/` を触った場合は README/ドキュメントも同期  
- 追加した出力スタイルやワークフローは説明ページを挿入

## レビューのポイント

- 破壊的変更時は明示し、移行手順またはフォールバックを提示  
- エラーハンドリングとログ出力を入れる  
- 既存のバックアップ/設定マージロジックを壊していないか確認
