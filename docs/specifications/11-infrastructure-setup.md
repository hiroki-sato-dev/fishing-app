# インフラ構築手順

## 全体の流れ

```
1. 事前準備（ツールのインストール）
2. AWS CLI の設定
3. Terraform workspace で dev 環境を作成
4. terraform apply で全リソース一括作成
5. Prisma マイグレーション（Neon dev ブランチに対して）
```

---

## 1. 事前準備

### 1-1. Terraform のインストール（Mac）

```bash
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# インストール確認
terraform --version
# Terraform v1.x.x が表示されればOK
```

### 1-2. AWS CLI のインストール（Mac）

```bash
brew install awscli

# インストール確認
aws --version
# aws-cli/2.x.x が表示されればOK
```

---

## 2. AWS CLI の設定

Terraform が AWS を操作するために、認証情報を設定します。

### 2-1. IAM ユーザーの作成（AWS コンソール）

1. AWS コンソール → IAM → ユーザー → 「ユーザーを作成」
2. ユーザー名: `terraform-admin`（任意）
3. 「次へ」→ 「ポリシーを直接アタッチ」→ `AdministratorAccess` を選択
4. ユーザー作成後、そのユーザーを開く
5. 「セキュリティ認証情報」タブ → 「アクセスキーを作成」
6. 「コマンドラインインターフェース (CLI)」を選択 → アクセスキーを発行
7. **アクセスキー ID** と **シークレットアクセスキー** をメモ（この画面を閉じると二度と見れない）

### 2-2. プロファイルを設定

このプロジェクトの Terraform は `fishing-app` プロファイルを使用します。

```bash
aws configure --profile fishing-app
```

以下を順番に入力：
```
AWS Access Key ID:     → 手順 2-1 のアクセスキー ID
AWS Secret Access Key: → 手順 2-1 のシークレットアクセスキー
Default region name:   → ap-northeast-1
Default output format: → json
```

設定確認：
```bash
aws sts get-caller-identity --profile fishing-app
# Account, UserId, Arn が表示されればOK
```

---

## 3. Terraform で dev 環境を構築

`terraform/` ディレクトリで作業します。

### 3-1. 初期化

```bash
cd terraform
terraform init
```

### 3-2. dev workspace を作成・切り替え

```bash
terraform workspace new dev
# 既に作成済みの場合は: terraform workspace select dev

# 現在の workspace を確認
terraform workspace show
# dev が表示されればOK
```

### 3-3. tfvars ファイルを用意

`terraform/terraform.tfvars` に以下を設定（`.gitignore` 済み）：

```hcl
env                 = "dev"
neon_api_key        = "..."   # Neon ダッシュボード → Account → API Keys
# neon_org_id は有料プラン・組織利用時のみ設定。無料プランは不要
# neon_org_id       = "org_..."
vercel_api_token    = "..."   # Vercel ダッシュボード → Settings → Tokens
vercel_github_repo  = "your-username/fishing-app"
google_maps_api_key = "AIzaSy..."

# 既存 IAM アクセスキーをインポートする場合のみ設定（新規作成時は不要）
# aws_iam_secret_access_key = "..."
```

### 3-4. 作成されるリソースの確認

```bash
terraform plan
```

以下のリソースが作成されることを確認（dev は suffix なし）：
- `aws_cognito_user_pool` — `fishing-app-user-pool`
- `aws_cognito_user_pool_client` — `fishing-app-client`
- `aws_s3_bucket` — `fishing-app-images`
- `aws_cloudfront_distribution` — dev 用 CDN
- `aws_iam_user` — `fishing-app-app`
- `neon_project` — `fishing-app`（初回のみ）
- `neon_branch` — Neon の `dev` ブランチ
- `vercel_project` — `fishing-app-dev`（production_branch = `develop`）

### 3-5. リソースの作成

```bash
terraform apply
```

`Do you want to perform these actions?` と聞かれたら `yes` と入力。

> CloudFront の作成は 5〜10 分かかることがあります。

### 3-6. 出力値の確認

```bash
terraform output
```

```
aws_region                  = "ap-northeast-1"
cloudfront_domain           = "https://xxxx.cloudfront.net"
cognito_user_pool_id        = "ap-northeast-1_xxxxxxxx"
cognito_user_pool_client_id = "xxxxxxxxxxxxxxxxxxxxxxxxxx"
iam_access_key_id           = "AKIAxxxxxxxxxxxxxxxxxx"
neon_branch_id              = "br-xxxxxxxxxxxxxxxxxx"
s3_bucket_name              = "fishing-app-images"
vercel_project_url          = "https://fishing-app-dev.vercel.app"
```

DATABASE_URL（sensitive）を確認する場合：
```bash
terraform output -raw database_url
```

---

## 4. Prisma マイグレーション

Neon dev ブランチの接続文字列を使ってマイグレーションを実行。

```bash
cd ..  # プロジェクトルートへ

# terraform output から DATABASE_URL を取得
DATABASE_URL=$(cd terraform && terraform output -raw database_url)

# マイグレーション実行
DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy
```

---

## 5. ローカル開発環境

ローカル開発は引き続き Docker（PostgreSQL）を使用：

```bash
npm run docker:db    # PostgreSQL 起動
npm run db:migrate   # マイグレーション実行
npm run dev          # 開発サーバー起動
```

`.env` の `DATABASE_URL` はローカル Docker を向けておく（Vercel 側は Terraform が自動で Neon の URL を注入）。

---

## 環境の切り替え（将来: stg / prd 追加時）

```bash
# stg 環境を追加
terraform workspace new stg
terraform apply -var="env=stg"

# prd 環境を追加
terraform workspace new prd
terraform apply -var="env=prd"

# workspace 一覧確認
terraform workspace list
#   default
# * dev
#   stg
#   prd
```

---

## Terraform の日常運用

| 操作 | コマンド |
|---|---|
| 現在の workspace 確認 | `terraform workspace show` |
| workspace 切り替え | `terraform workspace select dev` |
| リソースの変更を確認 | `terraform plan` |
| 変更を適用 | `terraform apply` |
| 出力値を確認 | `terraform output` |
| リソースを全削除（注意） | `terraform destroy` |

### tfstate の扱いについて

`terraform.tfstate` には IAM のシークレットキーなど**機密情報が含まれます**。
`.gitignore` に追加して GitHub にコミットしないよう注意してください。

```bash
# .gitignore に追記（未設定の場合）
echo "terraform/*.tfstate" >> .gitignore
echo "terraform/*.tfstate.backup" >> .gitignore
echo "terraform/.terraform/" >> .gitignore
echo "terraform/terraform.tfvars" >> .gitignore
```

---

## トラブルシューティング

**`Error: No valid credential sources found`**
→ AWS CLI のプロファイル設定を確認: `aws configure --profile fishing-app`

**`Error: BucketAlreadyExists`**
→ S3 バケット名はグローバルで一意。`env` 変数に suffix を追加して変更する。

**`workspace` コマンドが使えない**
→ `terraform init` が完了していることを確認。

**Vercel ビルドエラー `DATABASE_URL not set`**
→ `terraform apply` が完了しているか確認。Vercel ダッシュボードで環境変数が注入されているか確認し、必要なら「Redeploy」。

**Vercel ビルドエラー `PrismaClientInitializationError`**
→ `package.json` の build スクリプトを確認。`"build": "prisma generate && next build"` になっていること。

**Terraform コマンドが極端に遅い（30秒以上）**
→ Apple Silicon Mac で Intel バイナリ（Rosetta2 経由）が動いている可能性。
```bash
file $(which terraform)  # "arm64" でなければ再インストール
brew uninstall terraform
# HashiCorp Releases から darwin_arm64 バイナリを手動インストール
```

**`Error: state file locked`**
→ バックグラウンドで terraform プロセスが残っている可能性。
```bash
pkill -f terraform-provider
rm terraform/.terraform.tfstate.lock.info  # 残っている場合のみ
```
