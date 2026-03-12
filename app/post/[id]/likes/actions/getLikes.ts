'use server'

import { prisma } from '@/lib/prisma'

export const getLikes = async (postId: string) => {
  return prisma.like.findMany({
    where: { postId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      user: { select: { id: true, name: true, iconUrl: true, bio: true } },
    },
  })
}

export const getPostOwner = async (postId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { userId: true },
  })
  return post?.userId ?? null
}
