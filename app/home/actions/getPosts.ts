import { prisma } from '@/lib/prisma'

export const getFollowingIds = async (userId: string): Promise<Set<string>> => {
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followeeId: true },
  })
  return new Set(follows.map(f => f.followeeId))
}

export const checkDbUserExists = async (email: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })
  return !!user
}

export const getPosts = async (userIds?: string[]) => {
  try {
    const posts = await prisma.post.findMany({
      where: userIds ? { userId: { in: userIds } } : undefined,
      include: {
        user: {
          select: {
            id: true,
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
            userId: true,
          },
        },
        comments: {
          select: {
            id: true,
            user: { select: { id: true, iconUrl: true, name: true } },
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