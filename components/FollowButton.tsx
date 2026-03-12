'use client'

import { useTransition } from 'react'
import { Button, CircularProgress } from '@mui/material'
import { toggleFollow } from '@/app/user/[id]/actions/followActions'

type FollowStatus = 'following' | 'requested' | 'none'

type Props = {
  targetUserId: string
  initialStatus: FollowStatus
}

export const FollowButton = ({ targetUserId, initialStatus }: Props) => {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      await toggleFollow(targetUserId)
    })
  }

  const label = initialStatus === 'following'
    ? 'フォロー中'
    : initialStatus === 'requested'
      ? 'リクエスト済み'
      : 'フォロー'

  const isActive = initialStatus !== 'none'

  return (
    <Button
      variant={isActive ? 'outlined' : 'contained'}
      size="small"
      onClick={handleClick}
      disabled={isPending}
      endIcon={isPending ? <CircularProgress size={14} color="inherit" /> : null}
      sx={{
        borderRadius: 2,
        fontWeight: 600,
        minWidth: 110,
        ...(isActive
          ? { borderColor: 'grey.400', color: 'text.secondary' }
          : { background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)', color: 'white' }
        ),
      }}
    >
      {label}
    </Button>
  )
}
