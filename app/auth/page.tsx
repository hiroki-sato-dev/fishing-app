'use client'

import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { I18n } from 'aws-amplify/utils'
import { translations } from '@aws-amplify/ui-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Box, Typography } from '@mui/material'
import type { AuthUser } from 'aws-amplify/auth'
import { checkDbUser } from './actions/checkDbUser'

I18n.putVocabularies(translations)
I18n.setLanguage('ja')
I18n.putVocabulariesForLanguage('ja', {
  'Password must have at least 8 characters': 'パスワードは8文字以上で入力してください',
  'Your passwords must match': 'パスワードが一致しません',
  'User already exists': 'このメールアドレスはすでに登録されています',
  'Incorrect username or password.': 'メールアドレスまたはパスワードが正しくありません',
  'User does not exist.': 'ユーザーが見つかりません',
  'Invalid verification code provided, please try again.': '確認コードが正しくありません。再度お試しください',
  'An account with the given email already exists.': 'このメールアドレスはすでに登録されています',
  'Password did not conform with policy: Password must have uppercase characters': 'パスワードには大文字を含めてください',
  'Password did not conform with policy: Password must have lowercase characters': 'パスワードには小文字を含めてください',
  'Password did not conform with policy: Password must have numeric characters': 'パスワードには数字を含めてください',
})

function RedirectIfLoggedIn({ user }: { user?: AuthUser }) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!user || checked) return
    const email = user.username // Cognitoのusernameはメールアドレス
    console.log('[RedirectIfLoggedIn] user:', user)
    console.log('[RedirectIfLoggedIn] email:', email)
    if (!email) return
    setChecked(true)

    checkDbUser(email)
      .then((result) => {
        console.log('[RedirectIfLoggedIn] checkDbUser result:', result)
        if (result === 'not_found') {
          router.replace('/user/setup')
        } else {
          router.replace('/home')
        }
      })
      .catch((err) => {
        console.error('[RedirectIfLoggedIn] checkDbUser error:', err)
      })
  }, [user, checked, router])

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
