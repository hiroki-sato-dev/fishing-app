'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box, Card, CardContent, Typography, TextField,
  Button, CircularProgress, Alert, Avatar
} from '@mui/material'
import { Person, PhotoCamera } from '@mui/icons-material'
import { createUser, type CreateUserState } from './actions/createUser'
import { generatePresignedUrl } from '@/app/post/new/actions/generatePresignedUrl'
import { convertToWebP } from '@/lib/imageUtils'

const initialState: CreateUserState = { success: false, message: '' }

export function UserSetupForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createUser, initialState)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadedIconUrl, setUploadedIconUrl] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)

  useEffect(() => {
    if (state.success) {
      router.replace('/home')
    }
  }, [state.success, router])

  const handleAvatarSelect = async (file: File | null) => {
    if (!file) return
    setAvatarError(null)
    setIsUploadingAvatar(true)
    try {
      const blob = await convertToWebP(file)
      setAvatarPreview(URL.createObjectURL(blob))

      const result = await generatePresignedUrl(blob.type, blob.size, 'users')
      if (!result.success) {
        setAvatarError(result.message)
        return
      }
      const res = await fetch(result.uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': blob.type },
      })
      if (!res.ok) throw new Error('アップロードに失敗しました')
      setUploadedIconUrl(result.publicUrl)
    } catch {
      setAvatarError('画像のアップロードに失敗しました')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f8fafc',
        px: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 480, borderRadius: 4, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 1,
              background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            🎣 プロフィール設定
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            FishingSNSへようこそ！まずプロフィールを設定しましょう。
          </Typography>

          {state.message && !state.success && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {state.message}
            </Alert>
          )}

          <Box component="form" action={formAction}>
            {/* Avatar upload */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, gap: 1 }}>
              <Box sx={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
                <Avatar
                  src={avatarPreview ?? undefined}
                  sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
                >
                  {!avatarPreview && <Person sx={{ fontSize: 40 }} />}
                </Avatar>
                <Box sx={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  bgcolor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'opacity 0.2s', '&:hover': { opacity: 1 },
                }}>
                  {isUploadingAvatar
                    ? <CircularProgress size={20} sx={{ color: 'white' }} />
                    : <PhotoCamera sx={{ color: 'white', fontSize: 22 }} />
                  }
                </Box>
              </Box>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                style={{ display: 'none' }}
                onChange={(e) => handleAvatarSelect(e.target.files?.[0] ?? null)}
                onClick={(e) => { (e.target as HTMLInputElement).value = '' }}
              />
              <Typography variant="caption" color="text.secondary">
                タップしてプロフィール画像を設定（任意）
              </Typography>
              {avatarError && <Alert severity="error" sx={{ py: 0, fontSize: '0.75rem' }}>{avatarError}</Alert>}
              {uploadedIconUrl && <input type="hidden" name="iconUrl" value={uploadedIconUrl} />}
            </Box>

            <TextField
              name="name"
              label="ユーザー名"
              required
              fullWidth
              inputProps={{ maxLength: 16 }}
              helperText={state.errors?.name?.[0] ?? '16文字以内'}
              error={!!state.errors?.name}
              sx={{ mb: 2 }}
            />
            <TextField
              name="fishingYears"
              label="釣り歴（年）"
              type="number"
              fullWidth
              inputProps={{ min: 0, max: 100 }}
              helperText={state.errors?.fishingYears?.[0]}
              error={!!state.errors?.fishingYears}
              sx={{ mb: 2 }}
            />
            <TextField
              name="mainFishing"
              label="メインの釣りもの"
              fullWidth
              placeholder="例: バス釣り、海釣り、フライフィッシング"
              inputProps={{ maxLength: 50 }}
              helperText={state.errors?.mainFishing?.[0]}
              error={!!state.errors?.mainFishing}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isPending}
              sx={{
                background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
                borderRadius: 3,
                py: 1.5,
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              {isPending ? <CircularProgress size={24} color="inherit" /> : 'はじめる'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
