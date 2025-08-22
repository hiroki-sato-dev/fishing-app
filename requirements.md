# 釣りSNSアプリ 要件定義書

## 1. プロジェクト概要

### 1.1 プロジェクト名
釣りSNSアプリ

### 1.2 開発目的・ビジョン
釣りをもっと身近に、もっと楽しく。老若男女・素人から玄人までが楽しめる釣りSNSを作る。

### 1.3 背景と課題
- **素人**: どこで何を使えば釣れるのか分からず、参入障壁が高い
- **中級者**: もっと釣果を伸ばしたいけど情報が散在している
- **玄人**: 仲間と楽しみたい、情報を発信したい

### 1.4 コンセプト
- 投稿＋位置情報＋道具情報で釣果を記録・共有
- 地図×SNSで、誰でも「釣れる体験」を得られる
- コミュニティ化やEC連携を通じて、釣り体験がこのアプリで完結する世界を目指す

## 2. 機能要件

### 2.1 ユーザー管理・認証機能

#### 2.1.1 ユーザー登録
- **必須項目**: 名前、メールアドレス
- **任意項目**: プロフィール画像、釣り歴、メインの釣りもの
- **制限事項**: 
  - ユーザー名: 16文字以内
  - プロフィール画像: Twitter同等のファイルサイズ制限

#### 2.1.2 認証システム
- AWS Cognito + Amplifyによる認証
- ゲストユーザー: 投稿閲覧・地図表示可能
- ログインユーザー: フォロー・いいね・コメント・投稿作成可能

#### 2.1.3 プライバシー設定
- **公開アカウント**: 即座にフォロー可能、投稿は全体公開
- **鍵付きアカウント**: フォロー申請→承認制、投稿はフォロワーのみ表示

### 2.2 投稿機能

#### 2.2.1 投稿作成
- **投稿内容**: テキスト（256文字以内、必須）
- **画像**: 最大4枚まで添付可能（任意）
- **位置情報**: 任意（緯度・経度の自動取得、手動入力も可能）
- **投稿時間**: 自動記録

#### 2.2.2 投稿管理
- **編集**: 投稿者本人のみ可能（位置情報は編集不可）
- **削除**: 投稿者本人のみ可能
- **公開範囲**: アカウント設定に準拠

#### 2.2.3 投稿表示
- **一覧表示**: 時系列順（最新順）
- **地図表示**: 位置情報に基づくピン表示
- **フィルタリング**: ズームレベルに応じた表示制御

### 2.3 ソーシャル機能

#### 2.3.1 フォロー機能
- **公開アカウント**: 即座にフォロー
- **鍵付きアカウント**: 申請→承認制
- **フォロー一覧**: フォロー中・フォロワー表示

#### 2.3.2 いいね機能
- 投稿に対するいいね
- いいね数の表示
- 自分がいいねした投稿の管理

#### 2.3.3 コメント機能
- 投稿に対するコメント投稿
- コメント一覧表示
- コメントの編集・削除（投稿者のみ）

### 2.4 地図機能

#### 2.4.1 地図表示
- **初期表示**: ユーザーの現在地
- **地図サービス**: Google Maps JavaScript API
- **操作**: ズーム、パン、ピンタップ

#### 2.4.2 投稿ピン表示
- **個別ピン**: 投稿数が少ない場合
- **クラスタリング**: 投稿数が多い場合は統合表示、拡大で分離
- **ズーム連動**: ズームレベルに応じた表示制御

#### 2.4.3 ピンインタラクション
- ピンタップで投稿詳細表示
- 地図移動で表示エリアの投稿更新

## 3. データモデル

### 3.1 データベース設計

#### 3.1.1 User（ユーザー）
```prisma
model User {
  id           String   @id @default(cuid())
  name         String   // ユーザー名（16文字以内）
  email        String   @unique
  iconUrl      String?  // プロフィール画像URL
  bio          String?  // 自己紹介
  fishingYears Int?     // 釣り歴（年数）
  mainFishing  String?  // メインの釣りもの
  isPrivate    Boolean  @default(false) // 鍵付きアカウント
  createdAt    DateTime @default(now())
  
  // リレーション
  posts        Post[]
  likes        Like[]
  comments     Comment[]
  followers    Follow[] @relation("Followee")
  following    Follow[] @relation("Follower")
  followRequests FollowRequest[] @relation("RequestedUser")
  sentRequests   FollowRequest[] @relation("RequesterUser")
}
```

#### 3.1.2 Post（投稿）
```prisma
model Post {
  id         String   @id @default(cuid())
  userId     String
  content    String   // 投稿内容（256文字以内、必須）
  imageUrls  String[] // 画像URL配列（最大4枚）
  latitude   Float?   // 緯度（任意）
  longitude  Float?   // 経度（任意）
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  // リレーション
  user       User      @relation(fields: [userId], references: [id])
  likes      Like[]
  comments   Comment[]
}
```

#### 3.1.3 Like（いいね）
```prisma
model Like {
  id      String @id @default(cuid())
  userId  String
  postId  String
  createdAt DateTime @default(now())
  
  // リレーション
  user    User   @relation(fields: [userId], references: [id])
  post    Post   @relation(fields: [postId], references: [id])
  
  @@unique([userId, postId])
}
```

#### 3.1.4 Comment（コメント）
```prisma
model Comment {
  id        String   @id @default(cuid())
  userId    String
  postId    String
  content   String   // コメント内容
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // リレーション
  user      User     @relation(fields: [userId], references: [id])
  post      Post     @relation(fields: [postId], references: [id])
}
```

#### 3.1.5 Follow（フォロー関係）
```prisma
model Follow {
  id         String   @id @default(cuid())
  followerId String
  followeeId String
  createdAt  DateTime @default(now())
  
  // リレーション
  follower   User     @relation("Follower", fields: [followerId], references: [id])
  followee   User     @relation("Followee", fields: [followeeId], references: [id])
  
  @@unique([followerId, followeeId])
}
```

#### 3.1.6 FollowRequest（フォロー申請）
```prisma
model FollowRequest {
  id          String   @id @default(cuid())
  requesterId String   // 申請者
  requestedId String   // 申請先
  status      String   @default("pending") // pending, approved, rejected
  createdAt   DateTime @default(now())
  
  // リレーション
  requester   User     @relation("RequesterUser", fields: [requesterId], references: [id])
  requested   User     @relation("RequestedUser", fields: [requestedId], references: [id])
  
  @@unique([requesterId, requestedId])
}
```

### 3.2 将来拡張予定のモデル（フェーズ3以降）

#### 3.2.1 FishSpecies（魚種）
```prisma
model FishSpecies {
  id        String @id @default(cuid())
  name      String // 魚種名
  category  String // カテゴリ（海水魚/淡水魚など）
  // Postにリレーション追加予定
}
```

#### 3.2.2 Tackle（タックル情報）
```prisma
model Tackle {
  id          String @id @default(cuid())
  type        String // ロッド、リール、ライン等
  brand       String // メーカー
  model       String // 型番
  description String // 詳細
  // Postにリレーション追加予定
}
```

## 4. UI/UX要件

### 4.1 デザインガイドライン

#### 4.1.1 基本コンセプト
- **シンプルで直感的**: 釣り初心者でも迷わず使える操作性
- **自然な色合い**: 水や自然をイメージした落ち着いた色調
- **モバイルファースト**: スマートフォンでの使用を最優先

#### 4.1.2 カラーパレット
- **プライマリ**: ブルー系（`#3B82F6`）- 水をイメージ
- **セカンダリ**: グレー系（`#6B7280`）- 落ち着いた印象
- **アクセント**: 釣りに関連する自然色（緑、オレンジなど）

### 4.2 レスポンシブデザイン

#### 4.2.1 対応デバイス
- **スマートフォン**: 375px〜 （iPhone SE以上）
- **タブレット**: 768px〜 （iPad以上）
- **デスクトップ**: 1024px〜 （PC画面）

#### 4.2.2 ブレイクポイント
```css
/* スマートフォン */
@media (max-width: 767px) { /* モバイル専用スタイル */ }

/* タブレット */
@media (min-width: 768px) and (max-width: 1023px) { /* タブレット専用 */ }

/* デスクトップ */
@media (min-width: 1024px) { /* デスクトップ専用 */ }
```

### 4.3 画面構成・ナビゲーション

#### 4.3.1 共通レイアウト
- **ヘッダー**: ロゴ、ユーザーアイコン、通知アイコン
- **メイン**: 各ページのコンテンツエリア
- **ナビゲーション**: 下部固定（モバイル）/ サイドバー（デスクトップ）

#### 4.3.2 主要ページ構成
1. **ホーム画面**: 地図 + 投稿フィード
2. **投稿作成**: フォーム + 位置情報取得
3. **プロフィール**: ユーザー情報 + 投稿履歴
4. **フォロー管理**: フォロー・フォロワー一覧
5. **設定**: アカウント設定・プライバシー設定

### 4.4 インタラクション・フィードバック

#### 4.4.1 ローディング状態
- **投稿読み込み**: スケルトンローダー表示
- **地図読み込み**: ローディングスピナー
- **画像アップロード**: プログレスバー

#### 4.4.2 エラーハンドリング
- **ネットワークエラー**: 再試行ボタン付きメッセージ
- **位置情報エラー**: 手動入力への誘導
- **バリデーションエラー**: フィールド単位でのエラー表示

#### 4.4.3 成功フィードバック
- **投稿完了**: トーストメッセージ + 自動遷移
- **いいね**: アニメーション付きカウント更新
- **フォロー**: ボタンステータス変更

### 4.5 アクセシビリティ

#### 4.5.1 基本対応
- **キーボードナビゲーション**: Tab順序の最適化
- **スクリーンリーダー**: 適切なaria-label設定
- **コントラスト**: WCAG 2.1 AA準拠

#### 4.5.2 ユーザビリティ
- **タッチターゲット**: 最小44px以上
- **フォントサイズ**: 最小16px（モバイル）
- **操作フィードバック**: 視覚的・触覚的フィードバック

## 5. 技術要件・制約事項

### 5.1 技術スタック

#### 5.1.1 フロントエンド
- **フレームワーク**: Next.js 15（App Router）
- **言語**: TypeScript
- **UIライブラリ**: React + Material-UI
- **スタイリング**: Tailwind CSS
- **地図**: Google Maps JavaScript API

#### 5.1.2 バックエンド
- **アーキテクチャ**: Server Actions（Next.js App Router）
- **ORM**: Prisma
- **データベース**: PostgreSQL

#### 5.1.3 認証・インフラ
- **認証**: AWS Cognito + Amplify
- **画像管理**: AWS S3 + CloudFront
- **インフラ**: AWS（EC2/ECS、RDS等）
- **コンテナ**: Docker

#### 5.1.4 開発・運用
- **バージョン管理**: GitHub
- **パッケージ管理**: npm
- **アナリティクス**: Google Analytics

### 5.2 パフォーマンス要件

#### 5.2.1 レスポンス時間
- **ページ読み込み**: 3秒以内（初回）、1秒以内（キャッシュ利用時）
- **地図表示**: 2秒以内
- **投稿作成**: 5秒以内（画像アップロード含む）

#### 5.2.2 スケーラビリティ
- **同時接続**: 100ユーザー（初期）→ 1000ユーザー（将来）
- **投稿数**: 10,000件（初期）→ 100,000件（将来）
- **画像容量**: 1GB（初期）→ 100GB（将来）

### 5.3 セキュリティ要件

#### 5.3.1 認証・認可
- **パスワード**: AWS Cognitoの標準ポリシー準拠
- **セッション管理**: JWT トークンベース
- **API保護**: 認証必須エンドポイントの適切な保護

#### 5.3.2 データ保護
- **HTTPS**: 全通信の暗号化
- **入力検証**: XSS、SQLインジェクション対策
- **ファイルアップロード**: ファイル形式・サイズ制限

### 5.4 対応環境

#### 5.4.1 ブラウザ対応
- **モダンブラウザのみ**: Chrome 90+、Firefox 88+、Safari 14+、Edge 90+
- **IE対応**: なし
- **モバイルブラウザ**: iOS Safari、Android Chrome

#### 5.4.2 デバイス対応
- **レスポンシブ対応**: スマートフォン・タブレット・PC
- **将来対応**: ネイティブアプリ（モノレポ構成検討）

### 5.5 制約事項

#### 5.5.1 外部API制約
- **Google Maps API**: 使用量制限・課金体系に注意
- **位置情報取得**: ユーザー許可必須、取得失敗時の代替手段

#### 5.5.2 データ制限
- **投稿テキスト**: 256文字以内
- **画像ファイル**: Twitter同等のサイズ制限
- **ユーザー名**: 16文字以内
- **画像枚数**: 1投稿あたり4枚まで

#### 5.5.3 機能制約
- **リアルタイム性**: 基本的に非リアルタイム（将来的に通知機能で対応）
- **オフライン対応**: なし（将来的にPWA化検討）

## 6. 開発方針・コーディング規約

### 6.1 アーキテクチャ方針

#### 6.1.1 Next.js App Router パターン
- **Server Components**: デフォルトでサーバーコンポーネントを使用
- **Client Components**: 必要な場合のみ`'use client'`で明示的に指定
- **Server Actions**: データの変更処理には Server Actions を使用

#### 6.1.2 ディレクトリ構成
```
app/
├── page.tsx                     # ホーム画面（地図＋投稿一覧）
├── layout.tsx                   # ルートレイアウト
├── providers.tsx                # クライアント側プロバイダー
├── post/
│   └── new/
│       ├── page.tsx            # 投稿作成ページ
│       ├── actions/            # Server Actions（ローカル）
│       │   └── createPost.ts
│       └── components/         # コンポーネント（ローカル）
│           └── PostFormClient.tsx
├── user/
│   └── [userId]/
│       ├── page.tsx            # ユーザー詳細
│       └── actions/
└── ...

components/                      # 共有コンポーネント
├── Header.tsx
├── Footer.tsx
└── SimpleMap.tsx

lib/                            # ユーティリティ・設定
├── prisma.ts                   # Prisma クライアント
└── auth.ts                     # 認証ヘルパー
```

### 6.2 コーディング規約

#### 6.2.1 基本方針
- **関数定義**: 全てアロー関数で統一（`const func = async () => {}`）
- **useEffect禁止**: 基本的に使用しない（サーバーコンポーネント中心）
- **JSX内ロジック禁止**: JSXファイル内では整形済みデータのみ使用
- **コンポーネント分割**: むやみやたらに分割せず、適切な粒度を保つ

#### 6.2.2 TypeScript規約
```typescript
// ✅ 推奨：アロー関数
const getPosts = async (): Promise<Post[]> => {
  return await prisma.post.findMany()
}

// ❌ 非推奨：function宣言
function getPosts(): Promise<Post[]> {
  return prisma.post.findMany()
}

// ✅ 推奨：型定義（typeを使用）
type PostFormData = {
  content: string
  imageUrls?: string[]
  latitude?: number
  longitude?: number
}

// ✅ 推奨：Server Action
export const createPost = async (formData: FormData): Promise<ActionResult> => {
  // 処理
}
```

#### 6.2.3 JSX/TSX規約
```tsx
// ✅ 推奨：データは事前に整形
const PostList = ({ posts }: { posts: FormattedPost[] }) => {
  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

// ❌ 非推奨：JSX内でのメソッド展開
const PostList = ({ posts }: { posts: Post[] }) => {
  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>
          {post.createdAt.toLocaleDateString()} {/* NG */}
          {formatDate(post.createdAt)} {/* NG */}
        </div>
      ))}
    </div>
  )
}
```

#### 6.2.4 ファイル命名規約
- **コンポーネント**: PascalCase（`PostCard.tsx`）
- **Server Actions**: camelCase（`createPost.ts`）
- **ユーティリティ**: camelCase（`formatDate.ts`）
- **ページファイル**: Next.js規約に準拠（`page.tsx`, `layout.tsx`）

### 6.3 状態管理方針

#### 6.3.1 基本方針
- **ローカル状態**: React の `useState` を最小限に使用
- **サーバー状態**: Server Components + Server Actions で管理
- **クライアント状態**: 必要最小限（フォーム入力、UI状態のみ）

#### 6.3.2 データフロー
```
User Input → Client Component → Server Action → Database → Server Component → UI
```

### 6.4 バリデーション・フォーム処理

#### 6.4.1 Zodスキーマ定義
```typescript
import { z } from 'zod'

// 投稿作成用スキーマ
const createPostSchema = z.object({
  content: z.string().min(1, '投稿内容を入力してください').max(256, '256文字以内で入力してください'),
  imageUrls: z.array(z.string().url()).max(4, '画像は4枚まで投稿できます').optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
})

type CreatePostInput = z.infer<typeof createPostSchema>
```

#### 6.4.2 Server Actions（useActionState使用）
```typescript
export const createPost = async (
  _prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  try {
    // フォームデータをオブジェクトに変換
    const rawData = {
      content: formData.get('content'),
      latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : undefined,
      longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : undefined,
      // 画像URLの処理...
    }

    // Zodでバリデーション
    const validatedData = createPostSchema.parse(rawData)
    
    // データベース処理
    const post = await prisma.post.create({
      data: {
        ...validatedData,
        userId: user.id,
      }
    })
    
    revalidatePath('/home')
    return { success: true, message: '投稿が作成されました' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'バリデーションエラー',
        errors: error.flatten().fieldErrors
      }
    }
    console.error('投稿作成エラー:', error)
    return { 
      success: false, 
      message: '投稿の作成に失敗しました' 
    }
  }
}
```

#### 6.4.3 Client Components（useActionState使用）
```typescript
'use client'
import { useActionState } from 'react'

const PostForm = () => {
  const [state, formAction, isPending] = useActionState(createPost, {
    success: false,
    message: '',
  })
  
  return (
    <form action={formAction}>
      <textarea name="content" required />
      {state.errors?.content && (
        <ErrorMessage>{state.errors.content[0]}</ErrorMessage>
      )}
      
      <button type="submit" disabled={isPending}>
        {isPending ? '投稿中...' : '投稿する'}
      </button>
      
      {state.message && (
        <div className={state.success ? 'success' : 'error'}>
          {state.message}
        </div>
      )}
    </form>
  )
}
```

## 7. フェーズ別実装計画

### 7.1 フェーズ1: MVP構築（基本機能）

#### 7.1.1 目標
釣りSNSの基本機能を実装し、ユーザーが投稿・閲覧・交流できる最小限の機能を提供

#### 7.1.2 実装機能
- [x] **投稿機能**: 位置情報付き投稿の作成・編集・削除
- [x] **地図表示**: Google Maps APIを使用した投稿ピン表示
- [x] **投稿一覧**: 時系列での投稿表示
- [ ] **ユーザー認証**: AWS Cognitoでのログイン・ログアウト
- [ ] **いいね機能**: 投稿への反応機能
- [ ] **フォロー機能**: ユーザー同士のフォロー関係

#### 7.1.3 実装順序
1. **認証システム整備**: AWS Cognito完全対応
2. **いいね機能実装**: Like テーブル＋UI
3. **フォロー機能実装**: Follow・FollowRequest テーブル＋UI
4. **プライバシー設定**: 鍵付きアカウント機能
5. **コメント機能**: Comment テーブル＋UI

### 7.2 フェーズ2: 検索・絞り込み機能

#### 7.2.1 目標
ユーザーが求める釣り情報を効率的に見つけられるよう、検索・絞り込み機能を充実

#### 7.2.2 実装機能
- [ ] **テキスト検索**: 投稿内容での検索
- [ ] **地図範囲絞り込み**: 表示エリアに応じた投稿フィルタ
- [ ] **投稿フィルタリング**: 日付・ユーザー等での絞り込み
- [ ] **位置検索**: Google Places APIを使用した場所検索

#### 7.2.3 技術的実装
- **検索インデックス**: PostgreSQL全文検索またはElasticsearch
- **地理検索**: PostGIS拡張の活用検討
- **キャッシュ戦略**: Redis導入検討

### 7.3 フェーズ3: 釣り情報の詳細化

#### 7.3.1 目標
投稿に釣り特有の情報を追加し、より専門的で価値の高い情報共有を実現

#### 7.3.2 実装機能
- [ ] **魚種選択**: 釣れた魚の種類選択機能
- [ ] **ルアー・タックル情報**: 使用した道具の記録
- [ ] **天候・潮汐情報**: 外部APIから自動取得
- [ ] **釣果統計**: ユーザー・全体での釣果分析

#### 7.3.3 データモデル拡張
```prisma
// Postモデルに追加
model Post {
  // 既存フィールド...
  fishSpecies String[]  // 魚種（複数選択可能）
  lures       String[]  // 使用ルアー
  rods        String?   // ロッド情報
  weather     String?   // 天候
  tideInfo    String?   // 潮汐情報
  waterTemp   Float?    // 水温
}
```

### 7.4 フェーズ4: 個人釣果管理

#### 7.4.1 目標
個人の釣果を体系的に管理・分析できる機能を提供

#### 7.4.2 実装機能
- [ ] **釣果カレンダー**: 個人の釣果をカレンダー形式で表示
- [ ] **統計・分析**: 月別・魚種別の釣果分析
- [ ] **釣り日記**: 個人の釣行記録管理
- [ ] **目標設定**: 釣果目標の設定・達成管理

#### 7.4.3 新機能
- **データ可視化**: Chart.jsによるグラフ表示
- **PDF出力**: 釣果レポートのPDF生成
- **データエクスポート**: CSV形式でのデータ出力

### 7.5 フェーズ5: EC連携・収益化

#### 7.5.1 目標
投稿された釣り道具に関連する商品情報を連携し、収益化を図る

#### 7.5.2 実装機能
- [ ] **商品情報連携**: 楽天・Amazon APIとの連携
- [ ] **購入リンク**: 投稿から直接商品購入へ誘導
- [ ] **レビュー機能**: 道具のレビュー・評価システム
- [ ] **おすすめ機能**: AIによる道具推薦

#### 7.5.3 収益モデル
- **アフィリエイト**: 商品購入時の手数料収入
- **プレミアム機能**: 詳細分析・広告非表示などの有料機能
- **企業連携**: 釣り具メーカーとのタイアップ

### 7.6 技術的ロードマップ

#### 7.6.1 インフラ改善
- **フェーズ1後**: Docker Compose → AWS ECS移行
- **フェーズ2後**: CDN導入・画像最適化
- **フェーズ3後**: マイクロサービス化検討
- **フェーズ4後**: モバイルアプリ開発（React Native）

#### 7.6.2 パフォーマンス対応
- **キャッシュ戦略**: Redis導入
- **画像最適化**: WebP対応・遅延読み込み
- **DB最適化**: インデックス最適化・レプリケーション
- **CDN活用**: 静的リソースの配信最適化

---

*要件定義書の作成が完了しました。この文書を元に段階的な開発を進めていきます。*