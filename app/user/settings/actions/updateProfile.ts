'use server'

import { getServerUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(16, '名前は16文字以内で入力してください'),
  bio: z.string().max(160, '自己紹介は160文字以内で入力してください').optional(),
  fishingYears: z.coerce.number().int().min(0).max(100).optional(),
  mainFishing: z.string().max(50, 'メインの釣りものは50文字以内で入力してください').optional(),
  iconUrl: z.string().url('有効なURLを入力してください').optional().or(z.literal('')),
})

export type UpdateProfileState = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

export const updateProfile = async (
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> => {
  const cognitoUser = await getServerUser()
  if (!cognitoUser) {
    return { success: false, message: 'ログインが必要です' }
  }

  const raw = {
    name: formData.get('name') as string,
    bio: (formData.get('bio') as string) || undefined,
    fishingYears: (formData.get('fishingYears') as string) || undefined,
    mainFishing: (formData.get('mainFishing') as string) || undefined,
    iconUrl: (formData.get('iconUrl') as string) || undefined,
  }

  const parsed = updateProfileSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    parsed.error.issues.forEach((issue) => {
      const path = issue.path.join('.')
      if (!fieldErrors[path]) fieldErrors[path] = []
      fieldErrors[path].push(issue.message)
    })
    return { success: false, message: 'バリデーションエラーが発生しました', errors: fieldErrors }
  }

  await prisma.user.update({
    where: { email: cognitoUser.username },
    data: {
      name: parsed.data.name,
      bio: parsed.data.bio ?? null,
      fishingYears: parsed.data.fishingYears ?? null,
      mainFishing: parsed.data.mainFishing ?? null,
      iconUrl: parsed.data.iconUrl || null,
    },
  })

  return { success: true, message: 'プロフィールを更新しました' }
}
