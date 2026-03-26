import { notFound } from 'next/navigation'
import { getServerUser } from '@/lib/auth'
import Link from 'next/link'
import {
  Box, Container, Card, CardContent, Avatar, AvatarGroup, Typography,
  Chip, Divider, IconButton, Button, Tooltip,
} from '@mui/material'
import { Person, ArrowBack, ChatBubbleOutline } from '@mui/icons-material'
import { LikeButton } from '@/components/LikeButton'
import { CommentSection } from './CommentSection'
import { PostDetailMap } from './PostDetailMap'
import { getPost, getCurrentDbUserId } from './actions/getPost'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params

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
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc, #eff6ff)', pt: { xs: 8, md: 10 } }}>
      <Container maxWidth="sm" sx={{ py: { xs: 2, sm: 4 } }}>

        {/* Back button */}
        <Box sx={{ mb: { xs: 1, sm: 2 } }}>
          <IconButton component={Link} href="/home" sx={{ color: 'text.secondary', p: { xs: 0.5, sm: 1 } }}>
            <ArrowBack />
          </IconButton>
        </Box>

        {/* Post Card */}
        <Card sx={{ borderRadius: { xs: 3, sm: 4 }, mb: { xs: 2, sm: 3 }, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>

            {/* Author */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1.5, sm: 2 } }}>
              <Avatar
                component={Link}
                href={`/user/${post.user.id}`}
                src={post.user.iconUrl ?? undefined}
                sx={{
                  width: { xs: 38, sm: 44 },
                  height: { xs: 38, sm: 44 },
                  mr: 1.5,
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
                  sx={{
                    fontWeight: 600,
                    textDecoration: 'none',
                    color: 'text.primary',
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  {post.user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  {new Date(post.createdAt).toLocaleDateString('ja-JP', {
                    timeZone: 'Asia/Tokyo',
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </Typography>
              </Box>
            </Box>

            {/* Content */}
            <Typography sx={{ lineHeight: 1.8, mb: { xs: 1.5, sm: 2 }, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              {post.content}
            </Typography>

            {/* Images */}
            {post.imageUrls.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: { xs: 1.5, sm: 2 } }}>
                {post.imageUrls.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={`投稿画像${i + 1}`}
                    style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }}
                  />
                ))}
              </Box>
            )}

            {/* Fishing Area */}
            {post.fishingArea && (
              <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                <Chip
                  label={`📍 ${post.fishingArea.name || '釣りポイント'}`}
                  variant="outlined"
                  color="primary"
                  size="small"
                  sx={{ mb: 1.5, fontSize: { xs: '0.75rem', sm: '0.8rem' } }}
                />
                <PostDetailMap
                  centerLat={post.fishingArea.centerLat}
                  centerLng={post.fishingArea.centerLng}
                  radius={post.fishingArea.radius}
                  areaName={post.fishingArea.name}
                  height="240px"
                />
              </Box>
            )}

            <Divider sx={{ mb: { xs: 1.5, sm: 2 } }} />

            {/* Likes & Comments */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LikeButton
                postId={post.id}
                likeCount={post.likes.length}
                isLiked={post.likes.some(l => l.userId === currentUserId)}
                isLoggedIn={isLoggedIn}
              />
              {post.comments.length > 0 && (() => {
                const uniqueUsers = post.comments.filter(
                  (c, i, arr) => arr.findIndex(x => x.user.id === c.user.id) === i
                )
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ChatBubbleOutline sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mr: 0.5, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      {post.comments.length}
                    </Typography>
                    <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 20, height: 20, fontSize: 10, border: '1.5px solid white' } }}>
                      {uniqueUsers.map(c => (
                        <Tooltip key={c.user.id} title={c.user.name} arrow>
                          <Avatar src={c.user.iconUrl ?? undefined} sx={{ width: 20, height: 20, bgcolor: 'primary.main', fontSize: 10 }}>
                            {!c.user.iconUrl && c.user.name[0]}
                          </Avatar>
                        </Tooltip>
                      ))}
                    </AvatarGroup>
                  </Box>
                )
              })()}
            </Box>

            {/* いいねしたユーザー（投稿者本人のみ） */}
            {currentUserId === post.user.id && post.likes.length > 0 && (
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  いいねしたユーザー
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5 }}>
                  {post.likes.slice(0, 5).map((like, i) => (
                    <Box key={like.id} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        component={Link}
                        href={`/user/${like.user.id}`}
                        sx={{ fontWeight: 600, textDecoration: 'none', color: 'primary.main', fontSize: { xs: '0.8rem', sm: '0.875rem' }, '&:hover': { textDecoration: 'underline' } }}
                      >
                        {like.user.name}
                      </Typography>
                      {i < Math.min(post.likes.length, 5) - 1 && (
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>、</Typography>
                      )}
                    </Box>
                  ))}
                  {post.likes.length > 5 && (
                    <Button
                      component={Link}
                      href={`/post/${post.id}/likes`}
                      size="small"
                      sx={{ fontSize: '0.75rem', p: 0, minWidth: 0, color: 'text.secondary', textDecoration: 'underline', '&:hover': { bgcolor: 'transparent', color: 'primary.main' } }}
                    >
                      他{post.likes.length - 5}人
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Comments */}
        <Card sx={{ borderRadius: { xs: 3, sm: 4 }, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
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
