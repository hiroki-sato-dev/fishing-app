'use client'

import { useState } from 'react'
import { Box, Card, Dialog, IconButton, Typography } from '@mui/material'
import { Close, Fullscreen } from '@mui/icons-material'
import { SimpleMap } from '@/components/SimpleMap'
import type { FishingArea } from '@/types/fishing-area'

type Props = {
  fishingAreas: FishingArea[]
  height?: string
}

export const MapCard = ({ fishingAreas, height = '500px' }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Card sx={{
        borderRadius: { xs: 3, lg: 4 },
        overflow: 'hidden',
        boxShadow: { xs: '0 4px 12px rgba(0,0,0,0.08)', lg: '0 10px 25px -5px rgba(0,0,0,0.1)' },
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
      }}>
        <Box sx={{ px: { xs: 2, lg: 3 }, pt: { xs: 1.5, lg: 3 }, pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 1, lg: 2 } }}>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.9rem', lg: '1.5rem' } }}>
              🗺️ 釣りエリアマップ
            </Typography>
            <IconButton
              onClick={() => setIsModalOpen(true)}
              size="small"
              sx={{ borderRadius: 2, border: '1px solid', borderColor: 'primary.main', color: 'primary.main', '&:hover': { bgcolor: 'rgba(14,165,233,0.1)' } }}
            >
              <Fullscreen fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <SimpleMap fishingAreas={fishingAreas} height={height} />
      </Card>

      <Dialog fullScreen open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: '1px solid #eee', flexShrink: 0 }}>
            <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>🗺️ 釣りエリアマップ</Typography>
            <IconButton onClick={() => setIsModalOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1 }}>
            <SimpleMap fishingAreas={fishingAreas} height="100%" />
          </Box>
        </Box>
      </Dialog>
    </>
  )
}
