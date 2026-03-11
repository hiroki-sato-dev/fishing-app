'use client'

import { useAuthenticator } from '@aws-amplify/ui-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { authStatus } = useAuthenticator((context) => [context.authStatus])
  const router = useRouter()

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth')
    }
  }, [authStatus, router])

  if (authStatus !== 'authenticated') {
    return null
  }

  return <>{children}</>
}
