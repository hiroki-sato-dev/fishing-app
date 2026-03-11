'use client'

import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import type { AuthUser } from 'aws-amplify/auth'

function RedirectIfLoggedIn({ user }: { user?: AuthUser }) {
  const router = useRouter()
  useEffect(() => {
    if (user) {
      router.replace('/home')
    }
  }, [user, router])
  return null
}

export default function AuthPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f8fafc',
        pt: 8,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          mb: 4,
        }}
      >
        🎣 FishingSNS
      </Typography>

      <Authenticator
        loginMechanisms={['email']}
        signUpAttributes={['email']}
      >
        {({ user }) => <RedirectIfLoggedIn user={user} />}
      </Authenticator>
    </Box>
  )
}
