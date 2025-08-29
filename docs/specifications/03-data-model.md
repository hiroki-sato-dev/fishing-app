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
  createdAreas FishingArea[]  // 作成した釣りポイント
}
```

### 3.1.2 FishingArea（釣りポイント・エリア）
```prisma
model FishingArea {
  id          String   @id @default(cuid())
  name        String?  // エリア名（ユーザー命名可能、32文字以内）
  centerLat   Float    // 円の中心緯度
  centerLng   Float    // 円の中心経度
  radius      Int      @default(200) // 円の半径（メートル）
  description String?  // エリアの説明（256文字以内）
  createdBy   String   // エリア作成者
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // 統計情報
  postCount   Int      @default(0) // 投稿数（非正規化）
  
  // リレーション
  creator     User     @relation(fields: [createdBy], references: [id])
  posts       Post[]
  fishData    FishAreaData[] // フェーズ3で追加予定
}
```

### 3.1.3 Post（投稿）
```prisma
model Post {
  id            String      @id @default(cuid())
  userId        String
  content       String      // 投稿内容（256文字以内、必須）
  imageUrls     String[]    // 画像URL配列（最大4枚）
  fishingAreaId String?     // 釣りポイントID（必須だが移行期間中は任意）
  latitude      Float?      // 緯度（移行期間中の既存データ用・新規投稿では非推奨）
  longitude     Float?      // 経度（移行期間中の既存データ用・新規投稿では非推奨）
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  // リレーション
  user          User        @relation(fields: [userId], references: [id])
  fishingArea   FishingArea? @relation(fields: [fishingAreaId], references: [id])
  likes         Like[]
  comments      Comment[]
}
```

### 3.1.4 Like（いいね）
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

### 3.1.5 Comment（コメント）
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

### 3.1.6 Follow（フォロー関係）
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

### 3.1.7 FollowRequest（フォロー申請）
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

### 3.2.1 FishAreaData（エリア別魚データ）
```prisma
model FishAreaData {
  id           String      @id @default(cuid())
  fishingAreaId String
  fishSpecies  String      // 魚種名
  probability  Float       // 釣れる確率（0-1）
  bestSeason   String?     // 最適時期（"春", "夏"など）
  bestTime     String?     // 最適時間帯（"朝", "夕"など）
  avgSize      Float?      // 平均サイズ（cm）
  notes        String?     // 釣り方・ポイント等の補足
  lastUpdated  DateTime    @updatedAt
  
  // リレーション
  fishingArea  FishingArea @relation(fields: [fishingAreaId], references: [id])
  
  @@unique([fishingAreaId, fishSpecies])
}
```

### 3.2.2 FishSpecies（魚種マスタ）
```prisma
model FishSpecies {
  id        String @id @default(cuid())
  name      String @unique // 魚種名
  category  String         // カテゴリ（海水魚/淡水魚など）
  habitat   String?        // 生息地（"河口", "沖合"など）
  iconUrl   String?        // 魚種アイコンURL
  
  // 将来的にPostテーブルとの直接リレーション追加予定
}
```

### 3.2.3 Tackle（タックル情報）
```prisma
model Tackle {
  id          String @id @default(cuid())
  type        String // ロッド、リール、ライン等
  brand       String // メーカー
  model       String // 型番
  description String // 詳細
  imageUrl    String? // 商品画像URL
  
  // 将来的にPostテーブルとの直接リレーション追加予定
}
```

## 3.3 データ制約事項

### 3.3.1 文字数制限
- **ユーザー名**: 16文字以内
- **投稿内容**: 256文字以内（必須）
- **コメント内容**: 500文字以内
- **自己紹介**: 200文字以内
- **釣りエリア名**: 32文字以内
- **釣りエリア説明**: 256文字以内

### 3.3.2 ファイル制限
- **プロフィール画像**: 5MB以内、JPG/PNG/WebP
- **投稿画像**: 1枚あたり10MB以内、最大4枚、JPG/PNG/WebP

### 3.3.3 地理的制約
- **緯度**: -90 ～ 90
- **経度**: -180 ～ 180
- **釣りエリア半径**: 50 ～ 1000メートル（デフォルト: 200m）

### 3.3.4 FishingArea（釣りエリア）制約
- **重複チェック**: 新規エリア作成時、既存エリアとの重複判定（中心点から半径内）
- **統合提案**: 近接する複数エリア（中心間距離100m以内）の統合提案機能
- **最小投稿数**: エリア表示には最低1件の投稿が必要
- **既存投稿の移行**: 個別位置投稿（latitude/longitude）は最寄りエリアに自動統合表示
- **表示方針**: 地図上はエリア円形のみ表示、個別ピンは廃止