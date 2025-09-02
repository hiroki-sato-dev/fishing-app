import { PrismaClient } from '@prisma/client'
import { seedUsers } from './src/seed-user'
import { seedFishingAreas } from './src/seed-fishing-area'
import { seedPosts } from './src/seed-post'
import { seedFollows } from './src/seed-follow'
import { seedLikes } from './src/seed-like'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seedデータを投入中...')

  // 既存データのクリア
  console.log('🧹 既存データをクリア中...')
  await prisma.like.deleteMany()
  await prisma.follow.deleteMany()
  await prisma.post.deleteMany()
  await prisma.fishingArea.deleteMany()
  await prisma.user.deleteMany()

  // 各テーブルのSeedデータを順次作成
  const users = await seedUsers(prisma)
  await seedFishingAreas()
  const posts = await seedPosts(prisma, users)
  const follows = await seedFollows(prisma, users)
  const likes = await seedLikes(prisma, users, posts)

  console.log('🎉 Seedデータ投入完了!')
  console.log(`
📊 作成されたデータ:
- ユーザー: ${users.length}人
- 投稿: ${posts.length}件
- フォロー: ${follows.length}件
- いいね: ${likes.length}件
  `)
}

main()
  .catch((e) => {
    console.error('❌ Seedエラー:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })