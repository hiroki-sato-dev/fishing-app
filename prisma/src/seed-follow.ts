import type { PrismaClient, User } from '@prisma/client'

export const seedFollows = async (prisma: PrismaClient, users: User[]) => {
  console.log('👥 フォロー関係データを作成中...')

  const follows = await Promise.all([
    prisma.follow.create({
      data: {
        followerId: users[0].id, // 釣り名人 → 海釣り太郎
        followeeId: users[1].id,
      },
    }),
    prisma.follow.create({
      data: {
        followerId: users[1].id, // 海釣り太郎 → 川釣り花子
        followeeId: users[2].id,
      },
    }),
    prisma.follow.create({
      data: {
        followerId: users[2].id, // 川釣り花子 → 釣り名人
        followeeId: users[0].id,
      },
    }),
    prisma.follow.create({
      data: {
        followerId: users[0].id, // 釣り名人 → 川釣り花子
        followeeId: users[2].id,
      },
    }),
  ])

  console.log(`✅ フォロー関係作成完了: ${follows.length}件`)
  return follows
}