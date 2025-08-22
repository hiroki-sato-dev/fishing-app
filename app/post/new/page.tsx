import { PostFormClient } from './components/PostFormClient'
import { Container, Box, Typography, Paper, Chip, Fab } from '@mui/material'
import { CreateOutlined, TipsAndUpdates, Home } from '@mui/icons-material'
import Link from 'next/link'

export default function NewPostPage() {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc, #eff6ff)',
      pt: 10  // ヘッダー分のpadding-top
    }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header Section */}
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
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}
          >
            <CreateOutlined sx={{ fontSize: 48, color: '#0ea5e9' }} />
            釣果を投稿しよう
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ maxWidth: '500px', mx: 'auto', fontWeight: 400 }}
          >
            今日の釣果をコミュニティと共有して、他のアングラーにインスピレーションを
          </Typography>
        </Box>

        {/* Tips Card */}
        <Paper sx={{ 
          mb: 4,
          p: 3,
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.05), rgba(20, 184, 166, 0.05))',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TipsAndUpdates sx={{ color: 'primary.main', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
              投稿のコツ
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip 
              label="📸 魚の写真を追加" 
              variant="outlined" 
              size="small"
              sx={{ bgcolor: 'rgba(255, 255, 255, 0.7)' }}
            />
            <Chip 
              label="🎣 使用した道具を記載" 
              variant="outlined" 
              size="small"
              sx={{ bgcolor: 'rgba(255, 255, 255, 0.7)' }}
            />
            <Chip 
              label="🌊 天候・潮の状況を記録" 
              variant="outlined" 
              size="small"
              sx={{ bgcolor: 'rgba(255, 255, 255, 0.7)' }}
            />
            <Chip 
              label="📍 正確な位置情報を設定" 
              variant="outlined" 
              size="small"
              sx={{ bgcolor: 'rgba(255, 255, 255, 0.7)' }}
            />
          </Box>
        </Paper>

        {/* Form Card */}
        <Paper sx={{ 
          p: 4,
          borderRadius: 4,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ 
              mb: 3, 
              fontWeight: 700,
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            ✍️ 投稿内容を入力
          </Typography>
          <PostFormClient />
        </Paper>
      </Container>

      {/* Mobile/Tablet FAB - Home Button */}
      <Fab
        component={Link}
        href="/home"
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
        <Home sx={{ fontSize: 28 }} />
      </Fab>
    </Box>
  )
} 