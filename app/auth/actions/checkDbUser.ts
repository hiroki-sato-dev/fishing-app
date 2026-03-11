'use server'

import { prisma } from '@/lib/prisma'

/**
 * 指定メールアドレスのDBユーザーが存在するか確認する
 * クライアント側でCognitoから取得したemailを渡す（ログイン直後のCookie未セット問題を回避）
 */
export const checkDbUser = async (email: string): Promise<'exists' | 'not_found'> => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  return user ? 'exists' : 'not_found'
}
