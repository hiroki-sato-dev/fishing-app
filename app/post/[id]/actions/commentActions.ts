'use server'

import { getServerUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const commentSchema = z.object({
  content: z.string().min(1, 'コメントを入力してください').max(200, '200文字以内で入力してください'),
})

export type CommentState = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

export const createComment = async (
  postId: string,
  _prevState: CommentState,
  formData: FormData
): Promise<CommentState> => {
  const cognitoUser = await getServerUser()
  if (!cognitoUser) return { success: false, message: 'ログインが必要です' }

  const dbUser = await prisma.user.findUnique({
    where: { email: cognitoUser.username },
    select: { id: true },
  })
  if (!dbUser) return { success: false, message: 'ユーザーが見つかりません' }

  const raw = { content: formData.get('content') as string }
  const parsed = commentSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    parsed.error.issues.forEach((issue) => {
      const path = issue.path.join('.')
      if (!fieldErrors[path]) fieldErrors[path] = []
      fieldErrors[path].push(issue.message)
    })
    return { success: false, message: 'バリデーションエラー', errors: fieldErrors }
  }

  await prisma.comment.create({
    data: { postId, userId: dbUser.id, content: parsed.data.content },
  })

  revalidatePath(`/post/${postId}`)
  return { success: true, message: 'コメントを投稿しました' }
}

export const deleteComment = async (commentId: string, postId: string): Promise<void> => {
  const cognitoUser = await getServerUser()
  if (!cognitoUser) return

  const dbUser = await prisma.user.findUnique({
    where: { email: cognitoUser.username },
    select: { id: true },
  })
  if (!dbUser) return

  await prisma.comment.deleteMany({
    where: { id: commentId, userId: dbUser.id },
  })

  revalidatePath(`/post/${postId}`)
}
