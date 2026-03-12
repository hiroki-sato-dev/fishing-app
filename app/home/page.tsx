import { getPosts, getFishingAreas, checkDbUserExists, getFollowingIds } from './actions/getPosts'
import { getCurrentDbUserId } from '@/app/post/[id]/actions/getPost'
import { extractPosts, extractFishingAreas } from './helpers/posts'
import { SimpleMap } from '@/components/SimpleMap'
import { PostFab } from './components/PostFab'
import { PostButton } from './components/PostButton'
import { Container, Grid, Typography, Box, Button, Card, CardContent, Avatar, AvatarGroup, Badge, Chip, IconButton, Divider, Tooltip, Tabs, Tab } from '@mui/material'
import { ChatBubbleOutline, MoreVert, TrendingUp, Person } from '@mui/icons-material'
import { LikeButton } from '@/components/LikeButton'
import Link from 'next/link'
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

  // ログイン済みだがDBユーザー未作成の場合はセットアップへ
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
      pt: 10
    }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Hero Section */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 1,
              letterSpacing: '-0.02em'
            }}
          >
            🌊 今日の釣果をチェック
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ maxWidth: '600px', mx: 'auto', fontWeight: 400 }}
          >
            リアルタイムで更新される釣果情報で、次の釣り場を見つけよう
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {/* 地図エリア - デスクトップのみ表示 */}
          <Grid item xs={12} lg={8} sx={{ display: { xs: 'none', lg: 'block' } }}>
            <Card 
              sx={{ 
                borderRadius: 4, 
                overflow: 'hidden',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Box sx={{ p: 3, pb: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    🗺️ 釣りエリアマップ
                    <Chip 
                      label={`${fishingAreas.length}エリア`} 
                      color="primary" 
                      size="small"
                      sx={{ ml: 1, fontWeight: 600 }}
                    />
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<TrendingUp />}
                    sx={{ 
                      borderRadius: 2,
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'rgba(14, 165, 233, 0.1)'
                      }
                    }}
                  >
                    トレンド
                  </Button>
                </Box>
              </Box>
              <SimpleMap fishingAreas={fishingAreas} height="500px" />
            </Card>
          </Grid>

          {/* モバイル用 - コンパクトな地図 */}
          <Grid item xs={12} sx={{ display: { xs: 'block', lg: 'none' }, mb: 2 }}>
            <Card 
              sx={{ 
                borderRadius: 4, 
                overflow: 'hidden',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Box sx={{ p: 2, pb: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  🗺️ 釣りエリアマップ
                  <Chip 
                    label={`${fishingAreas.length}エリア`} 
                    color="primary" 
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Typography>
              </Box>
              <SimpleMap fishingAreas={fishingAreas} height="250px" />
            </Card>
          </Grid>

          {/* 投稿一覧 */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ position: { xs: 'static', lg: 'sticky' }, top: 100 }}>
              {/* Header */}
              <Box sx={{
                mb: 3,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                overflow: 'hidden'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pt: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    ⚡ 釣果
                  </Typography>
                  <PostButton />
                </Box>
                <Tabs
                  value={isFollowingFeed ? 1 : 0}
                  sx={{ px: 2, '& .MuiTabs-indicator': { bgcolor: 'primary.main' } }}
                >
                  <Tab
                    label="最新の釣果"
                    component={Link}
                    href="/home?feed=all"
                    sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                  />
                  <Tab
                    label="フォロー中"
                    component={Link}
                    href="/home?feed=following"
                    sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                    disabled={!currentDbUserId}
                  />
                </Tabs>
              </Box>
              
              {/* Posts List */}
              <Box sx={{ 
                maxHeight: { xs: 'none', lg: 600 }, 
                overflowY: { xs: 'visible', lg: 'auto' }, 
                pr: { xs: 0, lg: 1 }
              }}>
                {posts.map((post) => (
                  <Card
                    key={post.id}
                    component={Link}
                    href={`/post/${post.id}`}
                    sx={{
                      mb: 2,
                      borderRadius: 3,
                      overflow: 'hidden',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      textDecoration: 'none',
                      display: 'block',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      {/* User Info */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            variant="dot"
                            invisible={!followingIds.has(post.user.id)}
                            sx={{ mr: 2, '& .MuiBadge-dot': { width: 10, height: 10, bgcolor: '#0ea5e9', border: '2px solid white' } }}
                          >
                            <Avatar
                              src={post.user.iconUrl ?? undefined}
                              sx={{
                                width: 40,
                                height: 40,
                                background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
                                fontWeight: 600,
                                fontSize: 16,
                              }}
                            >
                              {!post.user.iconUrl && <Person />}
                            </Avatar>
                          </Badge>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                              {post.user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(post.createdAt).toLocaleDateString('ja-JP', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton size="small" sx={{ color: 'text.secondary' }}>
                          <MoreVert />
                        </IconButton>
                      </Box>
                      
                      {/* Post Content */}
                      {post.content && (
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            mb: 2, 
                            lineHeight: 1.6,
                            fontSize: '0.95rem'
                          }}
                        >
                          {post.content}
                        </Typography>
                      )}
                      
                      {/* Fishing Area */}
                      {post.fishingArea && (
                        <Box sx={{ mb: 2 }}>
                          <Chip 
                            label={`📍 ${post.fishingArea.name || '釣りポイント'}`}
                            variant="outlined"
                            color="primary"
                            size="small"
                            sx={{ fontSize: '0.8rem', fontWeight: 500 }}
                          />
                        </Box>
                      )}

                      <Divider sx={{ mb: 2 }} />
                      
                      {/* Actions */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <LikeButton
                            postId={post.id}
                            likeCount={post.likes.length}
                            isLiked={post.likes.some(l => l.userId === currentDbUserId)}
                            isLoggedIn={!!currentDbUserId}
                          />

                          {/* コメント */}
                          {post.comments.length > 0 && (() => {
                            const uniqueUsers = post.comments.filter(
                              (c, i, arr) => arr.findIndex(x => x.user.id === c.user.id) === i
                            )
                            return (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <ChatBubbleOutline sx={{ fontSize: 18, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mr: 0.5 }}>
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
                      </Box>
                    </CardContent>
                  </Card>
                ))}
                
                {posts.length === 0 && (
                  <Card sx={{
                    borderRadius: 3,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        {isFollowingFeed ? '👥 フォロー中の投稿がありません' : '🎣 まだ投稿がありません'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
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

      {/* Mobile/Tablet FAB */}
      <PostFab />
    </Box>
  )
}