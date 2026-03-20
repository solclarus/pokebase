# Pokemon Data API 設計仕様書

## 目的

本編シリーズおよび Pokémon GO のデータを管理・提供する個人用 Web API 基盤。

- データは GitHub で OSS 管理（JSON）
- Cloudflare Workers + Hono
- モノレポ構成
- 読み取り専用 API
- 将来の DB 移行を考慮した Repository パターン

---

## Web UI 規約

- フレームワーク: **Next.js App Router**（`apps/web/src/app/`）
- デプロイ: **@opennextjs/cloudflare** → Cloudflare Pages（ビルド出力: `.open-next/`）
- コンポーネントは **shadcn/ui** を使用する（`vp dlx shadcn@latest add <component>`）
- 既存コンポーネント: `button`, `table`, `badge`（`apps/web/src/components/ui/`）
- shadcn で提供されていないものは `@base-ui/react` または Tailwind CSS で実装
- 環境変数: `NEXT_PUBLIC_API_URL`（クライアント側 API URL）

---

## アーキテクチャ方針

- `core` / `mainline` / `go` の 3 レイヤーでデータを分離
- 1 ポケモン 1 ファイルを徹底（ファイル名はゼロ埋め 4 桁: `0006.json`）
- タイプはフォルムの `types` 配列で表現（独立ファイル不要）
- フォルム・stats は `core/forms/` で管理、本編 stats も同ファイルに統合
- GO 限定コスチュームは `go/costumes/` で独立管理
- エンドポイントは本編フラット・GO のみ `/go/` プレフィックス
- **moves / abilities の ID は PokeAPI 準拠**（https://pokeapi.co/）
- **games の ID は文字列識別子**（例: `scarlet`, `sword`）

---

## モノレポ構成

```
pokemon/
├── data/
│   ├── _index/                        # 自動生成（CI）・軽量一覧
│   │   ├── pokemons.json
│   │   ├── forms.json
│   │   ├── moves.json
│   │   ├── abilities.json
│   │   ├── go-pokemons.json
│   │   └── go-moves.json
│   │
│   ├── core/
│   │   ├── pokemons/
│   │   │   └── 0006.json              # 基本種族情報
│   │   ├── forms/
│   │   │   └── 0006.json              # 全フォルム + stats を内包
│   │   └── abilities/
│   │       └── 0065.json
│   │
│   ├── mainline/
│   │   ├── games.json                 # ゲームソフト一覧（単一ファイル）
│   │   ├── moves/
│   │   │   └── 0052.json
│   │   ├── learnsets/
│   │   │   └── 0006.json
│   │   └── availability/
│   │       └── 0006.json              # どのソフトで出現するか
│   │
│   └── go/
│       ├── forms/
│       │   └── 0006.json              # GO フォーム別ステータス・技構成
│       ├── costumes/
│       │   └── 0025.json              # GO 限定コスチューム（イベント衣装など）
│       └── moves/
│           └── 0001.json
│
├── packages/
│   ├── schemas/                       # Zod スキーマ（API・Web 共通）
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── pokemon.ts
│   │   │   ├── form.ts
│   │   │   ├── move.ts
│   │   │   ├── ability.ts
│   │   │   ├── availability.ts
│   │   │   ├── learnset.ts
│   │   │   ├── game.ts
│   │   │   ├── costume.ts
│   │   │   └── go.ts
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── scripts/
│       ├── validate.ts                # データ検証（Zod）
│       └── build-index.ts             # _index 自動生成
│
├── apps/
│   ├── api/                           # Cloudflare Workers + Hono
│   │   ├── src/
│   │   │   ├── index.ts               # Hono アプリ・ルート登録
│   │   │   ├── env.ts                 # Cloudflare Bindings 型
│   │   │   ├── context.ts             # Hono コンテキスト型
│   │   │   ├── repository/
│   │   │   │   ├── data-loader.ts     # DataLoader（ASSETS Fetcher ラッパー）
│   │   │   │   ├── pokemon.ts
│   │   │   │   ├── form.ts
│   │   │   │   ├── ability.ts
│   │   │   │   ├── availability.ts
│   │   │   │   ├── move.ts
│   │   │   │   ├── learnset.ts
│   │   │   │   ├── game.ts
│   │   │   │   └── go.ts              # GO pokemon / costume / move
│   │   │   ├── routes/
│   │   │   │   ├── pokemon.ts
│   │   │   │   ├── ability.ts
│   │   │   │   ├── move.ts
│   │   │   │   ├── game.ts
│   │   │   │   └── go.ts
│   │   │   └── service/
│   │   │       ├── pokemon.ts         # core + mainline を結合
│   │   │       └── go.ts
│   │   ├── wrangler.toml
│   │   └── package.json
│   │
│   └── web/                           # Next.js App Router
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx
│       │   │   └── pokemon/
│       │   │       ├── page.tsx
│       │   │       ├── pokemon-table.tsx
│       │   │       └── [id]/page.tsx
│       │   ├── components/
│       │   │   └── ui/                # shadcn/ui コンポーネント
│       │   └── lib/
│       │       ├── api.ts             # getApiUrl()（SSR/クライアント両対応）
│       │       └── utils.ts
│       ├── next.config.ts
│       ├── open-next.config.ts
│       └── package.json
│
├── .vite-hooks/                       # Git フック（vp config で管理）
│   ├── pre-commit                     # vp staged（ステージ済みファイルを lint）
│   └── pre-push                       # vp check（format + lint + 型チェック）
│
└── .github/
    └── workflows/
        ├── validate.yml               # PR 時にデータ検証
        ├── deploy-api.yml             # main push 時に API デプロイ
        └── deploy-web.yml             # apps/web/ または packages/schemas/ 変更時に Web デプロイ
```

---

## データ設計

### core/pokemons/0006.json

種族の基本情報のみ。`category` で分類。

```json
{
  "id": 6,
  "identifier": "charizard",
  "name": { "ja": "リザードン", "en": "Charizard" },
  "generation": 1,
  "category": "normal"
}
```

`category`: `normal` / `legendary` / `mythical` / `ultra-beast` / `paradox`

### core/forms/0006.json

全フォルム + 本編 stats を統合。`form_type` は `normal` / `mega` / `gigantamax`。

```json
{
  "pokemon_id": 6,
  "forms": [
    {
      "id": "default",
      "order": 0,
      "name": { "ja": "リザードン", "en": "Charizard" },
      "form_type": "normal",
      "region": "kanto",
      "types": ["fire", "flying"],
      "stats": {
        "hp": 78,
        "attack": 84,
        "defense": 78,
        "sp_attack": 109,
        "sp_defense": 85,
        "speed": 100
      },
      "ability_ids": [66],
      "hidden_ability_id": 94
    },
    {
      "id": "mega-x",
      "order": 1,
      "name": { "ja": "メガリザードンX", "en": "Mega Charizard X" },
      "form_type": "mega",
      "region": "kanto",
      "types": ["fire", "dragon"],
      "stats": {
        "hp": 78,
        "attack": 130,
        "defense": 111,
        "sp_attack": 130,
        "sp_defense": 85,
        "speed": 100
      },
      "ability_ids": [153]
    }
  ]
}
```

### mainline/availability/0006.json

```json
{
  "pokemon_id": 6,
  "entries": [
    { "game_id": "scarlet", "availability_type": "trade", "notes": "トレード入手" },
    { "game_id": "sword", "availability_type": "wild", "notes": "ワイルドエリア" }
  ]
}
```

`availability_type`: `wild` / `trade` / `event` / `transfer` / `gift` / `breed`

### go/forms/0006.json

GO 独自のステータス体系。本編 stats とは完全に分離。

```json
{
  "pokemon_id": 6,
  "forms": [
    {
      "form_id": "default",
      "base_attack": 223,
      "base_defense": 173,
      "base_stamina": 186,
      "fast_move_ids": [1, 2],
      "charged_move_ids": [10, 11],
      "elite_fast_move_ids": [],
      "elite_charged_move_ids": [],
      "released_at": "2016-07-06",
      "shiny_released_at": "2019-03-01"
    }
  ]
}
```

### go/costumes/0025.json

GO 限定コスチューム（イベント衣装など）。1 ポケモン 1 ファイル。

```json
{
  "pokemon_id": 25,
  "costumes": [
    {
      "costume_id": "0025-festive",
      "identifier": "pikachu-festive",
      "name": { "ja": "サンタピカチュウ", "en": "Pikachu (Festive)" },
      "released_at": "2016-12-25",
      "shiny_released_at": null
    }
  ]
}
```

---

## API エンドポイント設計

### 本編（プレフィックスなし）

```
GET /pokemon                        # 一覧（?limit&offset）
GET /pokemon/:id                    # 図鑑番号 or identifier・全フォルム含む
GET /pokemon/:id/moves              # 覚える技一覧
GET /pokemon/:id/availability       # 出現ゲーム一覧
GET /moves                          # 技一覧
GET /moves/:id                      # 技詳細
GET /games                          # ゲームソフト一覧
GET /games/:id/pokemon              # そのソフトに出現するポケモン
GET /abilities                      # 特性一覧
GET /abilities/:id                  # 特性詳細
```

### Pokémon GO

```
GET /go/pokemon                     # 一覧
GET /go/pokemon/:id                 # 詳細（GO ステータス）
GET /go/pokemon/:id/costumes        # GO コスチューム一覧
GET /go/moves                       # 技一覧
GET /go/moves/:id                   # 技詳細
```

API ドキュメント（Scalar UI）: `GET /doc`

---

## レイヤー構造

```
Route (Hono)
  ↓
Service（core + mainline / go を結合・変換）
  ↓
Repository（DataLoader 経由で JSON 読み込み）
  ↓
DataLoader（ASSETS Fetcher ラッパー）
  ↓
data/ ディレクトリ（Cloudflare ASSETS binding）
```

---

## CI/CD

### validate.yml（PR トリガー: `data/`, `packages/scripts/` 変更時）

```
scripts/validate.ts で全 JSON を Zod 検証
  ↓
scripts/build-index.ts で _index 再生成・差分チェック
```

### deploy-api.yml（main push トリガー）

```
scripts/build-index.ts で _index 再生成
  ↓
wrangler deploy で Cloudflare Workers にデプロイ
```

### deploy-web.yml（main push トリガー: `apps/web/`, `packages/schemas/` 変更時）

```
pnpm run --filter @pokemon/schemas build（スキーマパッケージをビルド）
  ↓
pnpm run --filter @pokemon/web build（opennextjs-cloudflare build）
  ↓
wrangler pages deploy apps/web/.open-next で Cloudflare Pages にデプロイ
```

---

## 環境変数

### Cloudflare Workers（`apps/api/`）

| 変数             | 設定場所          | 内容                                |
| ---------------- | ----------------- | ----------------------------------- |
| `ALLOWED_ORIGIN` | Workers Dashboard | CORS 許可オリジン（Web のドメイン） |

`wrangler.toml` の `[vars]` にはローカル開発用のデフォルト値のみ記載。

### GitHub Actions Secrets

| シークレット           | 内容                                      |
| ---------------------- | ----------------------------------------- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API トークン                   |
| `NEXT_PUBLIC_API_URL`  | 本番 API の URL（Web ビルド時に埋め込み） |

### Cloudflare Pages（任意）

| 変数      | 内容                                                 |
| --------- | ---------------------------------------------------- |
| `API_URL` | SSR 時の API URL（設定するとリビルド不要で変更可能） |

---

## 将来拡張

| 項目       | 対応方針                                       |
| ---------- | ---------------------------------------------- |
| DB 移行    | Repository 実装を差し替えるだけ                |
| 世代差対応 | `generation_overrides/` 追加・Service でマージ |

---

## やらないこと（現フェーズ）

- 世代差の完全対応
- 技の覚え方バージョン差
- ORM 導入
- GraphQL 化
- 書き込み系 API

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, but it invokes Vite through `vp dev` and `vp build`.

## Vite+ Workflow

`vp` is a global binary that handles the full development lifecycle. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

### Start

- create - Create a new project from a template
- migrate - Migrate an existing project to Vite+
- config - Configure hooks and agent integration
- staged - Run linters on staged files
- install (`i`) - Install dependencies
- env - Manage Node.js versions

### Develop

- dev - Run the development server
- check - Run format, lint, and TypeScript type checks
- lint - Lint code
- fmt - Format code
- test - Run tests

### Execute

- run - Run monorepo tasks
- exec - Execute a command from local `node_modules/.bin`
- dlx - Execute a package binary without installing it as a dependency
- cache - Manage the task cache

### Build

- build - Build for production
- pack - Build libraries
- preview - Preview production build

### Manage Dependencies

Vite+ automatically detects and wraps the underlying package manager such as pnpm, npm, or Yarn through the `packageManager` field in `package.json` or package manager-specific lockfiles.

- add - Add packages to dependencies
- remove (`rm`, `un`, `uninstall`) - Remove packages from dependencies
- update (`up`) - Update packages to latest versions
- dedupe - Deduplicate dependencies
- outdated - Check for outdated packages
- list (`ls`) - List installed packages
- why (`explain`) - Show why a package is installed
- info (`view`, `show`) - View package information from the registry
- link (`ln`) / unlink - Manage local package links
- pm - Forward a command to the package manager

### Maintain

- upgrade - Update `vp` itself to the latest version

These commands map to their corresponding tools. For example, `vp dev --port 3000` runs Vite's dev server and works the same as Vite. `vp test` runs JavaScript tests through the bundled Vitest. The version of all tools can be checked using `vp --version`. This is useful when researching documentation, features, and bugs.

## Common Pitfalls

- **Using the package manager directly:** Do not use pnpm, npm, or Yarn directly. Vite+ can handle all package manager operations.
- **Always use Vite commands to run tools:** Don't attempt to run `vp vitest` or `vp oxlint`. They do not exist. Use `vp test` and `vp lint` instead.
- **Running scripts:** Vite+ built-in commands (`vp dev`, `vp build`, `vp test`, etc.) always run the Vite+ built-in tool, not any `package.json` script of the same name. To run a custom script that shares a name with a built-in command, use `vp run <script>`. For example, if you have a custom `dev` script that runs multiple services concurrently, run it with `vp run dev`, not `vp dev` (which always starts Vite's dev server).
- **Do not install Vitest, Oxlint, Oxfmt, or tsdown directly:** Vite+ wraps these tools. They must not be installed directly. You cannot upgrade these tools by installing their latest versions. Always use Vite+ commands.
- **Use Vite+ wrappers for one-off binaries:** Use `vp dlx` instead of package-manager-specific `dlx`/`npx` commands.
- **Import JavaScript modules from `vite-plus`:** Instead of importing from `vite` or `vitest`, all modules should be imported from the project's `vite-plus` dependency. For example, `import { defineConfig } from 'vite-plus';` or `import { expect, test, vi } from 'vite-plus/test';`. You must not install `vitest` to import test utilities.
- **Type-Aware Linting:** There is no need to install `oxlint-tsgolint`, `vp lint --type-aware` works out of the box.

## Review Checklist for Agents

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to validate changes.
<!--VITE PLUS END-->
