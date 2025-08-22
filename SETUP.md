# 釣りアプリ セットアップガイド

このガイドでは、GitHubからプロジェクトをクローンして、ローカル環境でアプリケーションを起動するまでの手順を説明します。

## 前提条件

以下のソフトウェアをインストールしてください：

### 必須ソフトウェア
- **Node.js (v18以上)**: JavaScript実行環境（npmも含まれます）
- **Git**: バージョン管理システム
- **Docker Desktop**: データベース用に必要

### Node.jsのインストール

#### 推奨方法：公式サイトから
1. [Node.js公式サイト](https://nodejs.org/)にアクセス
2. **LTS版**（推奨版）をダウンロード
3. ダウンロードしたファイルを実行してインストール
4. インストール確認：
   ```bash
   node --version
   npm --version
   ```
   両方のコマンドでバージョンが表示されればOK

#### 別の方法：パッケージマネージャー経由

**Windows（Chocolatey使用）:**
```bash
choco install nodejs
```

**Mac（Homebrew使用）:**
```bash
brew install node
```

**Linux（Ubuntu/Debian）:**
```bash
# NodeSourceリポジトリを追加
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Gitのインストール

#### Windows/Mac
1. [Git公式サイト](https://git-scm.com/)からダウンロード
2. インストーラーを実行（基本的にデフォルト設定でOK）
3. インストール確認：
   ```bash
   git --version
   ```

#### Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install git

# CentOS/RHEL
sudo yum install git
```

### Docker Desktopのインストール

#### Windows/Mac
1. [Docker Desktop公式サイト](https://www.docker.com/products/docker-desktop/)にアクセス
2. お使いのOS用のDocker Desktopをダウンロード
3. ダウンロードしたファイルを実行してインストール
4. インストール後、Docker Desktopを起動
5. ターミナルで以下のコマンドで動作確認：
   ```bash
   docker --version
   docker-compose --version
   ```

#### Linux (Ubuntu/Debian)
```bash
# Dockerの公式リポジトリを追加
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Dockerをインストール
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io

# Docker Composeをインストール
sudo curl -L "https://github.com/docker/compose/releases/download/v2.0.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# ユーザーをdockerグループに追加（再ログインが必要）
sudo usermod -aG docker $USER
```

## 1. リポジトリのクローン

```bash
git clone [リポジトリURL]
cd fishing-app
```

## 2. 依存関係のインストール

```bash
npm install
```

## 3. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
# データベース接続
DATABASE_URL="postgresql://user:password@localhost:5433/fishing_app"

# AWS Cognito設定
NEXT_PUBLIC_AWS_REGION="ap-northeast-1"
NEXT_PUBLIC_USER_POOLS_ID="your_user_pool_id"
NEXT_PUBLIC_USER_POOLS_WEB_CLIENT_ID="your_client_id"

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
```

**注意**: 実際の値については開発チームメンバーに確認してください。

## 4. データベースのセットアップ

### Docker Composeを使用する場合（推奨）

```bash
# PostgreSQLデータベースを起動
npm run docker:db
```

### 手動でPostgreSQLを起動する場合

PostgreSQLを手動でインストールし、ポート5433で起動してください。

## 5. データベースの初期化

```bash
# Prismaクライアントを生成
npm run db:generate

# マイグレーションを実行
npm run db:migrate

# 初期データをシード
npm run db:seed
```

## 6. 開発サーバーの起動

```bash
npm run dev
```

サーバーが正常に起動すると、ブラウザで `http://localhost:3000` にアクセスできます。

## 7. 動作確認

1. ブラウザで `http://localhost:3000` を開く
2. ホームページが表示されることを確認
3. 新規投稿ページ（`/post/new`）にアクセスして投稿フォームが表示されることを確認

## トラブルシューティング

### データベース接続エラーが発生する場合

```bash
# Dockerサービスの状態を確認
npm run docker:logs

# データベースサービスを再起動
npm run docker:down
npm run docker:db
```

### 依存関係の問題が発生する場合

```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### ポート3000が使用中の場合

```bash
# 使用中のプロセスを確認
lsof -ti:3000

# プロセスを終了
kill -9 [PID]
```

## 開発時に役立つコマンド

```bash
# リンターの実行
npm run lint

# プロダクション版のビルド
npm run build

# Prisma Studioでデータベースを確認
npm run db:studio

# 全Dockerサービスの起動（フルスタック）
npm run docker:up
```

## ディレクトリ構造

```
fishing-app/
├── app/                    # Next.js App Router
│   ├── home/              # ホームページ
│   ├── post/new/          # 投稿作成ページ
│   └── layout.tsx         # レイアウト
├── components/            # 共有コンポーネント
├── lib/                   # ユーティリティ
├── prisma/               # データベーススキーマ
├── docker-compose.yml    # Docker設定
└── package.json          # 依存関係
```

セットアップでわからないことがあれば、開発チームメンバーに気軽に質問してください！