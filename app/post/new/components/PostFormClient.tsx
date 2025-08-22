'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { createPost } from '../actions/createPost'
import {
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  Paper,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material'
import { LocationOn, Send, Cancel, MyLocation, Check, Image, EditNote } from '@mui/icons-material'

export const PostFormClient = () => {
  const [state, formAction, isPending] = useActionState(createPost, {
    success: false,
    message: '',
  })
  
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [locationError, setLocationError] = useState<string>('')
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

  // フォームの有効性をチェック（投稿内容は必須、位置情報は任意）
  const isValid = !!content.trim() && content.length <= 256

  // 位置情報取得
  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('お使いのブラウザは位置情報をサポートしていません')
      return
    }

    setIsLoadingLocation(true)
    setLocationError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude)
        setLongitude(position.coords.longitude)
        setLocationError('')
        setIsLoadingLocation(false)
      },
      (error) => {
        console.error('位置情報の取得に失敗しました:', error)
        setLocationError('位置情報の取得に失敗しました。位置情報の許可を確認してください。')
        setIsLoadingLocation(false)
      }
    )
  }

  return (
    <Box component="form" action={formAction} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Content Section */}
      <Paper sx={{ 
        p: 3, 
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(5px)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EditNote sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            釣果の内容
          </Typography>
        </Box>
        
        <TextField
          name="content"
          label="今日の釣果はいかがでしたか？"
          multiline
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="例: 朝5時から河口で釣りを開始。シーバス40cmを2匹ゲット！ルアーはミノー系が効果的でした。天気も良く最高の一日でした🎣"
          required
          fullWidth
          variant="outlined"
          error={content.length > 256 || !!(state.errors?.content)}
          helperText={
            state.errors?.content?.[0] || 
            `${content.length}/256文字 ${content.length > 256 ? '（文字数制限を超過）' : ''}`
          }
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              fontSize: '16px',
              '& fieldset': {
                borderColor: 'rgba(14, 165, 233, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(14, 165, 233, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
                borderWidth: 2,
              }
            },
            '& .MuiInputLabel-root': {
              color: 'text.secondary',
              '&.Mui-focused': {
                color: 'primary.main',
              }
            }
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          💡 釣った魚の種類、使用した道具、天候などの詳細を書くとより参考になります
        </Typography>
      </Paper>

      {/* Image Section */}
      <Paper sx={{ 
        p: 3, 
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(5px)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Image sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            写真を追加（オプション）
          </Typography>
        </Box>
        
        <TextField
          name="imageUrl"
          label="画像のURL"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/fish-photo.jpg"
          fullWidth
          variant="outlined"
          error={!!(state.errors?.imageUrl)}
          helperText={state.errors?.imageUrl?.[0]}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '& fieldset': {
                borderColor: 'rgba(14, 165, 233, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(14, 165, 233, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
                borderWidth: 2,
              }
            }
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          📸 釣果の写真があるとより魅力的な投稿になります
        </Typography>
      </Paper>

      {/* Hidden inputs for coordinates */}
      {latitude !== null && (
        <input type="hidden" name="latitude" value={latitude} />
      )}
      {longitude !== null && (
        <input type="hidden" name="longitude" value={longitude} />
      )}

      {/* Location Section */}
      <Paper sx={{ 
        p: 3, 
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(5px)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOn sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            釣り場の位置情報
          </Typography>
        </Box>
        
        {latitude && longitude ? (
          <Box>
            <Alert 
              severity="success" 
              sx={{ 
                mb: 2,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  color: 'success.main'
                }
              }}
            >
              位置情報が設定されました！
            </Alert>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<Check />}
                label={`緯度: ${latitude.toFixed(6)}`}
                color="primary"
                variant="filled"
                sx={{ fontWeight: 500 }}
              />
              <Chip
                icon={<Check />}
                label={`経度: ${longitude.toFixed(6)}`}
                color="primary"
                variant="filled"
                sx={{ fontWeight: 500 }}
              />
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              📍 釣り場の位置情報を取得してください（任意）
            </Typography>
            <Button
              type="button"
              variant="contained"
              size="large"
              startIcon={isLoadingLocation ? <CircularProgress size={20} color="inherit" /> : <MyLocation />}
              onClick={getLocation}
              disabled={isLoadingLocation}
              sx={{
                background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
                borderRadius: 2,
                fontWeight: 600,
                px: 3,
                py: 1.5,
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0284c7, #0d9488)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 16px rgba(14, 165, 233, 0.4)',
                },
                transition: 'all 0.2s ease'
              }}
            >
              {isLoadingLocation ? '位置情報を取得中...' : '現在地を取得'}
            </Button>
          </Box>
        )}
        
        {locationError && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 2,
              borderRadius: 2
            }}
          >
            {locationError}
          </Alert>
        )}
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          🔒 位置情報はアプリ内でのみ使用され、他のアングラーが釣り場を見つけるのに役立ちます
        </Typography>
      </Paper>

      {/* エラーメッセージ表示 */}
      {state.message && (
        <Alert 
          severity={state.success ? 'success' : 'error'}
          sx={{ borderRadius: 2 }}
        >
          {state.message}
        </Alert>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Button
          type="submit"
          variant="contained"
          disabled={!isValid || isPending}
          startIcon={<Send />}
          size="large"
          sx={{ 
            flex: 1,
            py: 2,
            borderRadius: 3,
            fontWeight: 700,
            fontSize: '16px',
            background: isValid 
              ? 'linear-gradient(135deg, #0ea5e9, #14b8a6)'
              : 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
            boxShadow: isValid 
              ? '0 4px 12px rgba(14, 165, 233, 0.3)'
              : 'none',
            '&:hover': isValid ? {
              background: 'linear-gradient(135deg, #0284c7, #0d9488)',
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 16px rgba(14, 165, 233, 0.4)',
            } : {},
            transition: 'all 0.2s ease'
          }}
        >
          🎣 {isPending ? '投稿中...' : '投稿する'}
        </Button>
        
        <Button
          type="button"
          variant="outlined"
          startIcon={<Cancel />}
          size="large"
          sx={{ 
            flex: 1,
            py: 2,
            borderRadius: 3,
            fontWeight: 600,
            fontSize: '16px',
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'rgba(14, 165, 233, 0.1)',
              borderColor: 'primary.main'
            }
          }}
          onClick={() => window.history.back()}
        >
          キャンセル
        </Button>
      </Box>
    </Box>
  )
}