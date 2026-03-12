'use server'

import { prisma } from '@/lib/prisma'
import { getServerUser } from '@/lib/auth'

export const toggleLike = async (postId: string) => {
  const cognitoUser = await getServerUser()
  if (!cognitoUser) return { success: false, message: 'ログインが必要です' }

  const user = await prisma.user.findUnique({
    where: { email: cognitoUser.username },
    select: { id: true },
  })
  if (!user) return { success: false, message: 'ユーザーが見つかりません' }

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  })

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } })
  } else {
    await prisma.like.create({ data: { userId: user.id, postId } })
  }
}
