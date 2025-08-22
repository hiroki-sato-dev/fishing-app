import { getPosts } from './actions/getPosts'
import { SimpleMap } from '@/components/SimpleMap'
import { Container, Grid, Typography, Box, Button, Card, CardContent, Avatar, Chip, IconButton, Divider, Fab } from '@mui/material'
import { Add as AddIcon, LocationOn, FavoriteBorder, Share, MoreVert, TrendingUp } from '@mui/icons-material'
import Link from 'next/link'
import type { Post } from '@/types/post'

export default async function HomePage() {
  const result = await getPosts()
  const posts: Post[] = result.success ? result.posts : []

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc, #eff6ff)',
      pt: 10  // ヘッダー分のpadding-top
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
                    🗺️ 釣果マップ
                    <Chip 
                      label={`${posts.length}件の釣果`} 
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
              <SimpleMap posts={posts} height="500px" />
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
                  🗺️ 釣果マップ
                  <Chip 
                    label={`${posts.length}件`} 
                    color="primary" 
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Typography>
              </Box>
              <SimpleMap posts={posts} height="250px" />
            </Card>
          </Grid>

          {/* 投稿一覧 */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ position: { xs: 'static', lg: 'sticky' }, top: 100 }}>
              {/* Header */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3,
                p: 2,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  ⚡ 最新の釣果
                </Typography>
                {/* デスクトップのみボタン表示 */}
                <Button
                  variant="contained"
                  size="medium"
                  startIcon={<AddIcon />}
                  href="/post/new"
                  component="a"
                  sx={{
                    display: { xs: 'none', lg: 'flex' },
                    background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
                    borderRadius: 3,
                    fontWeight: 600,
                    px: 3,
                    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0284c7, #0d9488)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 16px rgba(14, 165, 233, 0.4)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  投稿する
                </Button>
              </Box>
              
              {/* Posts List */}
              <Box sx={{ 
                maxHeight: { xs: 'none', lg: 600 }, 
                overflowY: { xs: 'visible', lg: 'auto' }, 
                pr: { xs: 0, lg: 1 }
              }}>
                {posts.map((post, index) => (
                  <Card 
                    key={post.id} 
                    sx={{ 
                      mb: 2,
                      borderRadius: 3,
                      overflow: 'hidden',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                      }
                    }}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      {/* User Info */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              width: 40, 
                              height: 40, 
                              mr: 2,
                              background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
                              fontWeight: 600,
                              fontSize: 16
                            }}
                          >
                            {post.user.name.charAt(0)}
                          </Avatar>
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
                      
                      {/* Location */}
                      {post.latitude !== null && post.longitude !== null && (
                        <Box sx={{ mb: 2 }}>
                          <Chip
                            icon={<LocationOn sx={{ fontSize: 16 }} />}
                            label={`${post.latitude.toFixed(3)}, ${post.longitude.toFixed(3)}`}
                            size="small"
                            variant="filled"
                            sx={{ 
                              bgcolor: 'rgba(14, 165, 233, 0.1)',
                              color: 'primary.main',
                              fontWeight: 500,
                              '& .MuiChip-icon': { color: 'primary.main' }
                            }}
                          />
                        </Box>
                      )}

                      <Divider sx={{ mb: 2 }} />
                      
                      {/* Actions */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton 
                            size="small"
                            sx={{ 
                              color: 'text.secondary',
                              '&:hover': { 
                                color: 'error.main',
                                bgcolor: 'rgba(244, 67, 54, 0.1)'
                              }
                            }}
                          >
                            <FavoriteBorder fontSize="small" />
                          </IconButton>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {post.likes.length}
                          </Typography>
                          
                          <IconButton 
                            size="small" 
                            sx={{ 
                              ml: 1,
                              color: 'text.secondary',
                              '&:hover': { 
                                color: 'primary.main',
                                bgcolor: 'rgba(14, 165, 233, 0.1)'
                              }
                            }}
                          >
                            <Share fontSize="small" />
                          </IconButton>
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
                        🎣 まだ投稿がありません
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        最初の釣果を投稿してみませんか？
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
      <Fab
        component={Link}
        href="/post/new"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', lg: 'none' },
          background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
          color: 'white',
          width: 60,
          height: 60,
          boxShadow: '0 8px 24px rgba(14, 165, 233, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0284c7, #0d9488)',
            transform: 'scale(1.05)',
            boxShadow: '0 12px 32px rgba(14, 165, 233, 0.5)',
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1000
        }}
      >
        <AddIcon sx={{ fontSize: 28 }} />
      </Fab>
    </Box>
  )
} 