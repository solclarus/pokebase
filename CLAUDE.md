# Pokemon Data API 設計仕様書

## 目的

本編シリーズおよび Pokémon GO のデータを管理・提供する個人用 Web API 基盤を構築する。

- データは GitHub で OSS 管理（JSON）
- Cloudflare Workers + Hono
- モノレポ構成
- 読み取り専用 API
- 将来の DB 移行を考慮した Repository パターン

---

## アーキテクチャ方針

- `core` / `mainline` / `go` の 3 レイヤーでデータを分離
- 1 ポケモン 1 ファイルを徹底
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
├── scripts/
│   ├── validate.ts                    # データ検証（Zod）
│   └── build-index.ts                 # _index 自動生成
│
├── api/
│   ├── src/
│   │   ├── index.ts                   # Hono アプリ・全ルート定義
│   │   ├── env.ts                     # Cloudflare Bindings 型
│   │   ├── types/                     # Zod スキーマ・型定義
│   │   │   ├── pokemon.ts
│   │   │   ├── form.ts
│   │   │   ├── move.ts
│   │   │   ├── game.ts
│   │   │   ├── costume.ts
│   │   │   └── go.ts
│   │   ├── repository/                # フラット構成（json/ サブディレクトリなし）
│   │   │   ├── interface.ts           # Repository インターフェース定義
│   │   │   ├── data-loader.ts         # DataLoader（ASSETS Fetcher ラッパー）
│   │   │   ├── pokemon.ts
│   │   │   ├── form.ts
│   │   │   ├── ability.ts
│   │   │   ├── availability.ts
│   │   │   ├── move.ts
│   │   │   ├── learnset.ts
│   │   │   ├── game.ts
│   │   │   └── go.ts                  # GO pokemon / costume / move
│   │   └── service/
│   │       ├── pokemon.ts             # core + mainline を結合
│   │       └── go.ts
│   ├── wrangler.toml
│   └── package.json
│
└── .github/
    └── workflows/
        ├── validate.yml               # PR 時にデータ検証
        └── deploy.yml                 # main push 時にデプロイ
```

---

## データ設計

### core/pokemons/0006.json
種族の基本情報のみ。`category` で分類（`normal` / `legendary` / `mythical` / `ultra-beast` / `paradox`）。

```json
{
  "id": 6,
  "identifier": "charizard",
  "name": {
    "ja": "リザードン",
    "en": "Charizard"
  },
  "generation": 1,
  "category": "normal"
}
```

### core/forms/0006.json
全フォルム + 本編 stats を統合。1 ポケモン 1 ファイル。`id` はフォルムを識別する短い文字列（例: `default`, `mega-x`, `alola`）。

```json
{
  "pokemon_id": 6,
  "forms": [
    {
      "id": "default",
      "name": { "ja": "リザードン", "en": "Charizard" },
      "form_type": "default",
      "is_default": true,
      "types": ["fire", "flying"],
      "stats": {
        "hp": 78, "attack": 84, "defense": 78,
        "sp_attack": 109, "sp_defense": 85, "speed": 100
      },
      "ability_ids": [66],
      "hidden_ability_id": 94
    },
    {
      "id": "mega-x",
      "name": { "ja": "メガリザードンX", "en": "Mega Charizard X" },
      "form_type": "mega",
      "is_default": false,
      "types": ["fire", "dragon"],
      "stats": {
        "hp": 78, "attack": 130, "defense": 111,
        "sp_attack": 130, "sp_defense": 85, "speed": 100
      },
      "ability_ids": [153]
    },
    {
      "id": "mega-y",
      "name": { "ja": "メガリザードンY", "en": "Mega Charizard Y" },
      "form_type": "mega",
      "is_default": false,
      "types": ["fire", "flying"],
      "stats": {
        "hp": 78, "attack": 104, "defense": 78,
        "sp_attack": 159, "sp_defense": 115, "speed": 100
      },
      "ability_ids": [70]
    }
  ]
}
```

### mainline/availability/0006.json

```json
{
  "pokemon_id": 6,
  "entries": [
    {
      "game_id": "scarlet",
      "availability_type": "trade",
      "notes": "トレード入手"
    },
    {
      "game_id": "sword",
      "availability_type": "wild",
      "notes": "ワイルドエリア"
    }
  ]
}
```

### go/pokemon_stats/0006.json
GO 独自のステータス体系。本編 stats とは完全に分離。

```json
{
  "pokemon_id": 6,
  "identifier": "charizard",
  "base_attack": 223,
  "base_defense": 173,
  "base_stamina": 186,
  "fast_move_ids": [1, 2],
  "charged_move_ids": [10, 11]
}
```

### go/costumes/0025.json
GO 限定コスチューム（イベント衣装など）。1 ポケモン 1 ファイル。

```json
{
  "pokemon_id": 25,
  "costumes": [
    {
      "costume_id": "0025-halloween-2019",
      "identifier": "pikachu-halloween-2019",
      "name": { "ja": "ハロウィンピカチュウ（2019）", "en": "Halloween Pikachu (2019)" },
      "event": "Halloween 2019",
      "available_from": "2019-10-17",
      "available_until": "2019-11-01"
    },
    {
      "costume_id": "0025-ash",
      "identifier": "pikachu-ash",
      "name": { "ja": "サトシのピカチュウ", "en": "Ash's Pikachu" },
      "event": "Special",
      "available_from": "2017-07-22",
      "available_until": null
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
GET /search?q=                      # 横断検索
```

### Pokémon GO

```
GET /go/pokemon                     # 一覧
GET /go/pokemon/:id                 # 詳細（GO ステータス）
GET /go/pokemon/:id/costumes        # GO コスチューム一覧
GET /go/moves                       # 技一覧
GET /go/moves/:id                   # 技詳細
```

---

## GET /pokemon/:id レスポンス例

Service 層で `core/pokemons` + `core/forms` + `mainline/availability` を結合して返す。

```json
{
  "id": 6,
  "identifier": "charizard",
  "name": { "ja": "リザードン", "en": "Charizard" },
  "generation": 1,
  "category": "normal",
  "forms": [
    {
      "id": "default",
      "name": { "ja": "リザードン", "en": "Charizard" },
      "form_type": "default",
      "is_default": true,
      "types": ["fire", "flying"],
      "stats": {
        "hp": 78, "attack": 84, "defense": 78,
        "sp_attack": 109, "sp_defense": 85, "speed": 100
      },
      "ability_ids": [66],
      "hidden_ability_id": 94
    },
    {
      "id": "mega-x",
      "name": { "ja": "メガリザードンX", "en": "Mega Charizard X" },
      "form_type": "mega",
      "is_default": false,
      "types": ["fire", "dragon"],
      "stats": {
        "hp": 78, "attack": 130, "defense": 111,
        "sp_attack": 130, "sp_defense": 85, "speed": 100
      },
      "ability_ids": [153]
    }
  ],
  "availability": [
    { "game_id": "scarlet", "availability_type": "trade" },
    { "game_id": "sword", "availability_type": "wild" }
  ]
}
```

---

## レイヤー構造

```
Route (Hono)
  ↓
Service（core + mainline / go を結合・変換）
  ↓
Repository interface（抽象）
  ↓
JSON 実装（現在）  ／  DB 実装（将来）
```

---

## ファイル数サマリ

| ディレクトリ | ファイル数 |
|---|---|
| core/pokemons/ | 1,025 |
| core/forms/ | 1,025 |
| core/abilities/ | ~300 |
| mainline/moves/ | ~1,000 |
| mainline/learnsets/ | 1,025 |
| mainline/availability/ | 1,025 |
| go/pokemon_stats/ | ~1,000 |
| go/costumes/ | ~300（コスチューム保有種のみ） |
| go/moves/ | ~200 |
| **合計** | **約 6,900** |

---

## CI/CD

### validate.yml（PR トリガー）

```
data/ 配下が変更された PR
  ↓
scripts/validate.ts で全 JSON を Zod 検証
  ↓
scripts/build-index.ts で _index 再生成・差分チェック
```

### deploy.yml（main push トリガー）

```
main への push
  ↓
scripts/build-index.ts で _index 再生成
  ↓
wrangler deploy で Cloudflare Workers にデプロイ
```

---

## 型・バリデーション（Zod）

```typescript
// api/src/types/pokemon.ts
import { z } from "zod"

export const PokemonCategorySchema = z.enum([
  "normal", "legendary", "mythical", "ultra-beast", "paradox",
])

export const PokemonSchema = z.object({
  id: z.number().int().positive(),
  identifier: z.string(),
  name: LocalizedNameSchema,
  generation: z.number().int().min(1).max(10),
  category: PokemonCategorySchema,
})

// api/src/types/form.ts
export const StatsSchema = z.object({
  hp: z.number(), attack: z.number(), defense: z.number(),
  sp_attack: z.number(), sp_defense: z.number(), speed: z.number(),
})

export const FormSchema = z.object({
  id: z.string(),  // e.g., "default", "mega-x", "alola"
  name: LocalizedNameSchema,
  form_type: z.enum(["default", "mega", "gigantamax", "regional", "special"]),
  is_default: z.boolean(),
  types: z.array(z.string()).min(1).max(2),
  stats: StatsSchema,
  ability_ids: z.array(z.number()),
  hidden_ability_id: z.number().optional(),
})

export const FormsFileSchema = z.object({
  pokemon_id: z.number(),
  forms: z.array(FormSchema),
})

// api/src/types/costume.ts
export const CostumeSchema = z.object({
  costume_id: z.string(),
  identifier: z.string(),
  name: z.object({ ja: z.string(), en: z.string() }),
  event: z.string(),
  available_from: z.string(),
  available_until: z.string().nullable(),
})

export const CostumesFileSchema = z.object({
  pokemon_id: z.number(),
  costumes: z.array(CostumeSchema),
})
```

---

## 将来拡張

| 項目 | 対応方針 |
|------|----------|
| DB 移行 | Repository 実装を差し替えるだけ |
| 世代差対応 | `generation_overrides/` 追加・Service でマージ |
| Web アプリ | 別リポジトリで本 API を fetch |

---

## やらないこと（現フェーズ）

- 世代差の完全対応
- 技の覚え方バージョン差
- ORM 導入
- GraphQL 化
- 書き込み系 API

---

## 開発ステップ

```
Step 1   モノレポ初期化
Step 2   Zod スキーマ・型定義
Step 3   core データ整備（pokemons / forms / abilities）
Step 4   mainline データ整備（moves / learnsets / availability）
Step 5   go データ整備（pokemon_stats / costumes / moves）
Step 6   scripts/validate.ts・build-index.ts 実装
Step 7   Repository 実装（JSON 読み込み）
Step 8   Service 実装（データ結合ロジック）
Step 9   Hono Route 実装
Step 10  GitHub Actions 設定
Step 11  Cloudflare Workers デプロイ
```
