import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 認証不要なパス
const publicPaths = ['/auth']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 認証不要なパスはスルー
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Amplify が Cookie にセットする認証トークンを確認
  // トークンのキーは "CognitoIdentityServiceProvider.{clientId}.LastAuthUser" 形式
  const clientId = process.env.NEXT_PUBLIC_USER_POOLS_WEB_CLIENT_ID
  const lastAuthUserKey = Object.keys(
    Object.fromEntries(request.cookies)
  ).find((key) => key.includes('LastAuthUser') && key.includes(clientId ?? ''))

  const isAuthenticated = !!lastAuthUserKey

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/home/:path*', '/post/:path*'],
}
