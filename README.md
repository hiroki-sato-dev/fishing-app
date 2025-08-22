# 🎣 釣りSNSアプリ

釣りをもっと身近に、もっと楽しく。老若男女・素人から玄人までが楽しめる釣りSNSアプリです。

## ✨ 機能

- 📍 **位置情報付き投稿**: 釣り場の位置情報と共に釣果を記録・共有
- 🗺️ **地図表示**: Google Maps APIを使用した高品質な地図表示
- 👥 **ユーザー管理**: AWS Cognitoによる認証システム
- ❤️ **いいね機能**: 投稿への反応機能
- 📱 **レスポンシブデザイン**: モバイル・デスクトップ対応

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 15 (App Router) + React + TypeScript
- **バックエンド**: Server Actions (App Router)
- **データベース**: PostgreSQL + Prisma ORM
- **認証**: AWS Cognito + Amplify
- **地図**: Google Maps JavaScript API
- **スタイリング**: Tailwind CSS

## 🚀 セットアップ

### 前提条件

- Node.js 18以上
- PostgreSQL
- AWS Cognito User Pool
- Google Maps API キー

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd fishing-app
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/fishing_app"

# AWS Cognito
NEXT_PUBLIC_AWS_REGION="ap-northeast-1"
NEXT_PUBLIC_USER_POOLS_ID="your-user-pool-id"
NEXT_PUBLIC_USER_POOLS_WEB_CLIENT_ID="your-client-id"

# AWS S3 (将来の画像アップロード機能用)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="ap-northeast-1"
S3_BUCKET_NAME=""

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```

### 4. Google Maps API キーの取得

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成または既存のプロジェクトを選択
3. 「APIとサービス」→「ライブラリ」で以下のAPIを有効化：
   - Maps JavaScript API
   - Places API（将来的な機能拡張用）
4. 「APIとサービス」→「認証情報」でAPIキーを作成
5. 作成したAPIキーを`.env`ファイルの`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`に設定

### 5. データベースのセットアップ

```bash
# Prismaクライアントの生成
npx prisma generate

# データベースマイグレーション
npx prisma migrate dev --name init
```

### 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認してください。

## 📁 プロジェクト構造

```
src/
├── app/
│   ├── page.tsx                    # トップページ（地図＋投稿一覧）
│   ├── actions/
│   │   └── getPosts.ts            # 投稿取得用Server Action
│   └── post/
│       └── new/
│           ├── page.tsx           # 投稿作成ページ
│           ├── actions/
│           │   └── createPost.ts  # 投稿作成用Server Action
│           └── components/
│               └── PostForm.tsx   # 投稿フォームコンポーネント
├── components/
│   ├── Map.tsx                    # Google Maps地図コンポーネント
│   └── PostCard.tsx               # 投稿カードコンポーネント
└── lib/
    ├── prisma.ts                  # Prismaクライアント
    └── auth.ts                    # 認証ユーティリティ
```

## 🎯 開発ロードマップ

### フェーズ1: MVP構築 ✅
- [x] 投稿機能（位置情報付き）
- [x] Google Maps地図表示
- [x] 投稿一覧表示
- [ ] ログイン機能
- [ ] いいね機能
- [ ] フォロー機能

### フェーズ2: 絞り込み・検索
- [ ] テキスト検索
- [ ] 地図範囲での絞り込み
- [ ] 投稿フィルタリング
- [ ] Google Places APIを使用した場所検索

### フェーズ3: 投稿情報追加
- [ ] 魚種選択
- [ ] ルアー・タックル情報
- [ ] 天候・潮汐情報

### フェーズ4: 釣果カレンダー
- [ ] 個人の釣果カレンダー
- [ ] 統計・分析機能

### フェーズ5: EC連携（将来）
- [ ] 商品情報の紐づけ
- [ ] 購入リンク機能

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 📞 サポート

質問や提案がある場合は、Issueを作成してください。
