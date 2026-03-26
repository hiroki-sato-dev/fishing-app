import { notFound } from 'next/navigation'
import { getServerUser } from '@/lib/auth'
import Link from 'next/link'
import {
  Box, Container, Avatar, Typography, Button, Chip,
  Card, CardContent, Grid, Divider,
} from '@mui/material'
import { Person, FavoriteBorder, LocationOn, Waves } from '@mui/icons-material'
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
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc, #eff6ff)', pt: { xs: 8, md: 10 } }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>

        {/* Profile Card */}
        <Card sx={{ borderRadius: 4, mb: 4, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          {/* Header gradient */}
          <Box sx={{ height: 80, background: 'linear-gradient(135deg, #3B82F6, #0ea5e9, #14b8a6)' }} />
          <CardContent sx={{ px: { xs: 3, md: 5 }, pt: 0, pb: { xs: 3, md: 4 } }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              mb: 2,
              flexWrap: 'wrap',
              gap: 2,
            }}>
              <Avatar
                src={user.iconUrl ?? undefined}
                sx={{
                  width: { xs: 72, md: 96 },
                  height: { xs: 72, md: 96 },
                  bgcolor: 'primary.main',
                  border: '4px solid white',
                  mt: { xs: -4, md: -5 },
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                {!user.iconUrl && <Person sx={{ fontSize: { xs: 36, md: 48 } }} />}
              </Avatar>

              <Box sx={{ pb: 0.5 }}>
                {isOwnProfile ? (
                  <Button
                    variant="outlined"
                    size="small"
                    href="/user/settings"
                    sx={{ borderRadius: 2, fontWeight: 600, px: 3 }}
                  >
                    プロフィールを編集
                  </Button>
                ) : currentUserId && (
                  <FollowButton targetUserId={id} initialStatus={followStatus} />
                )}
              </Box>
            </Box>

            {/* Name & bio */}
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {user.name}
            </Typography>
            {user.bio && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 480 }}>
                {user.bio}
              </Typography>
            )}

            {/* Chips */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
              {user.fishingYears != null && (
                <Chip
                  icon={<Waves sx={{ fontSize: 14 }} />}
                  label={`釣り歴 ${user.fishingYears}年`}
                  size="small"
                  variant="outlined"
                />
              )}
              {user.mainFishing && (
                <Chip
                  icon={<LocationOn sx={{ fontSize: 14 }} />}
                  label={user.mainFishing}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              )}
            </Box>

            {/* Stats */}
            <Divider sx={{ mb: 2.5 }} />
            <Box sx={{ display: 'flex', gap: { xs: 3, md: 5 } }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {user._count.posts}
                </Typography>
                <Typography variant="caption" color="text.secondary">投稿</Typography>
              </Box>
              <Box
                component={Link}
                href={`/user/${id}/follows?tab=followers`}
                sx={{ textAlign: 'center', textDecoration: 'none', color: 'inherit', '&:hover': { opacity: 0.7 } }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {user._count.followers}
                </Typography>
                <Typography variant="caption" color="text.secondary">フォロワー</Typography>
              </Box>
              <Box
                component={Link}
                href={`/user/${id}/follows?tab=following`}
                sx={{ textAlign: 'center', textDecoration: 'none', color: 'inherit', '&:hover': { opacity: 0.7 } }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {user._count.following}
                </Typography>
                <Typography variant="caption" color="text.secondary">フォロー中</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Main content: map (left) + posts (right) on desktop */}
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', flexDirection: { xs: 'column', md: 'row' } }}>

          {/* Left: Map (sticky on desktop) */}
          {userFishingAreas.length > 0 && (
            <Box sx={{ width: { xs: '100%', md: 340, lg: 380 }, flexShrink: 0, position: { md: 'sticky' }, top: { md: 80 } }}>
              <Card sx={{ borderRadius: 4, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <CardContent sx={{ p: 2.5, pb: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    釣りポイント ({userFishingAreas.length}箇所)
                  </Typography>
                </CardContent>
                <UserFishingMap areas={userFishingAreas} height="320px" />
              </Card>
            </Box>
          )}

          {/* Right: Posts */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              投稿一覧
            </Typography>

            {posts.length === 0 ? (
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" color="text.secondary">
                    まだ投稿がありません
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Grid container spacing={2}>
                {posts.map((post) => (
                  <Grid item xs={12} lg={6} key={post.id}>
                    <Card
                      component={Link}
                      href={`/post/${post.id}`}
                      sx={{
                        borderRadius: 3,
                        border: '1px solid rgba(0,0,0,0.06)',
                        transition: 'all 0.2s',
                        textDecoration: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' },
                      }}
                    >
                      {/* Post image */}
                      {post.imageUrls.length > 0 && (
                        <Box sx={{
                          position: 'relative',
                          aspectRatio: '16 / 9',
                          overflow: 'hidden',
                          borderRadius: '12px 12px 0 0',
                          bgcolor: '#f0f0f0',
                        }}>
                          <NextImage
                            src={post.imageUrls[0]}
                            alt="投稿画像"
                            fill
                            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 400px"
                            style={{ objectFit: 'cover' }}
                          />
                          {post.imageUrls.length > 1 && (
                            <Box sx={{
                              position: 'absolute', bottom: 8, right: 8,
                              bgcolor: 'rgba(0,0,0,0.55)', color: 'white',
                              borderRadius: 1, px: 1, py: 0.25,
                              fontSize: 12, fontWeight: 600,
                            }}>
                              +{post.imageUrls.length - 1}
                            </Box>
                          )}
                        </Box>
                      )}

                      <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography
                          variant="body2"
                          sx={{
                            mb: 1.5, lineHeight: 1.6, flex: 1,
                            display: '-webkit-box', WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          }}
                        >
                          {post.content}
                        </Typography>

                        {post.fishingArea && (
                          <Chip
                            label={`📍 ${post.fishingArea.name || '釣りポイント'}`}
                            variant="outlined"
                            color="primary"
                            size="small"
                            sx={{ mb: 1.5, alignSelf: 'flex-start' }}
                          />
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <FavoriteBorder fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
                            <Typography variant="caption" color="text.secondary">
                              {post.likes.length}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(post.createdAt).toLocaleDateString('ja-JP', {
                              timeZone: 'Asia/Tokyo',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
