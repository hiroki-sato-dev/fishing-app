export type Post = {
  id: string
  content: string
  imageUrls: string[]
  fishingAreaId: string | null
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    name: string
    iconUrl: string | null
  }
  fishingArea?: {
    id: string
    name: string | null
    centerLat: number
    centerLng: number
    radius: number
    description: string | null
    postCount: number
  } | null
  likes: Array<{ id: string; userId: string }>
  comments: Array<{ id: string; user: { id: string; iconUrl: string | null; name: string } }>
}
