'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { createPostSchema, FormState } from '@/lib/schemas'
import { z } from 'zod'

export const createPost = async (
  _prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  try {
    // フォームデータをオブジェクトに変換
    const content = formData.get('content') as string
    const imageUrl = formData.get('imageUrl') as string
    const latitudeStr = formData.get('latitude') as string
    const longitudeStr = formData.get('longitude') as string

    const rawData = {
      content,
      imageUrl: imageUrl || undefined,
      latitude: latitudeStr ? parseFloat(latitudeStr) : undefined,
      longitude: longitudeStr ? parseFloat(longitudeStr) : undefined,
    }

    // Zodでバリデーション
    const validatedData = createPostSchema.parse(rawData)
    
    // 最初のユーザーを取得（簡単のため）
    const user = await prisma.user.findFirst()
    if (!user) {
      return {
        success: false,
        message: 'ユーザーが見つかりません'
      }
    }

    // 投稿を作成
    const post = await prisma.post.create({
      data: {
        userId: user.id,
        content: validatedData.content.trim(),
        latitude: validatedData.latitude || null,
        longitude: validatedData.longitude || null,
        imageUrls: validatedData.imageUrl ? [validatedData.imageUrl] : [],
      },
      include: {
        user: {
          select: {
            name: true,
            iconUrl: true,
          },
        },
        likes: true,
      },
    })

    console.log('投稿が作成されました:', post.id)
    revalidatePath('/home')
    
    return {
      success: true,
      message: '投稿が作成されました',
      redirectTo: '/home'
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {}
      error.issues.forEach((issue) => {
        const path = issue.path.join('.')
        if (!fieldErrors[path]) {
          fieldErrors[path] = []
        }
        fieldErrors[path].push(issue.message)
      })
      
      return {
        success: false,
        message: 'バリデーションエラーが発生しました',
        errors: fieldErrors
      }
    }
    console.error('投稿作成エラー:', error)
    return { 
      success: false, 
      message: '投稿の作成に失敗しました' 
    }
  }
}