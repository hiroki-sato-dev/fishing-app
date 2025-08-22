# 3. データモデル

## 3.1 データベース設計

### 3.1.1 User（ユーザー）
```prisma
model User {
  id           String   @id @default(cuid())
  name         String   // ユーザー名（16文字以内）
  email        String   @unique
  iconUrl      String?  // プロフィール画像URL
  bio          String?  // 自己紹介
  fishingYears Int?     // 釣り歴（年数）
  mainFishing  String?  // メインの釣りもの
  isPrivate    Boolean  @default(false) // 鍵付きアカウント
  createdAt    DateTime @default(now())
  
  // リレーション
  posts        Post[]
  likes        Like[]
  comments     Comment[]
  followers    Follow[] @relation("Followee")
  following    Follow[] @relation("Follower")
  followRequests FollowRequest[] @relation("RequestedUser")
  sentRequests   FollowRequest[] @relation("RequesterUser")
}
```

### 3.1.2 Post（投稿）
```prisma
model Post {
  id         String   @id @default(cuid())
  userId     String
  content    String   // 投稿内容（256文字以内、必須）
  imageUrls  String[] // 画像URL配列（最大4枚）
  latitude   Float?   // 緯度（任意）
  longitude  Float?   // 経度（任意）
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  // リレーション
  user       User      @relation(fields: [userId], references: [id])
  likes      Like[]
  comments   Comment[]
}
```

### 3.1.3 Like（いいね）
```prisma
model Like {
  id      String @id @default(cuid())
  userId  String
  postId  String
  createdAt DateTime @default(now())
  
  // リレーション
  user    User   @relation(fields: [userId], references: [id])
  post    Post   @relation(fields: [postId], references: [id])
  
  @@unique([userId, postId])
}
```

### 3.1.4 Comment（コメント）
```prisma
model Comment {
  id        String   @id @default(cuid())
  userId    String
  postId    String
  content   String   // コメント内容
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // リレーション
  user      User     @relation(fields: [userId], references: [id])
  post      Post     @relation(fields: [postId], references: [id])
}
```

### 3.1.5 Follow（フォロー関係）
```prisma
model Follow {
  id         String   @id @default(cuid())
  followerId String
  followeeId String
  createdAt  DateTime @default(now())
  
  // リレーション
  follower   User     @relation("Follower", fields: [followerId], references: [id])
  followee   User     @relation("Followee", fields: [followeeId], references: [id])
  
  @@unique([followerId, followeeId])
}
```

### 3.1.6 FollowRequest（フォロー申請）
```prisma
model FollowRequest {
  id          String   @id @default(cuid())
  requesterId String   // 申請者
  requestedId String   // 申請先
  status      String   @default("pending") // pending, approved, rejected
  createdAt   DateTime @default(now())
  
  // リレーション
  requester   User     @relation("RequesterUser", fields: [requesterId], references: [id])
  requested   User     @relation("RequestedUser", fields: [requestedId], references: [id])
  
  @@unique([requesterId, requestedId])
}
```

## 3.2 将来拡張予定のモデル（フェーズ3以降）

### 3.2.1 FishSpecies（魚種）
```prisma
model FishSpecies {
  id        String @id @default(cuid())
  name      String // 魚種名
  category  String // カテゴリ（海水魚/淡水魚など）
  // Postにリレーション追加予定
}
```

### 3.2.2 Tackle（タックル情報）
```prisma
model Tackle {
  id          String @id @default(cuid())
  type        String // ロッド、リール、ライン等
  brand       String // メーカー
  model       String // 型番
  description String // 詳細
  // Postにリレーション追加予定
}
```

## 3.3 データ制約事項

### 3.3.1 文字数制限
- **ユーザー名**: 16文字以内
- **投稿内容**: 256文字以内（必須）
- **コメント内容**: 500文字以内
- **自己紹介**: 200文字以内

### 3.3.2 ファイル制限
- **プロフィール画像**: 5MB以内、JPG/PNG/WebP
- **投稿画像**: 1枚あたり10MB以内、最大4枚、JPG/PNG/WebP

### 3.3.3 地理的制約
- **緯度**: -90 ～ 90
- **経度**: -180 ～ 180