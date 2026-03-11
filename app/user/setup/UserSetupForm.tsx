'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box, Card, CardContent, Typography, TextField,
  Button, CircularProgress, Alert
} from '@mui/material'
import { createUser, type CreateUserState } from './actions/createUser'

const initialState: CreateUserState = { success: false, message: '' }

export function UserSetupForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createUser, initialState)

  useEffect(() => {
    if (state.success) {
      router.replace('/home')
    }
  }, [state.success, router])

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
