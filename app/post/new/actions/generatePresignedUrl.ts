'use server'

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getServerUser } from '@/lib/auth'
import { randomUUID } from 'crypto'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

type GeneratePresignedUrlResult =
  | { success: true; uploadUrl: string; publicUrl: string }
  | { success: false; message: string }

export const generatePresignedUrl = async (
  contentType: string,
  fileSize: number,
  folder: 'posts' | 'users' = 'posts'
): Promise<GeneratePresignedUrlResult> => {
  const cognitoUser = await getServerUser()
  if (!cognitoUser) {
    return { success: false, message: 'ログインが必要です' }
  }

  if (!ALLOWED_MIME_TYPES.includes(contentType)) {
    return { success: false, message: '対応していないファイル形式です（JPEG・PNG・WebP・HEICのみ）' }
  }

  if (fileSize > MAX_FILE_SIZE) {
    return { success: false, message: 'ファイルサイズは5MB以内にしてください' }
  }

  const ext = contentType.split('/')[1].replace('jpeg', 'jpg')
  const key = `${folder}/${randomUUID()}.${ext}`

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
    ContentLength: fileSize,
  })

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 })
  const publicUrl = `${process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN}/${key}`

  return { success: true, uploadUrl, publicUrl }
}
