'use client'

import { useEffect, useState } from 'react'
import { Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps'
import { Box, Dialog, IconButton, Tooltip, Typography } from '@mui/material'
import { Close, Fullscreen } from '@mui/icons-material'

type Props = {
  centerLat: number
  centerLng: number
  radius: number
  areaName: string | null
  height?: string
}

type InnerProps = {
  centerLat: number
  centerLng: number
  radius: number
}

const FishingCircle = ({ centerLat, centerLng, radius }: InnerProps) => {
  const mapsLib = useMapsLibrary('maps')
  const map = useMap()

  useEffect(() => {
    if (!mapsLib || !map) return

    const circle = new google.maps.Circle({
      center: { lat: centerLat, lng: centerLng },
      radius,
      fillColor: '#3B82F6',
      fillOpacity: 0.25,
      strokeColor: '#1D4ED8',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      clickable: false,
      map,
    })

    return () => { circle.setMap(null) }
  }, [mapsLib, map, centerLat, centerLng, radius])

  return null
}

export function PostDetailMap({ centerLat, centerLng, radius, areaName, height = '280px' }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const mapProps = {
    defaultCenter: { lat: centerLat, lng: centerLng },
    defaultZoom: 15,
    mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? 'DEMO_MAP_ID',
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    zoomControl: true,
    gestureHandling: 'greedy' as const,
  }

  return (
    <>
      <div style={{ position: 'relative' }}>
      <Box sx={{ height, borderRadius: 2, border: '1px solid #ddd', overflow: 'hidden' }}>
        <Map style={{ width: '100%', height: '100%' }} {...mapProps}>
          <FishingCircle centerLat={centerLat} centerLng={centerLng} radius={radius} />
          <AdvancedMarker position={{ lat: centerLat, lng: centerLng }} title={areaName || '釣りポイント'}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              backgroundColor: '#EF4444', border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }} />
          </AdvancedMarker>
        </Map>
      </Box>
      <Tooltip title="地図を拡大">
        <IconButton
          size="small"
          onClick={() => setIsModalOpen(true)}
          sx={{
            position: 'absolute', top: 8, right: 8, zIndex: 10,
            backgroundColor: 'rgba(255,255,255,0.9)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            '&:hover': { backgroundColor: 'white' },
          }}
        >
          <Fullscreen fontSize="small" />
        </IconButton>
      </Tooltip>
      </div>

      <Dialog fullScreen open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: '1px solid #eee', flexShrink: 0 }}>
            <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>
              {areaName || '釣りポイント'}
            </Typography>
            <IconButton onClick={() => setIsModalOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Map style={{ width: '100%', height: '100%' }} {...mapProps}>
              <FishingCircle centerLat={centerLat} centerLng={centerLng} radius={radius} />
              <AdvancedMarker position={{ lat: centerLat, lng: centerLng }} title={areaName || '釣りポイント'}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  backgroundColor: '#EF4444', border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }} />
              </AdvancedMarker>
            </Map>
          </Box>
        </Box>
      </Dialog>
    </>
  )
}
