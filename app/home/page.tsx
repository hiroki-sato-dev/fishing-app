import { getPosts, getFishingAreas, checkDbUserExists, getFollowingIds } from './actions/getPosts'
import { getCurrentDbUserId } from '@/app/post/[id]/actions/getPost'
import { extractPosts, extractFishingAreas } from './helpers/posts'
import { MapCard } from './components/MapCard'
import { PostFab } from './components/PostFab'
import { PostButton } from './components/PostButton'
import { Container, Grid, Typography, Box, Card, CardContent, Avatar, AvatarGroup, Badge, Chip, IconButton, Divider, Tooltip, Tabs, Tab } from '@mui/material'
import { ChatBubbleOutline, MoreVert, Person } from '@mui/icons-material'
import { LikeButton } from '@/components/LikeButton'
import Link from 'next/link'
import NextImage from 'next/image'
import type { Post } from '@/types/post'
import type { FishingArea } from '@/types/fishing-area'
import { getServerUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

type Props = {
  searchParams: Promise<{ feed?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const { feed } = await searchParams
  const isFollowingFeed = feed === 'following'

  const cognitoUser = await getServerUser()
  let currentDbUserId: string | null = null
  if (cognitoUser) {
    const exists = await checkDbUserExists(cognitoUser.username)
    if (!exists) redirect('/user/setup')
    currentDbUserId = await getCurrentDbUserId(cognitoUser.username)
  }

  const followingIds = currentDbUserId ? await getFollowingIds(currentDbUserId) : new Set<string>()

  const followingUserIds = isFollowingFeed && currentDbUserId
    ? [...Array.from(followingIds), currentDbUserId]
    : undefined

  const posts: Post[] = extractPosts(await getPosts(followingUserIds))
  const fishingAreas: FishingArea[] = extractFishingAreas(await getFishingAreas())

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc, #eff6ff)',
      pt: { xs: 8, md: 10 },
    }}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>

        {/* Hero Section */}
        <Box sx={{ mb: { xs: 2, sm: 4 }, textAlign: 'center' }}>
          <Typography
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' },
              background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 0.5,
              letterSpacing: '-0.02em',
            }}
          >
            🌊 今日の釣果をチェック
          </Typography>
          <Typography
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.8rem', sm: '0.95rem', md: '1.1rem' },
              maxWidth: '600px',
              mx: 'auto',
              fontWeight: 400,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            リアルタイムで更新される釣果情報で、次の釣り場を見つけよう
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 2, md: 4 }}>
          {/* 地図エリア - デスクトップのみ表示 */}
          <Grid item xs={12} lg={8} sx={{ display: { xs: 'none', lg: 'block' } }}>
            <MapCard fishingAreas={fishingAreas} />
          </Grid>

          {/* モバイル用コンパクト地図 */}
          <Grid item xs={12} sx={{ display: { xs: 'block', lg: 'none' } }}>
            <MapCard fishingAreas={fishingAreas} height="180px" />
          </Grid>

          {/* 投稿一覧 */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ position: { xs: 'static', lg: 'sticky' }, top: 100 }}>
              {/* Header + Tabs */}
              <Box sx={{
                mb: 2,
                bgcolor: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.2)',
                overflow: 'hidden',
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: { xs: 2, sm: 2 }, pt: { xs: 1.5, sm: 2 } }}>
                  <Typography sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    ⚡ 釣果
                  </Typography>
                  <PostButton />
                </Box>
                <Tabs
                  value={isFollowingFeed ? 1 : 0}
                  sx={{ px: 2, '& .MuiTabs-indicator': { bgcolor: 'primary.main' } }}
                >
                  <Tab
                    label="最新"
                    component={Link}
                    href="/home?feed=all"
                    sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' }, minWidth: 0, px: { xs: 1.5, sm: 2 } }}
                  />
                  <Tab
                    label="フォロー中"
                    component={Link}
                    href="/home?feed=following"
                    sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' }, minWidth: 0, px: { xs: 1.5, sm: 2 } }}
                    disabled={!currentDbUserId}
                  />
                </Tabs>
              </Box>

              {/* Posts List */}
              <Box sx={{
                maxHeight: { xs: 'none', lg: 600 },
                overflowY: { xs: 'visible', lg: 'auto' },
                pr: { xs: 0, lg: 1 },
              }}>
                {posts.map((post) => (
                  <Card
                    key={post.id}
                    component={Link}
                    href={`/post/${post.id}`}
                    sx={{
                      mb: { xs: 1.5, sm: 2 },
                      borderRadius: 3,
                      overflow: 'hidden',
                      background: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                      textDecoration: 'none',
                      display: 'block',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                      {/* User Info */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 1.5, sm: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            variant="dot"
                            invisible={!followingIds.has(post.user.id)}
                            sx={{ mr: { xs: 1.5, sm: 2 }, '& .MuiBadge-dot': { width: 10, height: 10, bgcolor: '#0ea5e9', border: '2px solid white' } }}
                          >
                            <Avatar
                              src={post.user.iconUrl ?? undefined}
                              sx={{
                                width: { xs: 36, sm: 40 },
                                height: { xs: 36, sm: 40 },
                                background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
                                fontWeight: 600,
                                fontSize: { xs: 14, sm: 16 },
                              }}
                            >
                              {!post.user.iconUrl && <Person />}
                            </Avatar>
                          </Badge>
                          <Box>
                            <Typography sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                              {post.user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                              {new Date(post.createdAt).toLocaleDateString('ja-JP', {
                                timeZone: 'Asia/Tokyo',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton size="small" sx={{ color: 'text.secondary', p: { xs: 0.5, sm: 1 } }}>
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </Box>

                      {/* Post Content */}
                      {post.content && (
                        <Typography sx={{
                          mb: { xs: 1.5, sm: 2 },
                          lineHeight: 1.6,
                          fontSize: { xs: '0.875rem', sm: '0.95rem' },
                        }}>
                          {post.content}
                        </Typography>
                      )}

                      {/* Images */}
                      {post.imageUrls.length > 0 && (
                        <Box sx={{
                          mb: { xs: 1.5, sm: 2 },
                          borderRadius: 2,
                          overflow: 'hidden',
                          display: 'grid',
                          gridTemplateColumns: post.imageUrls.length === 1 ? '1fr' : '1fr 1fr',
                          gap: '2px',
                          maxWidth: 300,
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
                                sizes="300px"
                                style={{ objectFit: 'cover' }}
                              />
                            </Box>
                          ))}
                        </Box>
                      )}

                      {/* Fishing Area */}
                      {post.fishingArea && (
                        <Box sx={{ mb: { xs: 1, sm: 1.5 } }}>
                          <Chip
                            label={`📍 ${post.fishingArea.name || '釣りポイント'}`}
                            variant="outlined"
                            color="primary"
                            size="small"
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' }, fontWeight: 500 }}
                          />
                        </Box>
                      )}

                      <Divider sx={{ mb: { xs: 1, sm: 1.5 } }} />

                      {/* Actions */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <LikeButton
                          postId={post.id}
                          likeCount={post.likes.length}
                          isLiked={post.likes.some(l => l.userId === currentDbUserId)}
                          isLoggedIn={!!currentDbUserId}
                        />
                        {post.comments.length > 0 && (() => {
                          const uniqueUsers = post.comments.filter(
                            (c, i, arr) => arr.findIndex(x => x.user.id === c.user.id) === i
                          )
                          return (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <ChatBubbleOutline sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mr: 0.5 }}>
                                {post.comments.length}
                              </Typography>
                              <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 18, height: 18, fontSize: 9, border: '1.5px solid white' } }}>
                                {uniqueUsers.map(c => (
                                  <Tooltip key={c.user.id} title={c.user.name} arrow>
                                    <Avatar src={c.user.iconUrl ?? undefined} sx={{ width: 18, height: 18, bgcolor: 'primary.main', fontSize: 9 }}>
                                      {!c.user.iconUrl && c.user.name[0]}
                                    </Avatar>
                                  </Tooltip>
                                ))}
                              </AvatarGroup>
                            </Box>
                          )
                        })()}
                      </Box>
                    </CardContent>
                  </Card>
                ))}

                {posts.length === 0 && (
                  <Card sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ textAlign: 'center', py: { xs: 4, sm: 6 } }}>
                      <Typography sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem' }, fontWeight: 600 }} color="text.secondary">
                        {isFollowingFeed ? '👥 フォロー中の投稿がありません' : '🎣 まだ投稿がありません'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        {isFollowingFeed ? 'ユーザーをフォローして釣果をチェックしよう' : '最初の釣果を投稿してみませんか？'}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <PostFab />
    </Box>
  )
}
