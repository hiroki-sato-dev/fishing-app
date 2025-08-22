import type { PrismaClient, User, Post } from '@prisma/client'

export const seedLikes = async (prisma: PrismaClient, users: User[], posts: Post[]) => {
  console.log('❤️ いいねデータを作成中...')

  const likes = await Promise.all([
    // 釣り名人の投稿（東京湾のタイ）にいいね
    prisma.like.create({
      data: {
        userId: users[1].id, // 海釣り太郎がいいね
        postId: posts[0].id,
      },
    }),
    prisma.like.create({
      data: {
        userId: users[2].id, // 川釣り花子がいいね
        postId: posts[0].id,
      },
    }),

    // 海釣り太郎の投稿（相模湾のアジ）にいいね
    prisma.like.create({
      data: {
        userId: users[0].id, // 釣り名人がいいね
        postId: posts[1].id,
      },
    }),
    prisma.like.create({
      data: {
        userId: users[2].id, // 川釣り花子がいいね
        postId: posts[1].id,
      },
    }),

    // 川釣り花子の投稿（多摩川のヤマメ）にいいね
    prisma.like.create({
      data: {
        userId: users[0].id, // 釣り名人がいいね
        postId: posts[2].id,
      },
    }),
    prisma.like.create({
      data: {
        userId: users[1].id, // 海釣り太郎がいいね
        postId: posts[2].id,
      },
    }),
  ])

  console.log(`✅ いいね作成完了: ${likes.length}件`)
  return likes
}