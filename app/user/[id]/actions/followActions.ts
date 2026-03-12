'use server'

import { prisma } from '@/lib/prisma'
import { getServerUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export const toggleFollow = async (targetUserId: string) => {
  const cognitoUser = await getServerUser()
  if (!cognitoUser) return { success: false, message: 'ログインが必要です' }

  const currentUser = await prisma.user.findUnique({
    where: { email: cognitoUser.username },
    select: { id: true },
  })
  if (!currentUser) return { success: false, message: 'ユーザーが見つかりません' }

  const currentUserId = currentUser.id

  // 自分自身はフォロー不可
  if (currentUserId === targetUserId) return { success: false, message: '自分はフォローできません' }

  // フォロー済みか確認
  const existingFollow = await prisma.follow.findUnique({
    where: { followerId_followeeId: { followerId: currentUserId, followeeId: targetUserId } },
  })

  if (existingFollow) {
    // フォロー解除
    await prisma.follow.delete({ where: { id: existingFollow.id } })
    revalidatePath(`/user/${targetUserId}`)
    return { success: true, status: 'none' }
  }

  // リクエスト済みか確認
  const existingRequest = await prisma.followRequest.findUnique({
    where: { requesterId_requestedId: { requesterId: currentUserId, requestedId: targetUserId } },
  })

  if (existingRequest) {
    // リクエスト取り消し
    await prisma.followRequest.delete({ where: { id: existingRequest.id } })
    revalidatePath(`/user/${targetUserId}`)
    return { success: true, status: 'none' }
  }

  // 対象ユーザーが非公開かどうか確認
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { isPrivate: true },
  })
  if (!targetUser) return { success: false, message: 'ユーザーが見つかりません' }

  if (targetUser.isPrivate) {
    // フォローリクエスト送信
    await prisma.followRequest.create({
      data: { requesterId: currentUserId, requestedId: targetUserId },
    })
    revalidatePath(`/user/${targetUserId}`)
    return { success: true, status: 'requested' }
  } else {
    // 直接フォロー
    await prisma.follow.create({
      data: { followerId: currentUserId, followeeId: targetUserId },
    })
    revalidatePath(`/user/${targetUserId}`)
    return { success: true, status: 'following' }
  }
}
