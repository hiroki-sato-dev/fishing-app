'use client'

import { useState } from 'react'
import { IconButton, Typography, Box, Tooltip } from '@mui/material'
import { Favorite, FavoriteBorder } from '@mui/icons-material'
import { toggleLike } from '@/app/post/[id]/actions/likeActions'

type Props = {
  postId: string
  likeCount: number
  isLiked: boolean
  isLoggedIn: boolean
}

export const LikeButton = ({ postId, likeCount, isLiked, isLoggedIn }: Props) => {
  const [state, setState] = useState({ likeCount, isLiked })

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setState(prev => ({
      likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
      isLiked: !prev.isLiked,
    }))
    await toggleLike(postId)
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Tooltip title={!isLoggedIn ? 'いいねするにはログインが必要です' : ''} arrow>
        <span>
          <IconButton
            size="small"
            onClick={handleClick}
            disabled={!isLoggedIn}
            sx={{
              color: state.isLiked ? 'error.main' : 'text.secondary',
              '&:hover': { color: 'error.main', bgcolor: 'rgba(244,67,54,0.1)' },
            }}
          >
            {state.isLiked ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
          </IconButton>
        </span>
      </Tooltip>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        {state.likeCount}
      </Typography>
    </Box>
  )
}
