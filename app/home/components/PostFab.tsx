'use client'

import { Fab, Tooltip } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { useAuthenticator } from '@aws-amplify/ui-react'

export function PostFab() {
  const { authStatus } = useAuthenticator((context) => [context.authStatus])
  const isLoggedIn = authStatus === 'authenticated'
  const router = useRouter()

  return (
    <Tooltip title={!isLoggedIn ? '投稿するにはログインが必要です' : ''} arrow placement="left">
      <span style={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', zIndex: 1000 }}>
        <Fab
          onClick={isLoggedIn ? () => router.push('/post/new') : undefined}
          disabled={!isLoggedIn}
          sx={{
            display: { xs: 'flex', lg: 'none' },
            background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
            color: 'white',
            width: 60,
            height: 60,
            boxShadow: '0 8px 24px rgba(14, 165, 233, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0284c7, #0d9488)',
              transform: 'scale(1.05)',
              boxShadow: '0 12px 32px rgba(14, 165, 233, 0.5)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <AddIcon sx={{ fontSize: 28 }} />
        </Fab>
      </span>
    </Tooltip>
  )
}
