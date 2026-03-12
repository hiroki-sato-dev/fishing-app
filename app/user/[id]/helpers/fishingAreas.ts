type FishingAreaPin = {
  id: string
  name: string | null
  centerLat: number
  centerLng: number
  radius: number
  postCount: number
}

type PostWithFishingArea = {
  fishingArea?: FishingAreaPin | null
}

export const extractUniqueFishingAreas = (posts: PostWithFishingArea[]): FishingAreaPin[] => {
  const map = new Map<string, FishingAreaPin>()
  posts.forEach((post) => {
    if (post.fishingArea && !map.has(post.fishingArea.id)) {
      map.set(post.fishingArea.id, post.fishingArea)
    }
  })
  return Array.from(map.values())
}
