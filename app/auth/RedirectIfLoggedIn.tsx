'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AuthUser } from 'aws-amplify/auth'
import { checkDbUser } from './actions/checkDbUser'

export function RedirectIfLoggedIn({ user }: { user?: AuthUser }) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!user || checked) return
    const email = user.username
    if (!email) return
    setChecked(true)

    checkDbUser(email)
      .then((result) => {
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
