'use client'

import { Box, Container, Typography, Divider } from '@mui/material'

export const Footer = () => (
  <Box 
    component="footer" 
    sx={{
      background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.05), rgba(20, 184, 166, 0.05))',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.2)',
      mt: 8,
      py: 6
    }}
  >
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          🎣 FishingSNS
        </Typography>
        
        {/* TODO: SNSリンク設定後に有効化
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                bgcolor: 'rgba(14, 165, 233, 0.1)'
              }
            }}
          >
            <Twitter />
          </IconButton>
          <IconButton
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                bgcolor: 'rgba(14, 165, 233, 0.1)'
              }
            }}
          >
            <Instagram />
          </IconButton>
          <IconButton
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                bgcolor: 'rgba(14, 165, 233, 0.1)'
              }
            }}
          >
            <GitHub />
          </IconButton>
        </Box>
        */}
      </Box>
      
      <Divider sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'center', md: 'flex-start' },
        gap: 3
      }}>
        {/* TODO: 各ページ作成後に有効化
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' },
              cursor: 'pointer'
            }}
          >
            利用規約
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' },
              cursor: 'pointer'
            }}
          >
            プライバシーポリシー
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' },
              cursor: 'pointer'
            }}
          >
            お問い合わせ
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' },
              cursor: 'pointer'
            }}
          >
            ヘルプ
          </Typography>
        </Box>
        */}
        
        {/* TODO: リリース時に有効化
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: { xs: 'center', md: 'right' } }}
        >
          © 2024 FishingSNS. All rights reserved.
        </Typography>
        */}
      </Box>
    </Container>
  </Box>
) 