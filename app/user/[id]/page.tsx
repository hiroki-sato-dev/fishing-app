import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getServerUser } from '@/lib/auth'
import {
  Box, Container, Avatar, Typography, Button, Chip,
  Card, CardContent, Grid, Divider,
} from '@mui/material'
import { Person, FavoriteBorder } from '@mui/icons-material'
import type { Post } from '@/types/post'

interface Props {
  params: { id: string }
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = params

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      iconUrl: true,
      bio: true,
      fishingYears: true,
      mainFishing: true,
      isPrivate: true,
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
      posts: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          imageUrls: true,
          fishingAreaId: true,
          createdAt: true,
          updatedAt: true,
          user: { select: { name: true, iconUrl: true } },
          fishingArea: {
            select: {
              id: true,
              name: true,
              centerLat: true,
              centerLng: true,
              radius: true,
              description: true,
              postCount: true,
            },
          },
          likes: { select: { id: true } },
        },
      },
    },
  })

  if (!user) notFound()

  const cognitoUser = await getServerUser()
  const currentUserEmail = cognitoUser?.username ?? null

  let isOwnProfile = false
  if (currentUserEmail) {
    const currentDbUser = await prisma.user.findUnique({
      where: { email: currentUserEmail },
      select: { id: true },
    })
    isOwnProfile = currentDbUser?.id === id
  }

  const posts = user.posts as Post[]

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
                  {isOwnProfile && (
                    <Button
                      variant="outlined"
                      size="small"
                      href="/user/settings"
                      sx={{ borderRadius: 2, fontWeight: 600 }}
                    >
                      編集
                    </Button>
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
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{user._count.followers}</Typography>
                    <Typography variant="caption" color="text.secondary">フォロワー</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{user._count.following}</Typography>
                    <Typography variant="caption" color="text.secondary">フォロー中</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

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
                  sx={{
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1.5, lineHeight: 1.6 }}>
                      {post.content}
                    </Typography>

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
