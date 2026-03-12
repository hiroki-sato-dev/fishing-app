'use server'

import { prisma } from '@/lib/prisma'

export const getFollowers = async (userId: string) => {
  return prisma.follow.findMany({
    where: { followeeId: userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      follower: { select: { id: true, name: true, iconUrl: true, bio: true } },
    },
  })
}

export const getFollowing = async (userId: string) => {
  return prisma.follow.findMany({
    where: { followerId: userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      followee: { select: { id: true, name: true, iconUrl: true, bio: true } },
    },
  })
}

export const getProfileName = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  })
  return user?.name ?? null
}
