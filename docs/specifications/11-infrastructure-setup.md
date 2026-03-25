# インフラ構築手順

## 全体の流れ

```
1. 事前準備（ツールのインストール）
2. AWS CLI の設定
3. Terraform で AWS リソース作成（S3・CloudFront・Cognito・IAM）
4. Neon でデータベース作成
5. Vercel でアプリをデプロイ
6. 環境変数を設定して完了
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

## 3. Terraform で AWS リソースを作成

`terraform/` ディレクトリで作業します。

### 3-1. 初期化

```bash
cd terraform
terraform init
```

`Terraform has been successfully initialized!` と表示されればOK。

### 3-2. 作成されるリソースの確認

```bash
terraform plan
```

以下のリソースが作成されることを確認：
- `aws_cognito_user_pool` — 認証用ユーザープール
- `aws_cognito_user_pool_client` — Amplify 接続用クライアント
- `aws_s3_bucket` — 画像アップロード用バケット
- `aws_cloudfront_distribution` — 画像配信用 CDN
- `aws_iam_user` / `aws_iam_access_key` — アプリ用 IAM 認証情報

### 3-3. リソースの作成

```bash
terraform apply
```

`Do you want to perform these actions?` と聞かれたら `yes` と入力。

> CloudFront の作成は 5〜10 分かかることがあります。

### 3-4. 出力値の確認

作成完了後、環境変数に必要な値が表示されます。

```bash
terraform output
```

```
aws_region                = "ap-northeast-1"
cloudfront_domain         = "https://xxxx.cloudfront.net"
cognito_user_pool_id      = "ap-northeast-1_xxxxxxxx"
cognito_user_pool_client_id = "xxxxxxxxxxxxxxxxxxxxxxxxxx"
iam_access_key_id         = "AKIAxxxxxxxxxxxxxxxxxx"
s3_bucket_name            = "fishing-app-images"
```

シークレットキー（`sensitive` のため通常は非表示）を確認する場合：
```bash
terraform output -raw iam_secret_access_key
```

---

## 4. Neon でデータベースを作成

### 4-1. アカウント作成

1. [neon.tech](https://neon.tech) にアクセス
2. 「Sign up」→ GitHub でサインアップ（推奨）

### 4-2. プロジェクト作成

1. 「New Project」をクリック
2. 設定：
   - **Name**: `fishing-app`
   - **PostgreSQL version**: `16`（最新）
   - **Region**: `Tokyo (AWS ap-northeast-1)` — アプリと同じリージョン
3. 「Create Project」をクリック

### 4-3. 接続文字列をコピー

プロジェクト作成直後に表示される「Connection string」をコピー。

```
postgresql://username:password@ep-xxxx.ap-northeast-1.aws.neon.tech/neondb?sslmode=require
```

> Dashboard → 「Connection Details」からいつでも確認できます。

### 4-4. マイグレーションの実行

プロジェクトルートに戻り、Neon の接続文字列を使ってマイグレーションを実行。

```bash
cd ..  # プロジェクトルートへ

# .env.production.local を一時作成（または直接環境変数を指定）
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

---

## 5. Vercel でデプロイ

### 5-1. アカウント作成

1. [vercel.com](https://vercel.com) にアクセス
2. 「Sign Up」→ GitHub でサインアップ（推奨）

### 5-2. プロジェクトの作成

1. ダッシュボードの「Add New...」→「Project」
2. GitHub リポジトリを検索して「Import」
3. 設定はデフォルトのまま（Next.js は自動検出される）
4. **「Deploy」を押す前に** 環境変数を設定する（手順 6）

### 5-3. 環境変数の設定

「Configure Project」→「Environment Variables」で以下を設定：

| 変数名 | 値 | どこから |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` | Neon の接続文字列 |
| `NEXT_PUBLIC_AWS_REGION` | `ap-northeast-1` | terraform output |
| `NEXT_PUBLIC_USER_POOLS_ID` | `ap-northeast-1_xxxxx` | terraform output |
| `NEXT_PUBLIC_USER_POOLS_WEB_CLIENT_ID` | `xxxxxxxxxx` | terraform output |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | `AIzaSy...` | Google Cloud Console |
| `AWS_ACCESS_KEY_ID` | `AKIAxxxx` | terraform output |
| `AWS_SECRET_ACCESS_KEY` | `xxxxxxxx` | terraform output -raw iam_secret_access_key |
| `AWS_REGION` | `ap-northeast-1` | 固定値 |
| `AWS_S3_BUCKET_NAME` | `fishing-app-images` | terraform output |
| `NEXT_PUBLIC_CLOUDFRONT_DOMAIN` | `https://xxxx.cloudfront.net` | terraform output |

### 5-4. デプロイ

「Deploy」ボタンをクリック。完了すると `xxxx.vercel.app` のURLが発行されます。

---

## 6. デプロイ後の確認

1. 発行された URL にアクセス
2. ログイン画面が表示されること
3. サインアップして投稿できること

---

## Terraform の日常運用

| 操作 | コマンド |
|---|---|
| リソースの変更を確認 | `terraform plan` |
| 変更を適用 | `terraform apply` |
| 出力値を確認 | `terraform output` |
| リソースを全削除（注意） | `terraform destroy` |

### tfstate の扱いについて

`terraform.tfstate` には IAM のシークレットキーなど**機密情報が含まれます**。
`.gitignore` に追加して GitHub にコミットしないよう注意してください。

```bash
# .gitignore に追記
echo "terraform/*.tfstate" >> .gitignore
echo "terraform/*.tfstate.backup" >> .gitignore
echo "terraform/.terraform/" >> .gitignore
```

---

## トラブルシューティング

**`Error: No valid credential sources found`**
→ AWS CLI のプロファイル設定を確認: `aws configure --profile fishing-app`

**`Error: BucketAlreadyExists`**
→ S3 バケット名はグローバルで一意。`variables.tf` の `app_name` に suffix を追加して変更する。

**Vercel ビルドエラー `DATABASE_URL not set`**
→ Vercel の「Settings」→「Environment Variables」で設定されているか確認。再デプロイが必要な場合は「Redeploy」ボタンをクリック。
