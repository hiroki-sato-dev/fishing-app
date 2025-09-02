import { prisma } from '@/lib/prisma'

export const getPosts = async () => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            name: true,
            iconUrl: true,
          },
        },
        fishingArea: {
          select: {
            id: true,
            name: true,
            centerLat: true,
            centerLng: true,
            radius: true,
            description: true,
            postCount: true,
          },
        },
        likes: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      success: true,
      posts,
    }
  } catch (error) {
    console.error('投稿取得エラー:', error)
    return {
      success: false,
      posts: [],
      error: '投稿の取得に失敗しました',
    }
  }
}

export const getFishingAreas = async () => {
  try {
    const fishingAreas = await prisma.fishingArea.findMany({
      include: {
        creator: {
          select: {
            name: true,
            iconUrl: true,
          },
        },
        posts: {
          select: {
            id: true,
            content: true,
            imageUrls: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                iconUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // 最新5件まで
        },
      },
      orderBy: {
        postCount: 'desc', // 投稿数の多い順
      },
    })

    return {
      success: true,
      fishingAreas,
    }
  } catch (error) {
    console.error('釣りエリア取得エラー:', error)
    return {
      success: false,
      fishingAreas: [],
      error: '釣りエリアの取得に失敗しました',
    }
  }
} 