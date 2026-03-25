variable "aws_region" {
  description = "AWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "app_name" {
  description = "アプリケーション名"
  type        = string
  default     = "fishing-app"
}

variable "env" {
  description = "環境名 (dev / stg / prd)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "stg", "prd"], var.env)
    error_message = "env は dev / stg / prd のいずれかを指定してください。"
  }
}

variable "neon_api_key" {
  description = "Neon API キー（Neon ダッシュボード → Account → API Keys）"
  type        = string
  sensitive   = true
}

variable "neon_org_id" {
  description = "Neon Organization ID（有料プラン・組織利用時のみ設定。無料プランは null のまま）"
  type        = string
  default     = null
}

variable "vercel_api_token" {
  description = "Vercel API トークン（Vercel ダッシュボード → Settings → Tokens）"
  type        = string
  sensitive   = true
}

variable "vercel_github_repo" {
  description = "GitHub リポジトリ（例: your-username/fishing-app）"
  type        = string
}

variable "google_maps_api_key" {
  description = "Google Maps API キー"
  type        = string
  sensitive   = true
}

variable "aws_iam_secret_access_key" {
  description = "AWS IAM シークレットアクセスキー（インポート時は既存キーを設定。新規作成時は不要）"
  type        = string
  sensitive   = true
  default     = null
}
