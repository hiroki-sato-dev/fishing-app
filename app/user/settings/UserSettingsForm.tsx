'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box, Card, CardContent, Typography, TextField,
  Button, CircularProgress, Alert, Avatar
} from '@mui/material'
import { Person } from '@mui/icons-material'
import { updateProfile, type UpdateProfileState } from './actions/updateProfile'

type UserData = {
  id: string
  name: string
  bio: string | null
  iconUrl: string | null
  fishingYears: number | null
  mainFishing: string | null
}

const initialState: UpdateProfileState = { success: false, message: '' }

export function UserSettingsForm({ user }: { user: UserData }) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(updateProfile, initialState)

  useEffect(() => {
    if (state.success) {
      router.push(`/user/${user.id}`)
    }
  }, [state.success, router, user.id])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'linear-gradient(135deg, #f8fafc, #eff6ff)',
        px: 2,
        pt: 10,
        pb: 4,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 520, borderRadius: 4, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 3,
              background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            プロフィール編集
          </Typography>

          {/* Avatar preview */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Avatar
              src={user.iconUrl ?? undefined}
              sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
            >
              {!user.iconUrl && <Person sx={{ fontSize: 40 }} />}
            </Avatar>
          </Box>

          {state.message && !state.success && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {state.message}
            </Alert>
          )}

          <Box component="form" action={formAction}>
            <TextField
              name="name"
              label="ユーザー名"
              required
              fullWidth
              defaultValue={user.name}
              inputProps={{ maxLength: 16 }}
              helperText={state.errors?.name?.[0] ?? '16文字以内'}
              error={!!state.errors?.name}
              sx={{ mb: 2 }}
            />
            <TextField
              name="bio"
              label="自己紹介"
              fullWidth
              multiline
              rows={3}
              defaultValue={user.bio ?? ''}
              inputProps={{ maxLength: 160 }}
              helperText={state.errors?.bio?.[0] ?? '160文字以内'}
              error={!!state.errors?.bio}
              sx={{ mb: 2 }}
            />
            <TextField
              name="iconUrl"
              label="プロフィール画像URL"
              fullWidth
              defaultValue={user.iconUrl ?? ''}
              placeholder="https://example.com/image.jpg"
              helperText={state.errors?.iconUrl?.[0]}
              error={!!state.errors?.iconUrl}
              sx={{ mb: 2 }}
            />
            <TextField
              name="fishingYears"
              label="釣り歴（年）"
              type="number"
              fullWidth
              defaultValue={user.fishingYears ?? ''}
              inputProps={{ min: 0, max: 100 }}
              helperText={state.errors?.fishingYears?.[0]}
              error={!!state.errors?.fishingYears}
              sx={{ mb: 2 }}
            />
            <TextField
              name="mainFishing"
              label="メインの釣りもの"
              fullWidth
              defaultValue={user.mainFishing ?? ''}
              placeholder="例: バス釣り、海釣り、フライフィッシング"
              inputProps={{ maxLength: 50 }}
              helperText={state.errors?.mainFishing?.[0]}
              error={!!state.errors?.mainFishing}
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => router.back()}
                sx={{ borderRadius: 3, py: 1.5, fontWeight: 600 }}
              >
                キャンセル
              </Button>
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
                {isPending ? <CircularProgress size={24} color="inherit" /> : '保存する'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
