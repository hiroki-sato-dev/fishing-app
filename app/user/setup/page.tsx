import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserSetupForm } from './UserSetupForm'

export default async function UserSetupPage() {
  const cognitoUser = await getServerUser()

  // 未ログインなら認証ページへ
  if (!cognitoUser) redirect('/auth')

  // 既にDBユーザーが存在するならホームへ
  const existing = await prisma.user.findUnique({
    where: { email: cognitoUser.username },
    select: { id: true },
  })
  if (existing) redirect('/home')

  return <UserSetupForm />
}
