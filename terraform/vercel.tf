resource "vercel_project" "main" {
  name      = "${var.app_name}-${var.env}"
  framework = "nextjs"

  git_repository = {
    type = "github"
    repo = var.vercel_github_repo
  }
}

# --- 環境変数（AWS・Neon・Google Maps の出力値を自動で注入）---

locals {
  # dev/stg は Neon ブランチの接続 URI、prd はメインブランチ（main）を使用
  # TODO: neon_branch の connection_uri が provider で取得できるようになったら置き換える
  database_url = neon_project.main.connection_uri

  vercel_env_vars = {
    DATABASE_URL                         = local.database_url
    NEXT_PUBLIC_AWS_REGION               = var.aws_region
    NEXT_PUBLIC_USER_POOLS_ID            = aws_cognito_user_pool.main.id
    NEXT_PUBLIC_USER_POOLS_WEB_CLIENT_ID = aws_cognito_user_pool_client.main.id
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY      = var.google_maps_api_key
    AWS_ACCESS_KEY_ID                    = aws_iam_access_key.app.id
    AWS_SECRET_ACCESS_KEY                = coalesce(var.aws_iam_secret_access_key, aws_iam_access_key.app.secret)
    AWS_REGION                           = var.aws_region
    AWS_S3_BUCKET_NAME                   = aws_s3_bucket.images.id
    NEXT_PUBLIC_CLOUDFRONT_DOMAIN        = "https://${aws_cloudfront_distribution.images.domain_name}"
  }

  sensitive_keys = toset([
    "DATABASE_URL",
    "AWS_SECRET_ACCESS_KEY",
    "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
  ])
}

resource "vercel_project_environment_variable" "env_vars" {
  for_each = local.vercel_env_vars

  project_id = vercel_project.main.id
  key        = each.key
  value      = each.value
  target     = ["production", "preview"]
  sensitive  = contains(local.sensitive_keys, each.key)
}
