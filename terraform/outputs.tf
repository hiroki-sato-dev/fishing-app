output "env" {
  description = "現在の環境名"
  value       = var.env
}

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

output "s3_bucket_name" {
  description = "AWS_S3_BUCKET_NAME に設定する値"
  value       = aws_s3_bucket.images.id
}

output "cloudfront_domain" {
  description = "NEXT_PUBLIC_CLOUDFRONT_DOMAIN に設定する値（例: https://xxxx.cloudfront.net）"
  value       = "https://${aws_cloudfront_distribution.images.domain_name}"
}

output "iam_access_key_id" {
  description = "AWS_ACCESS_KEY_ID に設定する値"
  value       = aws_iam_access_key.app.id
}

output "iam_secret_access_key" {
  description = "AWS_SECRET_ACCESS_KEY に設定する値"
  value       = aws_iam_access_key.app.secret
  sensitive   = true
}

output "database_url" {
  description = "DATABASE_URL に設定する値"
  value       = local.database_url
  sensitive   = true
}

output "neon_branch_id" {
  description = "Neon ブランチ ID（dev/stg のみ）"
  value       = var.env != "prd" ? neon_branch.env[0].id : "prd uses main branch"
}

output "vercel_project_url" {
  description = "デプロイされた Vercel の URL"
  value       = "https://${vercel_project.main.name}.vercel.app"
}
