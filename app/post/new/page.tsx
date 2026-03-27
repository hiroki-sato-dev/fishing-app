import { PostFormClient } from './components/PostFormClient'
import { getFishingAreas } from '@/app/home/actions/getPosts'
import { Container, Typography } from '@mui/material'
import type { FishingArea } from '@/types/fishing-area'

export default async function NewPostPage() {
  const areasResult = await getFishingAreas()
  const fishingAreas: FishingArea[] = areasResult.success ? areasResult.fishingAreas : []

  return (
    <Container maxWidth="sm" sx={{ pt: { xs: 10, md: 12 }, pb: 6 }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 3 }}>
        釣果を投稿
      </Typography>
      <PostFormClient fishingAreas={fishingAreas} />
    </Container>
  )
}
