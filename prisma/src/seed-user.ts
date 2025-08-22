import type { PrismaClient } from '@prisma/client'

export const seedUsers = async (prisma: PrismaClient) => {
  console.log('👥 ユーザーデータを作成中...')

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: '釣り名人',
        email: 'master@fishing.com',
        iconUrl: null,
      },
    }),
    prisma.user.create({
      data: {
        name: '海釣り太郎',
        email: 'taro@sea-fishing.com',
        iconUrl: null,
      },
    }),
    prisma.user.create({
      data: {
        name: '川釣り花子',
        email: 'hanako@river-fishing.com',
        iconUrl: null,
      },
    }),
  ])

  console.log(`✅ ユーザー作成完了: ${users.length}人`)
  return users
}