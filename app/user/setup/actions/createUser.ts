'use server'

import { getServerUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createUserSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(16, '名前は16文字以内で入力してください'),
  fishingYears: z.coerce.number().int().min(0).max(100).optional(),
  mainFishing: z.string().max(50).optional(),
})

export type CreateUserState = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

export const createUser = async (
  _prevState: CreateUserState,
  formData: FormData
): Promise<CreateUserState> => {
  const cognitoUser = await getServerUser()
  if (!cognitoUser) {
    return { success: false, message: 'ログインが必要です' }
  }

  const email = cognitoUser.username

  // 既にDBユーザーが存在する場合はスキップ
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (existing) {
    return { success: true, message: 'すでに登録済みです' }
  }

  const raw = {
    name: formData.get('name') as string,
    fishingYears: formData.get('fishingYears') as string || undefined,
    mainFishing: formData.get('mainFishing') as string || undefined,
  }

  const parsed = createUserSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    parsed.error.issues.forEach((issue) => {
      const path = issue.path.join('.')
      if (!fieldErrors[path]) fieldErrors[path] = []
      fieldErrors[path].push(issue.message)
    })
    return { success: false, message: 'バリデーションエラーが発生しました', errors: fieldErrors }
  }

  await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      fishingYears: parsed.data.fishingYears ?? null,
      mainFishing: parsed.data.mainFishing ?? null,
    },
  })

  return { success: true, message: 'プロフィールを作成しました' }
}
