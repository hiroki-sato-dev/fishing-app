# 5. 技術要件・制約事項

## 5.1 技術スタック

### 5.1.1 フロントエンド
- **フレームワーク**: Next.js 15.5.14（App Router）
- **言語**: TypeScript
- **UIライブラリ**: React + Material-UI
- **スタイリング**: Tailwind CSS
- **地図**: Google Maps JavaScript API（`@vis.gl/react-google-maps` React ラッパー使用）
- **バリデーション**: Zod

### 5.1.2 バックエンド
- **アーキテクチャ**: Server Actions（Next.js App Router）
- **ORM**: Prisma
- **データベース**: PostgreSQL

### 5.1.3 認証・インフラ

#### Phase 1 / Phase 2（現行構成）
- **認証**: AWS Cognito + Amplify
- **アプリホスティング**: Vercel（Next.js App Router に最適化）
- **データベース**: Neon（Serverless PostgreSQL）
- **画像ストレージ**: AWS S3
- **CDN**: AWS CloudFront（永久無料枠 1TB/月）
- **インフラ管理**: Terraform（AWS・Neon・Vercel をすべてコード管理）
- **コンテナ**: Docker（ローカル開発用）

#### Phase 3（将来構成・10,000 MAU 超以降）
- **アプリホスティング**: AWS ECS Fargate（または App Runner）
- **データベース**: Amazon RDS PostgreSQL
- **ロードバランサー**: ALB
- ※ Cognito・S3・CloudFront はそのまま継続

### 5.1.4 開発・運用
- **バージョン管理**: GitHub
- **パッケージ管理**: npm
- **アナリティクス**: Google Analytics
- **IaC**: Terraform（`terraform/` ディレクトリで管理。AWS・Neon・Vercel を一元管理し `terraform apply` で全環境変数まで自動注入）

## 5.2 パフォーマンス要件

### 5.2.1 レスポンス時間
- **ページ読み込み**: 3秒以内（初回）、1秒以内（キャッシュ利用時）
- **地図表示**: 2秒以内
- **投稿作成**: 5秒以内（画像アップロード含む）

### 5.2.2 スケーラビリティ
- **同時接続**: 100ユーザー（初期）→ 1000ユーザー（将来）
- **投稿数**: 10,000件（初期）→ 100,000件（将来）
- **画像容量**: 1GB（初期）→ 100GB（将来）

## 5.3 セキュリティ要件

### 5.3.1 認証・認可
- **パスワード**: AWS Cognitoの標準ポリシー準拠
- **セッション管理**: JWT トークンベース
- **API保護**: 認証必須エンドポイントの適切な保護

### 5.3.2 データ保護
- **HTTPS**: 全通信の暗号化
- **入力検証**: XSS、SQLインジェクション対策
- **ファイルアップロード**: ファイル形式・サイズ制限

## 5.4 対応環境

### 5.4.1 ブラウザ対応
- **モダンブラウザのみ**: Chrome 90+、Firefox 88+、Safari 14+、Edge 90+
- **IE対応**: なし
- **モバイルブラウザ**: iOS Safari、Android Chrome

### 5.4.2 デバイス対応
- **レスポンシブ対応**: スマートフォン・タブレット・PC
- **将来対応**: ネイティブアプリ（モノレポ構成検討）

## 5.5 制約事項

### 5.5.1 外部API制約
- **Google Maps API**: 使用量制限・課金体系に注意
- **Google Maps Map ID**: `AdvancedMarkerElement` の利用に必須。`NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` 環境変数で設定（未設定時は開発用 `DEMO_MAP_ID` にフォールバック）
- **位置情報取得**: ユーザー許可必須、取得失敗時の代替手段

### 5.5.2 データ制限
- **投稿テキスト**: 256文字以内
- **画像ファイル**:
  - 対応形式: JPEG / PNG / WebP / HEIC
  - アップロード前にクライアント側で WebP 変換・圧縮（品質80%、長辺1920px 超の場合はリサイズ）
  - HEIC は Canvas API 非対応のためそのまま送信
  - 変換後ファイルサイズ上限: 5MB（サーバー側チェック）
  - S3 保存パス: 投稿画像 `posts/{uuid}.webp`、プロフィール画像 `users/{uuid}.webp`
  - CloudFront 経由で配信
- **ユーザー名**: 16文字以内
- **画像枚数**: 1投稿あたり4枚まで

### 5.5.3 機能制約
- **リアルタイム性**: 基本的に非リアルタイム（将来的に通知機能で対応）
- **オフライン対応**: なし（将来的にPWA化検討）

## 5.6 開発環境

### 5.6.1 必須環境
- **Node.js**: 18以上
- **PostgreSQL**: 14以上（ローカル開発は Docker）
- **Docker**: 20以上
- **AWS CLI**: 認証設定済み（profile: `fishing-app`）
- **Terraform**: 1.5以上

### 5.6.2 推奨環境
- **IDE**: Visual Studio Code
- **拡張**: ESLint, Prettier, Prisma, TypeScript
- **OS**: macOS, Linux, Windows（WSL2）