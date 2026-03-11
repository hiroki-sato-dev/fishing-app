'use client'

import { Button, Tooltip } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { useAuthenticator } from '@aws-amplify/ui-react'

export function PostButton() {
  const { authStatus } = useAuthenticator((context) => [context.authStatus])
  const isLoggedIn = authStatus === 'authenticated'
  const router = useRouter()

  return (
    <Tooltip title={!isLoggedIn ? '投稿するにはログインが必要です' : ''} arrow>
      <span>
        <Button
          variant="contained"
          size="medium"
          startIcon={<AddIcon />}
          disabled={!isLoggedIn}
          onClick={isLoggedIn ? () => router.push('/post/new') : undefined}
          sx={{
            display: { xs: 'none', lg: 'flex' },
            background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
            borderRadius: 3,
            fontWeight: 600,
            px: 3,
            boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0284c7, #0d9488)',
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 16px rgba(14, 165, 233, 0.4)',
            },
            transition: 'all 0.2s ease'
          }}
        >
          投稿する
        </Button>
      </span>
    </Tooltip>
  )
}
