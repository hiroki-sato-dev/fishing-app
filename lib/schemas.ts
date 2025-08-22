import { z } from 'zod'

// 投稿作成用スキーマ
export const createPostSchema = z.object({
  content: z.string()
    .min(1, '投稿内容を入力してください')
    .max(256, '256文字以内で入力してください'),
  imageUrl: z.string()
    .url('有効なURL形式で入力してください')
    .optional()
    .or(z.literal('')),
  latitude: z.number()
    .min(-90, '緯度は-90から90の範囲で入力してください')
    .max(90, '緯度は-90から90の範囲で入力してください')
    .optional(),
  longitude: z.number()
    .min(-180, '経度は-180から180の範囲で入力してください')
    .max(180, '経度は-180から180の範囲で入力してください')
    .optional(),
})

export type CreatePostInput = z.infer<typeof createPostSchema>

// フォーム状態の型定義
export type FormState = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}