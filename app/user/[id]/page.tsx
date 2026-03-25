import { notFound } from 'next/navigation'
import { getServerUser } from '@/lib/auth'
import Link from 'next/link'
import {
  Box, Container, Avatar, Typography, Button, Chip,
  Card, CardContent, Grid, Divider,
} from '@mui/material'
import { Person, FavoriteBorder } from '@mui/icons-material'
import NextImage from 'next/image'
import type { Post } from '@/types/post'
import { UserFishingMap } from './UserFishingMap'
import { getUser, getCurrentDbUserId, getFollowStatus } from './actions/getUser'
import { FollowButton } from '@/components/FollowButton'
import { extractUniqueFishingAreas } from './helpers/fishingAreas'

interface Props {
  params: Promise<{ id: string }>
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params

  const user = await getUser(id)
  if (!user) notFound()

  const cognitoUser = await getServerUser()
  let isOwnProfile = false
  let currentUserId: string | null = null
  let followStatus: 'following' | 'requested' | 'none' = 'none'
  if (cognitoUser?.username) {
    currentUserId = await getCurrentDbUserId(cognitoUser.username)
    isOwnProfile = currentUserId === id
    if (currentUserId && !isOwnProfile) {
      followStatus = await getFollowStatus(currentUserId, id)
    }
  }

  const posts = user.posts as Post[]
  const userFishingAreas = extractUniqueFishingAreas(user.posts)

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc, #eff6ff)', pt: 10 }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Profile Card */}
        <Card sx={{ borderRadius: 4, mb: 4, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, flexWrap: 'wrap' }}>
              <Avatar
                src={user.iconUrl ?? undefined}
                sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32 }}
              >
                {!user.iconUrl && <Person sx={{ fontSize: 40 }} />}
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {user.name}
                  </Typography>
                  {isOwnProfile ? (
                    <Button
                      variant="outlined"
                      size="small"
                      href="/user/settings"
                      sx={{ borderRadius: 2, fontWeight: 600 }}
                    >
                      編集
                    </Button>
                  ) : currentUserId && (
                    <FollowButton targetUserId={id} initialStatus={followStatus} />
                  )}
                </Box>

                {user.bio && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {user.bio}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {user.fishingYears != null && (
                    <Chip label={`釣り歴 ${user.fishingYears}年`} size="small" variant="outlined" />
                  )}
                  {user.mainFishing && (
                    <Chip label={user.mainFishing} size="small" variant="outlined" color="primary" />
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{user._count.posts}</Typography>
                    <Typography variant="caption" color="text.secondary">投稿</Typography>
                  </Box>
                  <Box
                    component={Link}
                    href={`/user/${id}/follows?tab=followers`}
                    sx={{ textAlign: 'center', textDecoration: 'none', color: 'inherit', '&:hover': { opacity: 0.7 } }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{user._count.followers}</Typography>
                    <Typography variant="caption" color="text.secondary">フォロワー</Typography>
                  </Box>
                  <Box
                    component={Link}
                    href={`/user/${id}/follows?tab=following`}
                    sx={{ textAlign: 'center', textDecoration: 'none', color: 'inherit', '&:hover': { opacity: 0.7 } }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{user._count.following}</Typography>
                    <Typography variant="caption" color="text.secondary">フォロー中</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Fishing Map */}
        {userFishingAreas.length > 0 && (
          <Card sx={{ borderRadius: 4, mb: 4, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <CardContent sx={{ p: 3, pb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                🗺️ 釣りポイント ({userFishingAreas.length}箇所)
              </Typography>
            </CardContent>
            <UserFishingMap areas={userFishingAreas} height="300px" />
          </Card>
        )}

        {/* Posts */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          投稿一覧
        </Typography>

        {posts.length === 0 ? (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary">
                🎣 まだ投稿がありません
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {posts.map((post) => (
              <Grid item xs={12} key={post.id}>
                <Card
                  component={Link}
                  href={`/post/${post.id}`}
                  sx={{
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                    display: 'block',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1.5, lineHeight: 1.6 }}>
                      {post.content}
                    </Typography>

                    {post.imageUrls.length > 0 && (
                      <Box sx={{
                        mb: 1.5,
                        borderRadius: 2,
                        overflow: 'hidden',
                        display: 'grid',
                        gridTemplateColumns: post.imageUrls.length === 1 ? '1fr' : '1fr 1fr',
                        gap: '2px',
                        maxWidth: { xs: '100%', md: 360 },
                      }}>
                        {post.imageUrls.slice(0, 4).map((url, i) => (
                          <Box
                            key={i}
                            sx={{
                              position: 'relative',
                              aspectRatio: '1 / 1',
                              gridRow: post.imageUrls.length === 3 && i === 0 ? 'span 2' : undefined,
                            }}
                          >
                            <NextImage
                              src={url}
                              alt={`投稿画像 ${i + 1}`}
                              fill
                              sizes="(max-width: 600px) 90vw, 360px"
                              style={{ objectFit: 'cover' }}
                            />
                          </Box>
                        ))}
                      </Box>
                    )}

                    {post.fishingArea && (
                      <Chip
                        label={`📍 ${post.fishingArea.name || '釣りポイント'}`}
                        variant="outlined"
                        color="primary"
                        size="small"
                        sx={{ mb: 1.5 }}
                      />
                    )}

                    <Divider sx={{ mb: 1.5 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <FavoriteBorder fontSize="small" sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {post.likes.length}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(post.createdAt).toLocaleDateString('ja-JP', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  )
}
