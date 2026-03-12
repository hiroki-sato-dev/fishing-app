import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Box, Container, Card, CardContent, Avatar, Badge, Typography,
  Divider, IconButton, Tabs, Tab,
} from '@mui/material'
import { Person, ArrowBack } from '@mui/icons-material'
import { getServerUser } from '@/lib/auth'
import { getFollowers, getFollowing, getProfileName } from './actions/getFollows'
import { getCurrentDbUserId } from '../actions/getUser'
import { getFollowingIds } from '@/app/home/actions/getPosts'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function FollowsPage({ params, searchParams }: Props) {
  const { id } = await params
  const { tab } = await searchParams
  const isFollowersTab = tab !== 'following'

  const cognitoUser = await getServerUser()
  let followingIds = new Set<string>()
  if (cognitoUser) {
    const currentUserId = await getCurrentDbUserId(cognitoUser.username)
    if (currentUserId) followingIds = await getFollowingIds(currentUserId)
  }

  const [name, followers, following] = await Promise.all([
    getProfileName(id),
    getFollowers(id),
    getFollowing(id),
  ])
  if (!name) notFound()

  const list = isFollowersTab
    ? followers.map(f => f.follower)
    : following.map(f => f.followee)

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc, #eff6ff)', pt: 10 }}>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Box sx={{ mb: 2 }}>
          <IconButton component={Link} href={`/user/${id}`} sx={{ color: 'text.secondary' }}>
            <ArrowBack />
          </IconButton>
        </Box>

        <Card sx={{ borderRadius: 4, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, px: 3, pt: 3, pb: 1 }}>
              {name}
            </Typography>

            <Tabs
              value={isFollowersTab ? 0 : 1}
              sx={{ px: 2, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Tab
                label={`フォロワー ${followers.length}`}
                component={Link}
                href={`/user/${id}/follows?tab=followers`}
                sx={{ fontWeight: 600 }}
              />
              <Tab
                label={`フォロー中 ${following.length}`}
                component={Link}
                href={`/user/${id}/follows?tab=following`}
                sx={{ fontWeight: 600 }}
              />
            </Tabs>

            <Box sx={{ p: 2 }}>
              {list.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  {isFollowersTab ? 'フォロワーはいません' : 'フォロー中のユーザーはいません'}
                </Typography>
              )}
              {list.map((user, index) => (
                <Box key={user.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5 }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                      variant="dot"
                      invisible={!followingIds.has(user.id)}
                      sx={{ flexShrink: 0, '& .MuiBadge-dot': { width: 10, height: 10, bgcolor: '#0ea5e9', border: '2px solid white' } }}
                    >
                      <Avatar
                        component={Link}
                        href={`/user/${user.id}`}
                        src={user.iconUrl ?? undefined}
                        sx={{ width: 44, height: 44, background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)', cursor: 'pointer' }}
                      >
                        {!user.iconUrl && <Person />}
                      </Avatar>
                    </Badge>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        component={Link}
                        href={`/user/${user.id}`}
                        variant="subtitle2"
                        sx={{ fontWeight: 600, textDecoration: 'none', color: 'text.primary', '&:hover': { color: 'primary.main' } }}
                      >
                        {user.name}
                      </Typography>
                      {user.bio && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {user.bio}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  {index < list.length - 1 && <Divider />}
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
