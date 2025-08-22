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