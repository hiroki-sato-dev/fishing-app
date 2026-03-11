import { Amplify } from 'aws-amplify'
import { createServerRunner } from '@aws-amplify/adapter-nextjs'
import { getCurrentUser as getAmplifyCurrentUser } from 'aws-amplify/auth/server'
import type { AuthUser } from 'aws-amplify/auth'
import { cookies } from 'next/headers'

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOLS_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_USER_POOLS_WEB_CLIENT_ID!,
      signUpVerificationMethod: 'code' as const,
    },
  },
}

// クライアントサイド用
Amplify.configure(amplifyConfig, { ssr: true })

// サーバーサイド用ランナー
export const { runWithAmplifyServerContext } = createServerRunner({
  config: amplifyConfig,
})

/**
 * Server Action / Server Component でログイン中のユーザーを取得する
 * 未ログインの場合は null を返す
 */
export const getServerUser = async (): Promise<AuthUser | null> => {
  try {
    return await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => getAmplifyCurrentUser(contextSpec),
    }) as AuthUser
  } catch {
    return null
  }
}

