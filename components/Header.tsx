'use client'

import Link from 'next/link'
import { AppBar, Toolbar, Typography, Box, Button, Avatar, IconButton, Badge } from '@mui/material'
import { Add as AddIcon, Notifications, Home, Explore } from '@mui/icons-material'

export const Header = () => {
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        color: 'text.primary', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo */}
        <Typography 
          variant="h5" 
          component={Link} 
          href="/home" 
          sx={{ 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textDecoration: 'none',
            letterSpacing: '-0.02em'
          }}
        >
          🎣 FishingSNS
        </Typography>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
          <Button 
            component={Link} 
            href="/home"
            startIcon={<Home />}
            sx={{ 
              color: 'text.primary',
              fontWeight: 500,
              borderRadius: 2,
              px: 2,
              '&:hover': {
                bgcolor: 'rgba(14, 165, 233, 0.1)',
                color: 'primary.main'
              }
            }}
          >
            ホーム
          </Button>
          <Button 
            component={Link} 
            href="/explore"
            startIcon={<Explore />}
            sx={{ 
              color: 'text.primary',
              fontWeight: 500,
              borderRadius: 2,
              px: 2,
              '&:hover': {
                bgcolor: 'rgba(14, 165, 233, 0.1)',
                color: 'primary.main'
              }
            }}
          >
            探す
          </Button>
          
          {/* Post Button */}
          <Button 
            component={Link} 
            href="/post/new"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
              borderRadius: 3,
              px: 3,
              py: 1,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0284c7, #0d9488)',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 16px rgba(14, 165, 233, 0.4)',
              },
              transition: 'all 0.2s ease'
            }}
          >
            投稿
          </Button>

          {/* User Actions */}
          <IconButton 
            sx={{ 
              ml: 1,
              color: 'text.secondary',
              '&:hover': { bgcolor: 'rgba(14, 165, 233, 0.1)' }
            }}
          >
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          
          <IconButton sx={{ ml: 1 }}>
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32,
                bgcolor: 'primary.main',
                fontSize: 14,
                fontWeight: 600
              }}
            >
              U
            </Avatar>
          </IconButton>
        </Box>

        {/* Mobile Navigation */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
          <IconButton 
            sx={{
              '&:hover': {
                bgcolor: 'rgba(14, 165, 233, 0.1)',
              }
            }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14, fontWeight: 600 }}>
              U
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  )
} 