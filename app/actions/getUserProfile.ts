'use server'

import { getServerUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export type UserProfile = {
  id: string
  name: string
  iconUrl: string | null
}

export const getUserProfile = async (): Promise<UserProfile | null> => {
  const cognitoUser = await getServerUser()
  if (!cognitoUser) return null

  const user = await prisma.user.findUnique({
    where: { email: cognitoUser.username },
    select: { id: true, name: true, iconUrl: true },
  })

  return user ?? null
}
