import type { Post } from '@/types/post'
import type { FishingArea } from '@/types/fishing-area'

type PostsResult = { success: boolean; posts: Post[] }
type AreasResult = { success: boolean; fishingAreas: FishingArea[] }

export const extractPosts = (result: PostsResult): Post[] =>
  result.success ? result.posts : []

export const extractFishingAreas = (result: AreasResult): FishingArea[] =>
  result.success ? result.fishingAreas : []
