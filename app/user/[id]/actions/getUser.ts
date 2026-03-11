'use server'

import { prisma } from '@/lib/prisma'

export const getUser = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      iconUrl: true,
      bio: true,
      fishingYears: true,
      mainFishing: true,
      isPrivate: true,
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
      posts: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          imageUrls: true,
          fishingAreaId: true,
          createdAt: true,
          updatedAt: true,
          user: { select: { id: true, name: true, iconUrl: true } },
          fishingArea: {
            select: {
              id: true,
              name: true,
              centerLat: true,
              centerLng: true,
              radius: true,
              description: true,
              postCount: true,
            },
          },
          likes: { select: { id: true } },
        },
      },
    },
  })
}

export const getCurrentDbUserId = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })
  return user?.id ?? null
}
