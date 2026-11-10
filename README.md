# 代用レシピ（alt-recipe-v2）

持っていない材料・器具をチェックするだけで、**代替案**と**書き換えた手順**を提案するレシピアプリです。
v1（alt-recipe-demo）のコンセプトを引き継ぎ、仕組みを全面的に作り直しました。

## v1 からの主な変更点

| 課題（v1） | v2 の解決策 |
| --- | --- |
| OpenAI API に毎回レシピ全文を送り、トークン量＝コストが大きい | **ローカル代替エンジン**を新設。知識ベースで即時解決し、APIキーなし・通信なし・コストゼロがデフォルト動作に |
| 「今使えるもの」が分からない | 材料・器具リストで未チェック項目に「✓ 使える」バッジと進捗バー（○/○品 使える）を表示 |
| レシピ数が少ない | 無料API **TheMealDB** から検索・取得できるプロバイダ層を追加。同梱レシピ14品と横断検索 |
| LLM を使う場合もコストを抑えたい | LLMモードでも「ないもの」と「関係する手順だけ」を送信する設計に変更 |

## 技術スタック

- **Next.js 16（App Router）+ TypeScript**、静的エクスポート（`output: "export"`）
- **Tailwind CSS 4**
- React 19 / 同梱データはビルド時に静的生成、検索・代替提案はクライアントで実行
- 外部API: TheMealDB（無料・キー不要、ブラウザから直接取得）

## 動かし方

```bash
npm install
npm run dev     # 開発サーバー (http://localhost:3000)
npm run build   # 静的エクスポート（out/ に静的ファイル一式を生成）
npx serve out   # 生成物をローカルで確認する場合
```

本アプリは **静的サイト** です（後述の「GitHub Pages へのデプロイ」参照）。
Node サーバーは不要で、`out/` を任意の静的ホスティングに置くだけで動きます。
環境変数はビルド時の `NEXT_PUBLIC_BASE_PATH` のみ（後述）。何も設定しなくても全機能が動作します。

## 代替エンジンの設計

### 1. ローカルエンジン（デフォルト）

`src/lib/engine/substitute.ts` + `src/lib/data/substitutions.ts`

- **知識ベース**: よくある材料・器具 約60項目をキュレーションしたデータ。
  各エントリは「代替案」「分量の目安」「手順への影響メモ」「手順文中での置き換え語」を持ちます。
  日本語名だけでなく英語名（TheMealDB 由来レシピ用）のエイリアスも収録。
- **手順の書き換え**: ないアイテムの名前が登場する手順文だけを対象に、決定的に置き換えます
  （例: 「ハンドミキサーで泡立てる」→「泡立て器で泡立てる（※注記）」）。
  変更のない手順はそのまま表示され、UI では変更箇所だけ旧文（打ち消し）と新文を並べます。
- 知識ベースにない項目は「代替案が見つかりませんでした」と正直に表示します。

### 2. LLMモード（任意・サーバー版のみ）

LLMモードはサーバーサイドAPIを前提とするため、**静的エクスポート版では無効** です
（代替提案は常にローカルエンジンが担当します）。
実装は `src/lib/engine/llm.ts` に残してあります。Node サーバーで動かす構成に戻す場合は、
API ルートからこのモジュールを呼ぶ形で再利用できます。設計は以下の通りです。

- 送信するのは **ない材料・器具と、それが登場する手順文だけ**（レシピ全文は送らない）。
- 応答は JSON 形式固定で受け取り、ローカルエンジンの結果にマージします（LLM が失敗したら自動でローカルにフォールバック）。
- 接続先は OpenAI 互換 API。`LLM_BASE_URL` を変えれば **llama.cpp の llama-server などローカルLLM**にも向けられます。
- モデルは `LLM_MODEL`（デフォルト `gpt-4o-mini`）。

## レシピプロバイダ

`src/lib/providers/` に出所ごとのプロバイダを実装し、`RecipeProvider` インターフェース
（`search` / `listByCategory` / `getById`）で統一しています。取得結果はすべて
アプリ共通の `Recipe` 形式に正規化されます。

| プロバイダ | 内容 |
| --- | --- |
| `local` | 同梱の日本語レシピ14品（v1 のデータ + おかず2品を追加）。オフラインでも常時利用可能 |
| `mealdb` | TheMealDB の無料公開API。名前検索・カテゴリ一覧・ID取得に対応し、材料（strIngredient/strMeasure）を `{key, label}` 形式へ、手順文をステップ配列へ変換。静的版ではブラウザから直接取得する（TheMealDB は `Access-Control-Allow-Origin: *` を返すため CORS の問題なし） |

外部APIに接続できない環境でも、同梱レシピだけでアプリは完全に動作します。

### プロバイダの追加方法（楽天レシピAPIなど）

1. `src/lib/providers/rakuten.ts` を作り、`RecipeProvider` を実装する
   （楽天はカテゴリ別ランキングAPIが中心なので、`listByCategory` 主体になる想定）。
2. `src/lib/providers/index.ts` の `providers` 配列に登録する。
3. 楽天レシピAPIは **ユーザー自身のアプリケーションID** が必要なため v2 では未実装です。
   ID を取得したら環境変数（例: `RAKUTEN_APPLICATION_ID`）で読み込む形にしてください。

## ディレクトリ構成

```
src/
├── app/
│   ├── page.tsx                  # トップ（同梱レシピ一覧をビルド時に埋め込む）
│   └── recipes/
│       ├── [id]/page.tsx         # 同梱レシピ詳細（generateStaticParams で静的生成）
│       └── mealdb/               # TheMealDB詳細（?id= を読んでクライアント取得）
├── components/
│   ├── HomeClient.tsx            # 検索・カテゴリフィルタ・TheMealDB検索（クライアント実行）
│   ├── RecipeCard.tsx
│   └── RecipeDetail.tsx          # チェック→代替案表示（ローカルエンジンを直接実行）
└── lib/
    ├── types.ts                  # Recipe / Substitution などの型
    ├── data/
    │   ├── recipes.ts            # 同梱レシピ（v1互換形式）
    │   └── substitutions.ts      # 代替知識ベース
    ├── engine/
    │   ├── substitute.ts         # ローカルエンジン＋手順書き換え
    │   └── llm.ts                # 任意のLLMモード（サーバー版用に残置、静的版では未使用）
    └── providers/                # local / themealdb / レジストリ

.github/workflows/deploy-pages.yml  # GitHub Pages 自動デプロイ
```

## ユーザー側で残っていること

- **APIキーの設定**: 静的版では不要です（代替提案はローカルエンジンのみ）。
  LLMモードはサーバー構成に戻した場合にのみ有効で、その際は `.env.local` に
  `OPENAI_API_KEY` 等を設定します（ローカルLLMなら `LLM_BASE_URL` を llama.cpp に向ける）。
- **楽天レシピAPI（任意）**: 導入するなら楽天デベロッパーでアプリケーションIDを取得し、
  上記手順でプロバイダを追加してください。
- **デプロイ**: GitHub Pages への自動デプロイを用意済み（次節）。手作業が要るのは
  リポジトリ側の Pages 有効化（初回のみ）だけです。
- **知識ベースの拡充**: `src/lib/data/substitutions.ts` にエントリを足すだけで
  ローカルエンジンの対応範囲が広がります。

## GitHub Pages へのデプロイ

GitHub Pages は静的ファイルしか配信できないため、本アプリは **静的エクスポート**
（`next build` で `out/` を生成する構成）になっています。

### 静的版の設計（サーバー版との違い）

| 項目 | サーバー版（旧） | 静的版（現行） |
| --- | --- | --- |
| 代替提案 | `/api/substitute` 経由（ローカル/LLM切替） | ブラウザ内で `runLocalEngine` を直接実行（LLMモードは無効） |
| TheMealDB 検索 | `/api/recipes/search` 経由 | ブラウザから TheMealDB を直接取得（CORS: `Access-Control-Allow-Origin: *` のため可） |
| 同梱レシピ詳細 | 動的ルートで都度レンダリング | `generateStaticParams` で全14品をビルド時に静的生成 |
| TheMealDB レシピ詳細 | 任意IDの動的ルート | 静的ページ `/recipes/mealdb?id=mealdb-<ID>` でクライアント取得 |
| 画像 | Next.js の画像最適化 | 最適化なし（`images.unoptimized`、通常の `<img>` 読み込み） |

ベースパスは環境変数 `NEXT_PUBLIC_BASE_PATH` で切り替えます（`next.config.ts`）。
プロジェクトサイト（`https://<user>.github.io/<repo>/`）では `/<repo>` が必要で、
ユーザーサイト（`<user>.github.io` リポジトリ）や独自ドメインでは空のままにします。

### 自動デプロイ（GitHub Actions）

`.github/workflows/deploy-pages.yml` が同梱されています。
`main` への push で、ビルド（`NEXT_PUBLIC_BASE_PATH=/alt-recipe-demo`）→
`out/` のアップロード → Pages へのデプロイまで自動で走ります。

### ユーザー側で必要な手作業（初回のみ）

1. このプロジェクトを GitHub の **alt-recipe-demo** リポジトリに push する
   （リポジトリ名を変える場合は、ワークフローの `NEXT_PUBLIC_BASE_PATH` も合わせる）。
2. リポジトリの **Settings → Pages** を開き、**Build and deployment の Source を
   「GitHub Actions」** にする（＝ Pages を有効化する）。これをしないと Actions の
   デプロイステップが失敗します。
3. `main` に push すれば（または Actions 画面から手動実行すれば）公開されます。
   公開URLは `https://<GitHubユーザー名>.github.io/alt-recipe-demo/` です。
