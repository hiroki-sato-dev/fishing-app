import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserSettingsForm } from './UserSettingsForm'

export default async function UserSettingsPage() {
  const cognitoUser = await getServerUser()
  if (!cognitoUser) redirect('/auth')

  const user = await prisma.user.findUnique({
    where: { email: cognitoUser.username },
    select: {
      id: true,
      name: true,
      bio: true,
      iconUrl: true,
      fishingYears: true,
      mainFishing: true,
    },
  })

  if (!user) redirect('/user/setup')

  return <UserSettingsForm user={user} />
}
