'use client'

import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { useRouter } from 'next/navigation'
import { Box, Typography } from '@mui/material'

export default function AuthPage() {
  const router = useRouter()

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
        {({ user }) => {
          if (user) {
            router.push('/home')
          }
          return <></>
        }}
      </Authenticator>
    </Box>
  )
}
