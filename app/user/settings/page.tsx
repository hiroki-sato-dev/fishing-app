import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/auth'
import { UserSettingsForm } from './UserSettingsForm'
import { getProfile } from './actions/getProfile'

export default async function UserSettingsPage() {
  const cognitoUser = await getServerUser()
  if (!cognitoUser) redirect('/auth')

  const user = await getProfile(cognitoUser.username)
  if (!user) redirect('/user/setup')

  return <UserSettingsForm user={user} />
}
