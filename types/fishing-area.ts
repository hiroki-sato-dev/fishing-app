export type FishingArea = {
  id: string
  name: string | null
  centerLat: number
  centerLng: number
  radius: number
  description: string | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
  postCount: number
  creator?: {
    name: string
    iconUrl: string | null
  }
  posts?: Array<{
    id: string
    content: string
    imageUrls: string[]
    createdAt: Date
    user: {
      name: string
      iconUrl: string | null
    }
  }>
}