# 6. 開発方針・コーディング規約

## 6.1 アーキテクチャ方針

### 6.1.1 Next.js App Router パターン
- **Server Components**: デフォルトでサーバーコンポーネントを使用
- **Client Components**: 必要な場合のみ`'use client'`で明示的に指定
- **Server Actions**: データの変更処理・データ取得処理には Server Actions を使用

### 6.1.2 データ取得・変更の規約（重要）

**Prisma のクエリは必ず `actions/` ファイルに分離する。`page.tsx` 内に直接 Prisma クエリを書かない。**

```
app/
└── post/
    └── [id]/
        ├── page.tsx            # ✅ actions を呼び出すだけ
        ├── actions/
        │   ├── getPost.ts      # ✅ Prisma でデータ取得
        │   └── commentActions.ts  # ✅ Prisma でデータ変更
        └── CommentSection.tsx
```

```typescript
// ✅ 推奨: page.tsx でのデータ取得
// app/post/[id]/page.tsx
import { getPost } from './actions/getPost'

export default async function PostPage({ params }) {
  const post = await getPost(params.id)
  if (!post) notFound()
  return <PostDetail post={post} />
}

// ✅ 推奨: actions/getPost.ts
export const getPost = async (id: string) => {
  return prisma.post.findUnique({ where: { id }, select: { ... } })
}

// ❌ 非推奨: page.tsx に直接 Prisma クエリを書く
export default async function PostPage({ params }) {
  const post = await prisma.post.findUnique({ where: { id: params.id } }) // NG
}
```

### 6.1.2 ディレクトリ構成
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

## 6.2 コーディング規約

### 6.2.1 基本方針
- **関数定義**: 全てアロー関数で統一（`const func = async () => {}`）
- **useEffect禁止**: 基本的に使用しない（サーバーコンポーネント中心）
- **JSX内ロジック禁止**: JSXファイル内では整形済みデータのみ使用
- **コンポーネント分割**: むやみやたらに分割せず、適切な粒度を保つ

### 6.2.2 TypeScript規約
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

### 6.2.3 JSX/TSX規約
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

### 6.2.4 ファイル命名規約
- **コンポーネント**: PascalCase（`PostCard.tsx`）
- **Server Actions**: camelCase（`createPost.ts`）
- **ユーティリティ**: camelCase（`formatDate.ts`）
- **ページファイル**: Next.js規約に準拠（`page.tsx`, `layout.tsx`）

## 6.3 状態管理方針

### 6.3.1 基本方針
- **ローカル状態**: React の `useState` を最小限に使用
- **サーバー状態**: Server Components + Server Actions で管理
- **クライアント状態**: 必要最小限（フォーム入力、UI状態のみ）

### 6.3.2 データフロー
```
User Input → Client Component → Server Action → Database → Server Component → UI
```

## 6.4 バリデーション・フォーム処理

### 6.4.1 Zodスキーマ定義
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

### 6.4.2 Server Actions（useActionState使用）
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

### 6.4.3 Client Components（useActionState使用）
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

## 6.5 テスト方針

### 6.5.1 テスト戦略
- **Unit Test**: ユーティリティ関数・バリデーション
- **Integration Test**: Server Actions・API連携
- **E2E Test**: 主要なユーザーフロー

### 6.5.2 テストツール
- **Unit/Integration**: Jest + React Testing Library
- **E2E**: Playwright
- **型チェック**: TypeScript strict mode