FROM node:18-alpine

WORKDIR /app

# 依存関係ファイルをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci

# アプリケーションファイルをコピー
COPY . .

# Prismaクライアントを生成
RUN npx prisma generate

# ポートを公開
EXPOSE 3000

# 開発サーバーを起動
CMD ["npm", "run", "dev"]