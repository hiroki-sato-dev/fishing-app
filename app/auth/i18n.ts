import { I18n } from 'aws-amplify/utils'
import { translations } from '@aws-amplify/ui-react'

export const setupAuthI18n = () => {
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
}
