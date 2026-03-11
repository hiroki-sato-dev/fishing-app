# .env に設定する値を出力
output "cognito_user_pool_id" {
  description = "NEXT_PUBLIC_USER_POOLS_ID に設定する値"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_user_pool_client_id" {
  description = "NEXT_PUBLIC_USER_POOLS_WEB_CLIENT_ID に設定する値"
  value       = aws_cognito_user_pool_client.main.id
}

output "aws_region" {
  description = "NEXT_PUBLIC_AWS_REGION に設定する値"
  value       = var.aws_region
}
