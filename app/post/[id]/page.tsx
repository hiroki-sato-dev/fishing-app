import { notFound } from 'next/navigation'
import { getServerUser } from '@/lib/auth'
import Link from 'next/link'
import {
  Box, Container, Card, CardContent, Avatar, Typography,
  Chip, Divider, IconButton,
} from '@mui/material'
import { Person, FavoriteBorder, ArrowBack } from '@mui/icons-material'
import { CommentSection } from './CommentSection'
import { PostDetailMap } from './PostDetailMap'
import { getPost, getCurrentDbUserId } from './actions/getPost'

interface Props {
  params: { id: string }
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = params

  const post = await getPost(id)
  if (!post) notFound()

  const cognitoUser = await getServerUser()
  let currentUserId: string | null = null
  let isLoggedIn = false

  if (cognitoUser) {
    isLoggedIn = true
    currentUserId = await getCurrentDbUserId(cognitoUser.username)
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc, #eff6ff)', pt: 10 }}>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        {/* Back button */}
        <Box sx={{ mb: 2 }}>
          <IconButton component={Link} href="/home" sx={{ color: 'text.secondary' }}>
            <ArrowBack />
          </IconButton>
        </Box>

        {/* Post Card */}
        <Card sx={{ borderRadius: 4, mb: 3, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 3 }}>
            {/* Author */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                component={Link}
                href={`/user/${post.user.id}`}
                src={post.user.iconUrl ?? undefined}
                sx={{
                  width: 44, height: 44, mr: 1.5,
                  background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
                  cursor: 'pointer',
                }}
              >
                {!post.user.iconUrl && <Person />}
              </Avatar>
              <Box>
                <Typography
                  component={Link}
                  href={`/user/${post.user.id}`}
                  variant="subtitle1"
                  sx={{ fontWeight: 600, textDecoration: 'none', color: 'text.primary', '&:hover': { color: 'primary.main' } }}
                >
                  {post.user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {new Date(post.createdAt).toLocaleDateString('ja-JP', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </Typography>
              </Box>
            </Box>

            {/* Content */}
            <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
              {post.content}
            </Typography>

            {/* Images */}
            {post.imageUrls.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {post.imageUrls.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={`投稿画像${i + 1}`}
                    style={{ width: '100%', maxWidth: 400, borderRadius: 8, objectFit: 'cover' }}
                  />
                ))}
              </Box>
            )}

            {/* Fishing Area */}
            {post.fishingArea && (
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={`📍 ${post.fishingArea.name || '釣りポイント'}`}
                  variant="outlined"
                  color="primary"
                  size="small"
                  sx={{ mb: 1.5 }}
                />
                <PostDetailMap
                  centerLat={post.fishingArea.centerLat}
                  centerLng={post.fishingArea.centerLng}
                  radius={post.fishingArea.radius}
                  areaName={post.fishingArea.name}
                />
              </Box>
            )}

            <Divider sx={{ mb: 2 }} />

            {/* Likes */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                size="small"
                sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: 'rgba(244,67,54,0.1)' } }}
              >
                <FavoriteBorder fontSize="small" />
              </IconButton>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {post.likes.length}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Comments */}
        <Card sx={{ borderRadius: 4, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 3 }}>
            <CommentSection
              postId={post.id}
              comments={post.comments}
              currentUserId={currentUserId}
              isLoggedIn={isLoggedIn}
            />
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
