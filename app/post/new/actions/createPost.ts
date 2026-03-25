'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { createPostSchema, FormState } from '@/lib/schemas'
import { createFishingArea } from './createFishingArea'
import { getServerUser } from '@/lib/auth'
import { z } from 'zod'

export const createPost = async (
  _prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  try {
    // フォームデータをオブジェクトに変換
    const content = formData.get('content') as string
    const imageUrls = formData.getAll('imageUrls') as string[]
    const latitudeStr = formData.get('latitude') as string
    const longitudeStr = formData.get('longitude') as string
    const fishingAreaId = formData.get('fishingAreaId') as string
    const newAreaName = formData.get('newAreaName') as string
    const newAreaDescription = formData.get('newAreaDescription') as string

    const rawData = {
      content,
      imageUrls: imageUrls.filter(Boolean),
      latitude: latitudeStr ? parseFloat(latitudeStr) : undefined,
      longitude: longitudeStr ? parseFloat(longitudeStr) : undefined,
    }

    // Zodでバリデーション
    const validatedData = createPostSchema.parse(rawData)

    // ログイン中のユーザーを取得
    const cognitoUser = await getServerUser()
    if (!cognitoUser) {
      return { success: false, message: 'ログインが必要です', redirectTo: '/auth' }
    }

    // username はメールアドレス（Cognitoの username_attributes: email 設定による）
    const user = await prisma.user.findUnique({ where: { email: cognitoUser.username } })
    if (!user) {
      return { success: false, message: 'ユーザーが見つかりません' }
    }

    let actualFishingAreaId: string | undefined = fishingAreaId

    // 一時的なエリアIDの場合、実際にエリアを作成
    if (fishingAreaId && fishingAreaId.startsWith('temp-') && validatedData.latitude && validatedData.longitude) {
      const areaResult = await createFishingArea({
        name: newAreaName || undefined,
        centerLat: validatedData.latitude,
        centerLng: validatedData.longitude,
        radius: 200,
        description: newAreaDescription || undefined,
        createdBy: user.id
      })
      
      if (areaResult.success && areaResult.fishingArea) {
        actualFishingAreaId = areaResult.fishingArea.id
      } else {
        actualFishingAreaId = undefined // エリア作成に失敗した場合は座標のみで投稿
      }
    }

    // 投稿を作成
    const post = await prisma.post.create({
      data: {
        userId: user.id,
        content: validatedData.content.trim(),
        imageUrls: validatedData.imageUrls ?? [],
        fishingAreaId: actualFishingAreaId || undefined,
        latitude: validatedData.latitude || undefined,
        longitude: validatedData.longitude || undefined,
      },
      include: {
        user: {
          select: {
            name: true,
            iconUrl: true,
          },
        },
        likes: true,
        fishingArea: true,
      },
    })

    // 釣りエリアの投稿数を更新
    if (actualFishingAreaId) {
      await prisma.fishingArea.update({
        where: { id: actualFishingAreaId },
        data: {
          postCount: {
            increment: 1
          }
        }
      })
    }

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