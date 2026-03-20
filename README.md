# Pokemon Data API

本編シリーズおよび Pokémon GO のデータを管理・提供する個人用 Web API 基盤。

## 構成

```
pokemon/
├── apps/
│   ├── api/      # Cloudflare Workers + Hono による REST API
│   └── web/      # TanStack Start + React によるダッシュボード
├── data/         # JSON データファイル（OSS 管理）
└── scripts/      # データ検証・インデックス生成スクリプト
```

## セットアップ

```bash
npm install
```

## 開発

```bash
# API（Cloudflare Workers ローカル）
npm run dev

# Web（ポート 3000）
npm run dev:web
```

Web の `.env.local` に API URL を設定:

```
VITE_API_URL=http://localhost:8787
```

## コマンド一覧

| コマンド | 内容 |
|---|---|
| `npm run dev` | API ローカルサーバー起動 |
| `npm run dev:web` | Web ローカルサーバー起動 |
| `npm run validate` | データ検証（Zod） |
| `npm run build:index` | `data/_index/` を再生成 |
| `npm run build:web` | Web プロダクションビルド |

## データ構造

```
data/
├── _index/           # CI 自動生成・軽量インデックス
├── core/
│   ├── pokemons/     # 基本種族情報（1 ポケモン 1 ファイル）
│   ├── forms/        # 全フォルム + stats
│   └── abilities/    # 特性
├── mainline/
│   ├── games.json    # ゲームソフト一覧
│   ├── moves/        # 技
│   ├── learnsets/    # 技習得方法
│   └── availability/ # ゲーム別出現情報
└── go/
    ├── forms/        # GO フォーム別ステータス・技構成
    ├── costumes/     # GO 限定コスチューム
    └── moves/        # GO 技
```

ファイル名はゼロ埋め 4 桁（例: `0006.json`）。

## API エンドポイント

```
GET /pokemon                  # 一覧
GET /pokemon/:id              # 詳細（図鑑番号 or identifier）
GET /pokemon/:id/moves        # 覚える技
GET /pokemon/:id/availability # 出現ゲーム
GET /moves                    # 技一覧
GET /moves/:id                # 技詳細
GET /games                    # ゲーム一覧
GET /games/:id/pokemon        # そのゲームに出現するポケモン
GET /abilities                # 特性一覧
GET /abilities/:id            # 特性詳細
GET /go/pokemon               # GO ポケモン一覧
GET /go/pokemon/:id           # GO ポケモン詳細
GET /go/pokemon/:id/costumes  # GO コスチューム
GET /go/moves                 # GO 技一覧
GET /go/moves/:id             # GO 技詳細
```

API ドキュメント（Scalar UI）: `/doc`

## CI/CD

| ワークフロー | トリガー | 内容 |
|---|---|---|
| `validate.yml` | PR（`data/`, `scripts/` 変更時） | データ検証 + インデックス差分チェック |
| `deploy-api.yml` | `main` push | インデックス再生成 → Cloudflare Workers デプロイ |
| `deploy-web.yml` | `main` push（`apps/web/` 変更時） | Web ビルド → Cloudflare Pages デプロイ |

## デプロイ

必要なシークレット（GitHub Actions）:

| シークレット | 内容 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API トークン |
| `VITE_API_URL` | 本番 API の URL（Web ビルド時に埋め込み） |

Cloudflare Workers の環境変数（Dashboard で設定）:

| 変数 | 内容 |
|---|---|
| `ALLOWED_ORIGIN` | CORS 許可オリジン（Web のドメイン） |

Cloudflare Pages の環境変数（任意）:

| 変数 | 内容 |
|---|---|
| `API_URL` | SSR 時の API URL（設定するとリビルド不要で変更可能） |
