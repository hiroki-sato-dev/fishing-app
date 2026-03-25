resource "neon_project" "main" {
  name                       = var.app_name
  org_id                     = var.neon_org_id
  region_id                  = "aws-ap-southeast-1"
  pg_version                 = 16
  history_retention_seconds  = 0
}
