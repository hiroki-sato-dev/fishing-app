export type Post = {
  id: string
  content: string
  imageUrls: string[]
  latitude: number | null
  longitude: number | null
  address?: string // 住所（オプション）
  createdAt: Date
  updatedAt: Date
  user: {
    name: string
    iconUrl: string | null
  }
  likes: Array<{ id: string }>
}