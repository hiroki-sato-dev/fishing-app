'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// FishingArea作成のスキーマ
const createFishingAreaSchema = z.object({
  name: z.string().max(32).optional(),
  centerLat: z.number().min(-90).max(90),
  centerLng: z.number().min(-180).max(180),
  radius: z.number().min(50).max(1000).default(200),
  description: z.string().max(256).optional(),
  createdBy: z.string()
})

export type CreateFishingAreaInput = z.infer<typeof createFishingAreaSchema>

export async function createFishingArea(input: CreateFishingAreaInput) {
  try {
    // バリデーション
    const validatedInput = createFishingAreaSchema.parse(input)

    // 実際のユーザーを取得（一時的に最初のユーザーを使用）
    const actualUser = await prisma.user.findFirst()
    if (!actualUser) {
      return {
        success: false,
        error: 'ユーザーが見つかりません。'
      }
    }
    
    // createdByを実際のユーザーIDに置き換え
    validatedInput.createdBy = actualUser.id

    // 既存エリアとの重複チェック（半径300m以内に既存エリアがないかチェック）
    const existingAreas = await prisma.fishingArea.findMany({
      where: {
        // 簡単な範囲検索（より厳密には地理的距離計算が必要）
        centerLat: {
          gte: validatedInput.centerLat - 0.003, // 約300m（緯度）
          lte: validatedInput.centerLat + 0.003
        },
        centerLng: {
          gte: validatedInput.centerLng - 0.003, // 約300m（経度、東京近辺）
          lte: validatedInput.centerLng + 0.003
        }
      }
    })

    // より厳密な距離計算で重複チェック
    const OVERLAP_THRESHOLD = 100 // 100m以内は重複とみなす
    
    for (const existingArea of existingAreas) {
      const distance = calculateDistance(
        validatedInput.centerLat,
        validatedInput.centerLng,
        existingArea.centerLat,
        existingArea.centerLng
      )
      
      if (distance < OVERLAP_THRESHOLD) {
        return {
          success: false,
          error: 'この位置には既に釣りエリアが存在します。既存のエリアをご利用ください。',
          existingArea
        }
      }
    }

    // 新しいエリアを作成
    const fishingArea = await prisma.fishingArea.create({
      data: {
        name: validatedInput.name,
        centerLat: validatedInput.centerLat,
        centerLng: validatedInput.centerLng,
        radius: validatedInput.radius,
        description: validatedInput.description,
        createdBy: validatedInput.createdBy,
        postCount: 0
      }
    })

    // キャッシュを更新
    revalidatePath('/home')
    revalidatePath('/post/new')

    return {
      success: true,
      fishingArea
    }
  } catch (error) {
    console.error('Error creating fishing area:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'データの形式が正しくありません。',
        validationErrors: error.issues
      }
    }

    return {
      success: false,
      error: '釣りエリアの作成に失敗しました。'
    }
  }
}

// 2点間の距離を計算（メートル）
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3 // 地球の半径（メートル）
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + 
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}