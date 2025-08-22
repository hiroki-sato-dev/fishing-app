import { Amplify } from 'aws-amplify'

export const configureAmplify = () => {
  const region = process.env.NEXT_PUBLIC_AWS_REGION
  const userPoolId = process.env.NEXT_PUBLIC_USER_POOLS_ID
  const userPoolClientId = process.env.NEXT_PUBLIC_USER_POOLS_WEB_CLIENT_ID

  if (!region || !userPoolId || !userPoolClientId) {
    console.warn('AWS Cognito configuration is incomplete')
    return
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        signUpVerificationMethod: 'code',
      },
    },
  })
}

export const getCurrentUser = async () => {
  try {
    const { getCurrentUser } = await import('aws-amplify/auth')
    return await getCurrentUser()
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export const signOut = async () => {
  try {
    const { signOut } = await import('aws-amplify/auth')
    await signOut()
  } catch (error) {
    console.error('Error signing out:', error)
  }
} 