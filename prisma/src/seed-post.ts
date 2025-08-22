import type { PrismaClient, User } from '@prisma/client'

export const seedPosts = async (prisma: PrismaClient, users: User[]) => {
  console.log('📝 投稿データを作成中...')

  const posts = await Promise.all([
    prisma.post.create({
      data: {
        userId: users[0].id, // 釣り名人
        content: '今日は東京湾で大型のタイを釣ることができました！朝早くから頑張った甲斐がありました。天気も良くて最高の釣り日和でした。',
        imageUrls: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop'],
        latitude: 35.6762,
        longitude: 139.6503,
      },
    }),
    prisma.post.create({
      data: {
        userId: users[1].id, // 海釣り太郎
        content: '相模湾でアジの大漁！家族みんなで楽しく釣りができました。子供たちも大喜びです。今晩は新鮮なアジフライです🐟',
        imageUrls: ['https://images.unsplash.com/photo-1520637836862-4d197d17c55a?w=400&h=300&fit=crop'],
        latitude: 35.3050,
        longitude: 139.5439,
      },
    }),
    prisma.post.create({
      data: {
        userId: users[2].id, // 川釣り花子
        content: '多摩川上流でヤマメを釣りました。清流の美しさに癒されます。自然の中での釣りは心が洗われますね。',
        imageUrls: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'],
        latitude: 35.7273,
        longitude: 139.3218,
      },
    }),
    prisma.post.create({
      data: {
        userId: users[0].id, // 釣り名人
        content: '江戸川でバス釣りに挑戦。なかなか難しいですが、その分釣れた時の喜びは格別です！',
        latitude: 35.7063,
        longitude: 139.8687,
      },
    }),
    prisma.post.create({
      data: {
        userId: users[1].id, // 海釣り太郎
        content: '房総半島の磯釣り。波が高くてスリル満点でした。イシダイが釣れて大満足！',
        imageUrls: ['https://images.unsplash.com/photo-1501436513145-30f24e19fcc4?w=400&h=300&fit=crop'],
        latitude: 35.0231,
        longitude: 140.1056,
      },
    }),
  ])

  console.log(`✅ 投稿作成完了: ${posts.length}件`)
  return posts
}