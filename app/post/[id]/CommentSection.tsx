'use client'

import { useActionState, useRef, useEffect } from 'react'
import {
  Box, Avatar, Typography, TextField, Button,
  CircularProgress, IconButton, Divider,
} from '@mui/material'
import { Person, Delete, Send } from '@mui/icons-material'
import Link from 'next/link'
import { createComment, deleteComment, type CommentState } from './actions/commentActions'

type Comment = {
  id: string
  content: string
  createdAt: Date
  user: { id: string; name: string; iconUrl: string | null }
}

type Props = {
  postId: string
  comments: Comment[]
  currentUserId: string | null
  isLoggedIn: boolean
}

const initialState: CommentState = { success: false, message: '' }

export function CommentSection({ postId, comments, currentUserId, isLoggedIn }: Props) {
  const boundAction = createComment.bind(null, postId)
  const [state, formAction, isPending] = useActionState(boundAction, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
    }
  }, [state.success])

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        コメント ({comments.length})
      </Typography>

      {/* Comment List */}
      {comments.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {comments.map((comment, index) => (
            <Box key={comment.id}>
              <Box sx={{ display: 'flex', gap: 1.5, py: 2 }}>
                <Avatar
                  component={Link}
                  href={`/user/${comment.user.id}`}
                  src={comment.user.iconUrl ?? undefined}
                  sx={{ width: 36, height: 36, bgcolor: 'primary.main', flexShrink: 0, cursor: 'pointer' }}
                >
                  {!comment.user.iconUrl && <Person fontSize="small" />}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        component={Link}
                        href={`/user/${comment.user.id}`}
                        variant="subtitle2"
                        sx={{ fontWeight: 600, textDecoration: 'none', color: 'text.primary', '&:hover': { color: 'primary.main' } }}
                      >
                        {comment.user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(comment.createdAt).toLocaleDateString('ja-JP', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </Typography>
                    </Box>
                    {currentUserId === comment.user.id && (
                      <IconButton
                        size="small"
                        onClick={() => deleteComment(comment.id, postId)}
                        sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                    {comment.content}
                  </Typography>
                </Box>
              </Box>
              {index < comments.length - 1 && <Divider />}
            </Box>
          ))}
        </Box>
      )}

      {comments.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, py: 2 }}>
          まだコメントがありません。最初のコメントを投稿しましょう！
        </Typography>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* Comment Form */}
      {isLoggedIn ? (
        <Box component="form" action={formAction} ref={formRef}>
          <TextField
            name="content"
            label="コメントを入力"
            fullWidth
            multiline
            rows={2}
            inputProps={{ maxLength: 200 }}
            helperText={state.errors?.content?.[0] ?? '200文字以内'}
            error={!!state.errors?.content}
            sx={{ mb: 1.5 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isPending}
              endIcon={isPending ? <CircularProgress size={16} color="inherit" /> : <Send />}
              sx={{
                background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              投稿
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 2, bgcolor: 'rgba(14,165,233,0.05)', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            コメントするにはログインが必要です
          </Typography>
          <Button component={Link} href="/auth" variant="outlined" size="small" sx={{ borderRadius: 2, fontWeight: 600 }}>
            ログイン
          </Button>
        </Box>
      )}
    </Box>
  )
}
