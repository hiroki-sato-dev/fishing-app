# -----------------------------------------------
# S3 バケット（画像アップロード用）
# -----------------------------------------------
resource "aws_s3_bucket" "images" {
  bucket = "${local.resource_prefix}-images"

  tags = {
    App = var.app_name
    Env = var.env
  }
}

# パブリックアクセスをすべてブロック（CloudFront 経由のみ許可）
resource "aws_s3_bucket_public_access_block" "images" {
  bucket = aws_s3_bucket.images.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Presigned URL でブラウザから直接アップロードするための CORS 設定
resource "aws_s3_bucket_cors_configuration" "images" {
  bucket = aws_s3_bucket.images.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "GET"]
    # prd はドメインを限定。dev/stg はワイルドカード（Vercel プレビュー URL が動的なため）
    allowed_origins = var.env == "prd" ? ["https://${var.app_name}.vercel.app"] : ["*"]
    max_age_seconds = 3000
  }
}

# -----------------------------------------------
# CloudFront
# -----------------------------------------------

# Origin Access Control（S3 への署名付きリクエスト）
resource "aws_cloudfront_origin_access_control" "images" {
  name                              = "${local.resource_prefix}-images-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "images" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "${local.resource_prefix} images"

  origin {
    domain_name              = aws_s3_bucket.images.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.images.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.images.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.images.id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 86400    # 1日
    max_ttl     = 31536000 # 1年
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    App = var.app_name
    Env = var.env
  }
}

# CloudFront に S3 読み取りを許可するバケットポリシー
resource "aws_s3_bucket_policy" "images" {
  bucket = aws_s3_bucket.images.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "cloudfront.amazonaws.com" }
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.images.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.images.arn
          }
        }
      }
    ]
  })

  depends_on = [aws_cloudfront_distribution.images]
}

# -----------------------------------------------
# IAM（アプリから Presigned URL を発行するための権限）
# -----------------------------------------------
resource "aws_iam_user" "app" {
  name = "${local.resource_prefix}-app"

  tags = {
    App = var.app_name
    Env = var.env
  }
}

resource "aws_iam_user_policy" "app_s3" {
  name = "${local.resource_prefix}-s3-policy"
  user = aws_iam_user.app.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:DeleteObject"]
        Resource = "${aws_s3_bucket.images.arn}/*"
      }
    ]
  })
}

resource "aws_iam_access_key" "app" {
  user = aws_iam_user.app.name
}
