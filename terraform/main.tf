terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    neon = {
      source  = "kislerdm/neon"
      version = "~> 0.6"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region  = var.aws_region
  profile = "fishing-app"
}

provider "neon" {
  api_key = var.neon_api_key
}

provider "vercel" {
  api_token = var.vercel_api_token
}
