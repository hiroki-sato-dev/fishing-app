import { notFound } from 'next/navigation'
import { getServerUser } from '@/lib/auth'
import Link from 'next/link'
import {
  Box, Container, Card, CardContent, Avatar, Badge, Typography,
  IconButton, Divider,
} from '@mui/material'
import { Person, ArrowBack } from '@mui/icons-material'
import { getLikes, getPostOwner } from './actions/getLikes'
import { getCurrentDbUserId } from '../actions/getPost'
import { getFollowingIds } from '@/app/home/actions/getPosts'

type Props = {
  params: Promise<{ id: string }>
}

export default async function LikesPage({ params }: Props) {
  const { id } = await params

  const postOwnerUserId = await getPostOwner(id)
  if (!postOwnerUserId) notFound()

  const cognitoUser = await getServerUser()
  let currentUserId: string | null = null
  let followingIds = new Set<string>()
  if (cognitoUser) {
    currentUserId = await getCurrentDbUserId(cognitoUser.username)
    if (currentUserId) followingIds = await getFollowingIds(currentUserId)
  }

  if (currentUserId !== postOwnerUserId) notFound()

  const likes = await getLikes(id)

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc, #eff6ff)', pt: 10 }}>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Box sx={{ mb: 2 }}>
          <IconButton component={Link} href={`/post/${id}`} sx={{ color: 'text.secondary' }}>
            <ArrowBack />
          </IconButton>
        </Box>

        <Card sx={{ borderRadius: 4, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              ❤️ いいねしたユーザー（{likes.length}人）
            </Typography>

            {likes.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                まだいいねがありません
              </Typography>
            )}

            {likes.map((like, index) => (
              <Box key={like.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5 }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    variant="dot"
                    invisible={!followingIds.has(like.user.id)}
                    sx={{ flexShrink: 0, '& .MuiBadge-dot': { width: 10, height: 10, bgcolor: '#0ea5e9', border: '2px solid white' } }}
                  >
                    <Avatar
                      component={Link}
                      href={`/user/${like.user.id}`}
                      src={like.user.iconUrl ?? undefined}
                      sx={{ width: 44, height: 44, background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)', cursor: 'pointer' }}
                    >
                      {!like.user.iconUrl && <Person />}
                    </Avatar>
                  </Badge>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      component={Link}
                      href={`/user/${like.user.id}`}
                      variant="subtitle2"
                      sx={{ fontWeight: 600, textDecoration: 'none', color: 'text.primary', '&:hover': { color: 'primary.main' } }}
                    >
                      {like.user.name}
                    </Typography>
                    {like.user.bio && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
                        {like.user.bio}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(like.createdAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                  </Typography>
                </Box>
                {index < likes.length - 1 && <Divider />}
              </Box>
            ))}
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
