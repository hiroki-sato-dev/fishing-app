import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const seedFishingAreas = async () => {
  console.log('🗺️  Seeding fishing areas...')

  // 既存のユーザーを取得（作成者として使用）
  const users = await prisma.user.findMany({ take: 3 })
  
  if (users.length === 0) {
    console.log('No users found. Please run user seeding first.')
    return
  }

  // サンプル釣りエリアを作成
  const fishingAreas = [
    {
      name: '東京湾お台場エリア',
      centerLat: 35.6197,
      centerLng: 139.7753,
      radius: 200,
      description: '東京湾の人気釣りスポット。シーバス、アジ、イワシなどが釣れます',
      createdBy: users[0].id,
      postCount: 5,
    },
    {
      name: '多摩川河口',
      centerLat: 35.5531,
      centerLng: 139.7419,
      radius: 300,
      description: '多摩川と東京湾の合流地点。ハゼ、シーバスの実績あり',
      createdBy: users[1].id,
      postCount: 3,
    },
    {
      name: '江戸川河口',
      centerLat: 35.6644,
      centerLng: 139.9119,
      radius: 250,
      description: '江戸川の河口域。ハゼ釣りのメッカとして有名',
      createdBy: users[2].id,
      postCount: 8,
    },
    {
      name: '葛西臨海公園',
      centerLat: 35.6450,
      centerLng: 139.8572,
      radius: 200,
      description: 'ファミリーフィッシングにも最適な安全な釣り場',
      createdBy: users[0].id,
      postCount: 12,
    },
    {
      name: '晴海ふ頭',
      centerLat: 35.6544,
      centerLng: 139.7719,
      radius: 180,
      description: '都心に近い人気の釣りスポット。夜釣りも楽しめます',
      createdBy: users[1].id,
      postCount: 7,
    }
  ]

  for (const area of fishingAreas) {
    const existingArea = await prisma.fishingArea.findFirst({
      where: {
        AND: [
          { centerLat: { gte: area.centerLat - 0.001, lte: area.centerLat + 0.001 } },
          { centerLng: { gte: area.centerLng - 0.001, lte: area.centerLng + 0.001 } }
        ]
      }
    })

    if (!existingArea) {
      await prisma.fishingArea.create({ data: area })
      console.log(`✅ Created fishing area: ${area.name}`)
    } else {
      console.log(`⏭️  Fishing area already exists: ${area.name}`)
    }
  }

  console.log('🎣 Fishing areas seeding completed!')
}