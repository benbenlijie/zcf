---
title: トラブルシューティング
---

# トラブルシューティング

ZCF 利用時によく遭遇する問題と解決策を簡潔にまとめました。詳細な手順は各セクションのコマンドを順に実行してください。

## 主なカテゴリ

- [初期化](#初期化)
- [API 設定](#api-設定)
- [ワークフロー](#ワークフロー)
- [公開時の問題](#公開時の問題)
- [MCP サービス](#mcp-サービス)
- [Codex 関連](#codex-関連)
- [CCR 関連](#ccr-関連)
- [設定/バックアップ](#設定バックアップ)
- [プラットフォーム別](#プラットフォーム別)

## 初期化

### 初期化が失敗・停止する

原因：Node.js 22 未満、権限不足、ネットワーク不安定、MCP インストールで停止。  
対処：

```bash
node --version                # 22 以上を確認
mkdir -p ~/.claude ~/.codex ~/.ufomiao/zcf && chmod 755 ~/.claude ~/.codex ~/.ufomiao/zcf
npx @benbenwu/zcf init -s -m skip       # MCP をスキップして確認
ping npmjs.com                # ネットワーク確認
```

### 初期化が途中で中断した

```bash
rm -rf ~/.claude/backup/latest
ls -la ~/.claude/backup/       # 直近バックアップがあれば復元
npx @benbenwu/zcf init --config-action backup
```

## API 設定

### API が効かない

```bash
cat ~/.claude/settings.json | jq .env
cat ~/.codex/config.toml | grep -A5 apiKey
npx @benbenwu/zcf init -s -t api_key -k "YOUR_KEY"
npx @benbenwu/zcf ccr status && npx @benbenwu/zcf ccr start   # CCR 利用時
```

### API Key フォーマットエラー

プロバイダーの要求を確認（例：302.ai は `sk-` で始まる）。Proxy を使う場合は `baseUrl` と `model` の対応を確認。

## ワークフロー

### コマンドが見つからない

ワークフロー未導入の可能性。`npx @benbenwu/zcf` → 2 で再インポート、または `npx @benbenwu/zcf init -s --workflows all`。

### ワークフロー結果が不完全

- 仕様を明文化し、必要な入力ファイルやサンプルを添付
- 必要に応じ `/git-worktree` で複数案を並列生成し比較

## 公開時の問題

### `changeset publish` が `one-time password` を要求し続けるが、npm の web auth は正常に動いている

**症状**：`npm whoami` は正常、`npm login --auth-type=web` も成功するのに、`pnpm release` / `changeset publish` では従来の OTP コード入力を求められる。

**考えられる原因**：

- npm アカウントが `auth-and-writes` で保護されており、公開時に第二要素認証が必要。
- 古い `@changesets/cli` はレガシー OTP フローしか扱えず、パッケージマネージャーの native web auth に委譲しない。

**解決策**：

```bash
# 1. プロジェクトで実際に使われている Changesets のバージョンを確認
pnpm exec changeset --version
pnpm list @changesets/cli

# 2. 2.30.0 未満なら Changesets を更新
pnpm add -D @changesets/cli@latest

# 3. 必要なら npm の web auth で再ログイン
npm login --auth-type=web

# 4. リポジトリの公開スクリプトを再実行
pnpm release
```

**補足**：

- `@changesets/cli@2.30.0` は OTP の入力処理をパッケージマネージャーへ戻した最初の系列で、npm の passkey / WebAuthn web auth を利用できます。
- このリポジトリの `release` スクリプトは `pnpm build && changeset publish` なので、npm CLI 側の web auth が正常でも公開時だけ OTP で止まるなら、最初に `@changesets/cli` を確認してください。
- `pnpm changeset version` と `pnpm build` 実行後なら、`pnpm publish --access public` を一時的な回避策として試せますが、主フローは `pnpm release` のままにしてください。

## MCP サービス

### 接続できない / 未接続表示

```bash
npx @benbenwu/zcf                        # 4 を選び MCP を再設定
cat ~/.claude/settings.json | jq .mcpServers
npx @benbenwu/zcf init -s -m skip        # ネットワーク問題が疑われる場合に切り分け
```

### API Key 必須サービスのエラー

`EXA_API_KEY` など環境変数を設定し、新しいターミナルで再読み込み：

```bash
echo $EXA_API_KEY
export EXA_API_KEY="your-key"
```

### Windows で起動しない

`npx @benbenwu/zcf` → 4 を再実行するとパス表記を自動修正。必要に応じて `cmd /c npx ...` 形式で設定されます。

## Codex 関連

- Codex モードでメニューが出ない：`npx @benbenwu/zcf init -T codex` を再実行  
- MCP/ワークフローが効かない：`~/.codex/config.toml` に設定があるか確認し、`npx @benbenwu/zcf init -T codex -s` を再適用

## CCR 関連

```bash
npx @benbenwu/zcf ccr status   # 状態確認
npx @benbenwu/zcf ccr start    # 起動
npx @benbenwu/zcf ccr stop     # 停止
```

ポート競合時は `config.toml` の `proxy.port` を変更。

## 設定/バックアップ

- 設定が壊れたら `~/.claude/backup/` または `~/.codex/backup/` から復元  
- マルチ設定を使っている場合：`npx @benbenwu/zcf config-switch --list` で対象を確認
- バックアップが肥大化したら `npx @benbenwu/zcf uninstall --mode custom --items backups` でクリーンアップ

## プラットフォーム別

- **Windows**：PowerShell で `New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\\.claude"` を実行して権限を修正。  
- **WSL**：`/mnt` 経由のパスでの権限に注意。  
- **Termux/サーバー**：`--skip-prompt` と設定ファイルを組み合わせて非対話初期化を使う。  
- **プロキシ環境**：`HTTPS_PROXY`/`HTTP_PROXY` を設定後、`npx @benbenwu/zcf init -s -m skip` でまず本体のみ検証。

## それでも解決しない場合

1. `npx @benbenwu/zcf init --verbose 2>&1 | tee zcf.log` でログを取得  
2. `cat zcf.log | grep -i error` でエラーを抽出  
3. 使用したコマンド・OS・Node.js バージョン・ログを添えて issue を起票してください。
