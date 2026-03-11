'use server'

import { prisma } from '@/lib/prisma'

export const getPost = async (id: string) => {
  return prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      content: true,
      imageUrls: true,
      createdAt: true,
      user: { select: { id: true, name: true, iconUrl: true } },
      fishingArea: {
        select: {
          id: true,
          name: true,
          centerLat: true,
          centerLng: true,
          radius: true,
        },
      },
      likes: { select: { id: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: { select: { id: true, name: true, iconUrl: true } },
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
