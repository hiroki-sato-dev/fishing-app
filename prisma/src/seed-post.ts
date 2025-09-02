import type { PrismaClient, User } from '@prisma/client'

export const seedPosts = async (prisma: PrismaClient, users: User[]) => {
  console.log('📝 投稿データを作成中...')

  // 釣りエリアを取得
  const fishingAreas = await prisma.fishingArea.findMany()
  
  if (fishingAreas.length === 0) {
    console.log('No fishing areas found. Please run fishing area seeding first.')
    return []
  }

  const posts = await Promise.all([
    prisma.post.create({
      data: {
        userId: users[0].id, // 釣り名人
        content: '今日は東京湾で大型のタイを釣ることができました！朝早くから頑張った甲斐がありました。天気も良くて最高の釣り日和でした。',
        imageUrls: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop'],
        fishingAreaId: fishingAreas[0].id, // 東京湾お台場エリア
      },
    }),
    prisma.post.create({
      data: {
        userId: users[1].id, // 海釣り太郎
        content: '多摩川河口でアジの大漁！家族みんなで楽しく釣りができました。子供たちも大喜びです。今晩は新鮮なアジフライです🐟',
        imageUrls: ['https://images.unsplash.com/photo-1520637836862-4d197d17c55a?w=400&h=300&fit=crop'],
        fishingAreaId: fishingAreas[1].id, // 多摩川河口
      },
    }),
    prisma.post.create({
      data: {
        userId: users[2].id, // 川釣り花子
        content: '江戸川河口でハゼを釣りました。清流の美しさに癒されます。自然の中での釣りは心が洗われますね。',
        imageUrls: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'],
        fishingAreaId: fishingAreas[2].id, // 江戸川河口
      },
    }),
    prisma.post.create({
      data: {
        userId: users[0].id, // 釣り名人
        content: '葛西臨海公園でファミリーフィッシング。なかなか難しいですが、その分釣れた時の喜びは格別です！',
        fishingAreaId: fishingAreas[3].id, // 葛西臨海公園
      },
    }),
    prisma.post.create({
      data: {
        userId: users[1].id, // 海釣り太郎
        content: '晴海ふ頭での夜釣り。波が高くてスリル満点でした。シーバスが釣れて大満足！',
        imageUrls: ['https://images.unsplash.com/photo-1501436513145-30f24e19fcc4?w=400&h=300&fit=crop'],
        fishingAreaId: fishingAreas[4].id, // 晴海ふ頭
      },
    }),
  ])

  // 各FishingAreaのpostCountを更新
  for (const area of fishingAreas) {
    const postCount = posts.filter(post => post.fishingAreaId === area.id).length
    if (postCount > 0) {
      await prisma.fishingArea.update({
        where: { id: area.id },
        data: { postCount }
      })
    }
  }

  console.log(`✅ 投稿作成完了: ${posts.length}件`)
  return posts
}