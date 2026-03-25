# インフラ構成

## 方針

個人開発・コスト最小化を前提に、友人・身内スタートから段階的にスケールできる構成。
将来的な AWS 全面移行（ECS 等）への移行コストを最小化するロードマップを設ける。

---

## 環境戦略

### 環境一覧

| 環境 | 用途 | 状態 |
|---|---|---|
| **dev** | 開発・動作確認 | **構築済み** |
| **stg** | ステージング・受け入れテスト | 将来構築 |
| **prd** | 本番 | 将来構築 |

### 環境分離の方針

- **Terraform Workspace** でステートファイルを環境ごとに分離（`dev` / `stg` / `prd`）
- **リソース命名**: dev は suffix なし（例: `fishing-app-user-pool`）、stg/prd は `-{env}` suffix（例: `fishing-app-stg-user-pool`）
- **Neon はブランチで環境分離**（1プロジェクト内で `dev` / `main` ブランチを使い分け）
- **Vercel は環境ごとに別プロジェクト**（`fishing-app-dev` / `fishing-app-prd` 等）

### Neon ブランチ戦略

```
Neon Project: fishing-app
├── main branch    → prd 環境（将来）
├── staging branch → stg 環境（将来）
└── dev branch     → dev 環境（現在構築対象）
```

ブランチごとに独立した接続 URL が発行される。スキーマ変更は dev ブランチで検証後 main へ反映。

---

## フェーズ別推奨構成

### Phase 1: ローンチ期（〜100 MAU）　目安: **$0〜$1/月**

| サービス | 選択肢 | 費用 | 理由 |
|---|---|---|---|
| **アプリホスティング** | Vercel Hobby | $0 | Next.js 公式サポート、App Router・Server Actions 最適化済み |
| **データベース** | Neon（Serverless PostgreSQL） | $0 | 無料枠 0.5GB、未使用時コスト0、Prisma 完全対応 |
| **画像ストレージ** | AWS S3 + CloudFront | $0〜$1 | S3 $0.025/GB、CF は**永久無料枠** 1TB/月（12ヶ月限定ではない） |
| **認証** | AWS Cognito | $0 | 50,000 MAU まで永久無料（現在も利用中） |
| **合計** | | **$0〜$1** | |

### Phase 2: 成長期（〜1,000 MAU）　目安: **$20〜$45/月**

| サービス | 選択肢 | 費用 | 変更理由 |
|---|---|---|---|
| **アプリホスティング** | Vercel Pro | $20 | 関数タイムアウト 15s、帯域 1TB |
| **データベース** | Neon Free（継続）or Scale | $0 or $19 | 0.5GB 超えたら Scale ($19) へ |
| **画像・CDN** | S3 + CloudFront | $1〜$5 | 使用量次第 |
| **合計** | | **$21〜$44** | |

### Phase 3: 本格運用期（10,000 MAU〜）　目安: **$80〜$130/月**

| サービス | 選択肢 | 費用 |
|---|---|---|
| **アプリ** | AWS ECS Fargate（または App Runner） | $30〜$50 |
| **DB** | Amazon RDS PostgreSQL（t4g.small） | $25 |
| **LB** | ALB | $16 |
| **画像・CDN** | S3 + CloudFront | $5〜$20 |
| **認証** | Cognito（継続） | $0 |
| **合計** | | **$76〜$111** |

---

## サービス選定理由

### Neon を RDS より推奨する理由（Phase 1-2）
- RDS `db.t3.micro` は**常時起動で $12〜15/月**（使っていなくても課金）
- Neon はサーバーレス：アクセスがなければ**コスト $0**
- Prisma の接続設定はほぼそのまま（`DATABASE_URL` を差し替えるだけ）
- Neon → RDS の移行は `pg_dump / pg_restore` で簡単
- リージョン: 東京なし。**シンガポール（`aws-ap-southeast-1`）が最近傍**

### Vercel を EC2/ECS より推奨する理由（Phase 1-2）
- Next.js App Router・Server Actions との親和性が最高
- デプロイが `git push` だけで完結、CI/CD 設定不要
- Phase 3 で ECS 移行時もコードはそのまま（Dockerfile 追加のみ）

### S3 画像アップロードの設計方針
- ブラウザから **Presigned URL** で直接 S3 にアップロード（サーバーを経由しない）
- Server Action で Presigned URL を生成 → クライアントが PUT → URL を DB 保存
- Vercel の関数帯域を消費せず、コスト最小化

---

## 移行ロードマップ

```
現在（ローカル開発）
    ↓
dev 環境構築: Vercel + Neon dev ブランチ + S3 + Cognito ✅ 構築済み
   → $0〜$1/月
    ↓（stg/prd 環境追加）
Phase 1: Vercel Hobby + Neon + S3 + Cognito（prd）
   → $0〜$1/月
   → git push でデプロイ、DATABASE_URL 差し替えのみ
    ↓（〜1,000 MAU 超えたら）
Phase 2: Vercel Pro + Neon Scale（or Free継続）+ S3 + CF
   → $20〜$45/月
    ↓（〜10,000 MAU 超えたら or 本格サービス化）
Phase 3: ECS Fargate + RDS + ALB + S3 + CF + Cognito（全 AWS）
   → $80〜$130/月
   → Vercel → ECS: Dockerfile 追加 + GitHub Actions CI/CD 設定
   → Neon → RDS: pg_dump → RDS へリストア
```

---

## よくある質問

**Q: Vercel Hobby の制限は大丈夫？**
- 関数タイムアウト 10秒：Server Actions が重い処理をしない限り問題なし
- 帯域 100GB/月：100人規模なら全く問題なし

**Q: CloudFront は最初から必要？**
- 画像配信は最初から S3 + CloudFront の構成を推奨
- CF の無料枠は**永久無料**（1TB/月・1,000万リクエスト）— 12ヶ月限定ではない
- 最初から CF 経由にすることで、後からドメイン・URL 変更が不要

**Q: Neon の無料枠 0.5GB は足りる？**
- テキストデータ中心の SNS なら 1,000 投稿 × 1KB ≒ 1MB 程度
- 画像は S3 に置くので DB は小さく保てる
- 相当長い間は無料枠で運用可能

**Q: Neon に東京リージョンはないの？**
- ない。アジア圏は `aws-ap-southeast-1`（シンガポール）と `aws-ap-southeast-2`（シドニー）のみ
- シンガポールが日本から最も近いため `aws-ap-southeast-1` を採用
