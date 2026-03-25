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

variable "neon_api_key" {
  description = "Neon API キー（Neon ダッシュボード → Account → API Keys）"
  type        = string
  sensitive   = true
}

variable "neon_org_id" {
  description = "Neon Organization ID（Neon ダッシュボード → Settings → Organization）"
  type        = string
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
