resource "neon_project" "main" {
  name                      = var.app_name
  org_id                    = var.neon_org_id
  region_id                 = "aws-ap-southeast-1" # 東京なし。シンガポールが最近傍
  pg_version                = 16
  history_retention_seconds = 0
}

# dev / stg 用ブランチ（prd は main ブランチをそのまま使用）
# TODO: stg/prd 追加時に各環境の connection_uri をブランチから取得する仕組みを追加する
resource "neon_branch" "env" {
  count      = var.env != "prd" ? 1 : 0
  project_id = neon_project.main.id
  name       = var.env
}
