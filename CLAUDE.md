# CLAUDE.md

このファイルはリポジトリ内での作業時に Claude Code (claude.ai/code) へガイダンスを提供します。

## 開発コマンド

### 基本コマンド
- `npm run dev` - Next.js 開発サーバー起動（Turbo モード）
- `npm run build` - 本番ビルド
- `npm start` - 本番サーバー起動
- `npm run lint` - ESLint 実行

### Docker コマンド
- `npm run docker:up` - Docker Compose で全サービス起動
- `npm run docker:down` - Docker Compose サービス停止
- `npm run docker:logs` - Docker Compose ログ確認
- `npm run docker:db` - PostgreSQL のみ起動

### データベースコマンド
- `npm run db:migrate` - 開発環境で Prisma マイグレーション実行
- `npm run db:reset` - DB リセット＆マイグレーション再実行
- `npm run db:studio` - Prisma Studio 起動（DB の中身を GUI で確認）
- `npm run db:generate` - Prisma クライアント生成
- `npm run db:seed` - 全シードデータ投入
- `npm run db:seed:users` - ユーザーのみシード
- `npm run db:seed:posts` - 投稿のみシード
- `npm run db:seed:follows` - フォロー関係のみシード
- `npm run db:seed:likes` - いいねのみシード

## アーキテクチャ

### 技術スタック
- **フレームワーク**: Next.js 15（App Router + React Server Components）
- **データベース**: PostgreSQL + Prisma ORM
- **認証**: AWS Cognito + Amplify（SSR モード、トークンは Cookie に保存）
- **地図**: Google Maps JavaScript API
- **スタイリング**: Tailwind CSS 4 + Material-UI (MUI)
- **バリデーション**: Zod
- **言語**: TypeScript

### データベーススキーマ
6 つのモデル:
- **User**: プロフィール情報 — `email`, `name`, `iconUrl`, `bio`, `fishingYears`, `mainFishing`, `isPrivate`
- **Post**: 位置情報付き投稿 — `content`（最大 256 文字）, `imageUrls`, `fishingAreaId`, レガシーの `latitude`/`longitude`
- **FishingArea**: 釣り場スポット — `centerLat`, `centerLng`, `radius`（メートル、デフォルト 200）, `postCount`（非正規化）, `createdBy`
- **Like**: User ↔ Post の多対多。複合ユニーク `[userId, postId]`
- **Follow**: ユーザーフォロー関係 `followerId → followeeId`。複合ユニーク `[followerId, followeeId]`
- **Comment**: 投稿へのコメント — `userId`, `postId`, `content`
- **FollowRequest**: 非公開アカウント向けのフォローリクエスト（pending/approved/rejected）

### ディレクトリ構成
```
app/
├── home/                  # ホーム画面（投稿一覧 + 地図）
│   ├── actions/           # getPosts, getFishingAreas サーバーアクション
│   ├── components/        # PostFab, PostButton クライアントコンポーネント
│   └── helpers/           # データ変換ユーティリティ（posts.ts）
├── post/
│   ├── new/               # 投稿作成
│   │   ├── actions/       # createPost, createFishingArea サーバーアクション
│   │   └── components/    # PostFormClient（useActionState 使用）
│   └── [id]/              # 投稿詳細 + コメントアクション
├── user/
│   ├── [id]/              # ユーザープロフィール（公開）
│   ├── setup/             # 初回プロフィール作成（サインアップ後）
│   └── settings/          # プロフィール編集
├── auth/
│   ├── page.tsx           # ログイン/サインアップ（AWS Authenticator コンポーネント）
│   ├── RedirectIfLoggedIn.tsx
│   └── i18n.ts            # Amplify UI メッセージの日本語訳
├── actions/               # ルートレベルのサーバーアクション
├── layout.tsx             # ルートレイアウト（lang="ja"）
└── providers.tsx          # Amplify + MUI ThemeProvider 設定

components/                # 共通コンポーネント（app/ と並列）
├── Header.tsx, Footer.tsx
├── SimpleMap.tsx          # 読み取り専用地図
└── InteractiveMap.tsx     # 釣り場選択・作成用地図

types/                     # 共通型定義（app/ と並列）
├── post.ts
└── fishing-area.ts

lib/
├── prisma.ts              # Prisma シングルトン（開発時の多重インスタンス防止）
├── auth.ts                # getServerUser()（runWithAmplifyServerContext 使用）
├── schemas.ts             # Zod スキーマ（createPostSchema, FormState）
└── geocoding.ts           # 逆ジオコーディング（座標 → 都道府県/市区町村）

prisma/
├── schema.prisma
├── seed.ts                # シードエントリーポイント
└── src/                   # モデルごとのシード関数
```

### 主要アーキテクチャパターン

**Server Actions によるデータ変更** — 全ての書き込みは `actions/` ディレクトリ内のサーバーアクションを経由し、API ルートは使わない。アクションは `FormState` オブジェクトを返す:
```typescript
type FormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  redirectTo?: string;
}
```
クライアントフォームは `useActionState(action, initialState)` でこれを扱う。

**認証** — `lib/auth.ts` の `getServerUser()` が `runWithAmplifyServerContext` を呼び、SSR 安全な Cognito トークン読み取りを行う。ユーザー名 = メールアドレス（Cognito の設定による）。

**認証ルーティングフロー**:
1. 未認証 → `/auth`（AWS Authenticator UI）
2. サインアップ後、DB にユーザー未登録 → `/user/setup`（プロフィール作成）
3. セットアップ完了後 → `/home`

**キャッシュ無効化** — データ変更後に `revalidatePath()` を呼んで ISR キャッシュを破棄する（例: 投稿作成後に `/home` を再検証）。

**投稿フロー中の FishingArea 作成** — フォーム操作中に釣り場が「仮」として作成される場合がある（DB 保存前）。`createPost` サーバーアクションが仮 ID の場合に DB へ釣り場を保存する処理を担う。

**地図コンポーネント**:
- `SimpleMap` — 読み取り専用。釣り場サークルと投稿数、現在地マーカーを表示
- `InteractiveMap` — クリックで既存釣り場を選択 or 新規作成。親コンポーネント制御のため forward ref を使用
- `PostDetailMap` — 投稿詳細ページ用の単一釣り場サークル表示

### バリデーション
`lib/schemas.ts` の Zod スキーマ:
- `createPostSchema`: content（1〜256 文字）、任意の imageUrl（有効な URL）、任意の lat/lng
- バリデーションエラーは `FormState.errors` のフィールド別配列にマッピング

### ジオコーディング
`lib/geocoding.ts` が Google Maps API を使って座標を都道府県・市区町村に逆ジオコーディングする。API 失敗時は座標文字列にフォールバック。

### 国際化
アプリは全て日本語。`app/auth/i18n.ts` が AWS Amplify UI のバリデーションメッセージを日本語訳する。ルート HTML は `lang="ja"`、日付は `ja-JP` ロケール使用。

### スタイリング
- MUI `sx` プロパティでコンポーネントレベルのスタイル。カスタムテーマ: primary `#3B82F6`（青）、secondary `#6B7280`
- Tailwind カスタムカラー: `primary`（空色）、`secondary`（ティール）。カスタムアニメーション: `fade-in`, `slide-up`
- ブランディングには空色 → ティールのリニアグラデーションを使用

### 環境変数
```
DATABASE_URL                          # PostgreSQL 接続文字列
NEXT_PUBLIC_AWS_REGION                # 例: ap-northeast-1
NEXT_PUBLIC_USER_POOLS_ID             # Cognito ユーザープール ID
NEXT_PUBLIC_USER_POOLS_WEB_CLIENT_ID  # Cognito クライアント ID
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY       # Google Maps API キー
```

### Docker 開発環境
PostgreSQL はポート 5433 で起動（ローカルインストールとの競合回避）。アプリはポート 3000。DB 初期化スクリプトは `init.sql`。

## コーディング規約（重要）

### 責務の分離ルール
- **Prisma クエリは必ず `actions/` に書く** — `page.tsx` 内に直接 Prisma クエリを書かない
- **ビジネスロジックは `helpers/` に書く** — データ加工・変換・条件判定は `page.tsx` に書かない。`helpers/` は責務ごとにファイル分割する
- **`page.tsx` は actions/helpers を呼び出して JSX を返すだけ** にする

### TypeScript
- 関数定義は全てアロー関数で統一 (`const func = async () => {}`)
- `function` 宣言は使わない
- 型定義は `type` を使用（`interface` は使わない）

### JSX
- JSX 内にロジックを書かない。整形済みデータのみ使用する
- `useEffect` は原則使用しない（サーバーコンポーネント中心のため）
- コンポーネントはむやみに分割しない
