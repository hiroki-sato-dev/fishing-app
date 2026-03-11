'use server'

import { prisma } from '@/lib/prisma'

export const getProfile = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      bio: true,
      iconUrl: true,
      fishingYears: true,
      mainFishing: true,
    },
  })
}
