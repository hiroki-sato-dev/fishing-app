# Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name = "${var.app_name}-user-pool"

  # メールアドレスでログイン
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  # パスワードポリシー
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }

  # メール認証の設定
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "【釣りアプリ】メールアドレスの確認"
    email_message        = "確認コード: {####}"
  }

  # ユーザー属性
  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = true
  }

  tags = {
    App = var.app_name
  }
}

# Cognito App Client（Amplify から接続するためのクライアント）
resource "aws_cognito_user_pool_client" "main" {
  name         = "${var.app_name}-client"
  user_pool_id = aws_cognito_user_pool.main.id

  # シークレットなし（フロントエンドから直接接続するため）
  generate_secret = false

  # 認証フロー
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  # トークン有効期限
  access_token_validity  = 1   # 1時間
  id_token_validity      = 1   # 1時間
  refresh_token_validity = 30  # 30日

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }
}
