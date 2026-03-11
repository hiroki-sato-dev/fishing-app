'use client'

import { useRef, useEffect, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { Box, Typography } from '@mui/material'

type Props = {
  centerLat: number
  centerLng: number
  radius: number
  areaName: string | null
  height?: string
}

export function PostDetailMap({ centerLat, centerLng, radius, areaName, height = '280px' }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        setError('Google Maps APIキーが設定されていません')
        return
      }

      try {
        const loader = new Loader({ apiKey, version: 'weekly', libraries: ['maps'] })
        await loader.importLibrary('maps')

        const center = { lat: centerLat, lng: centerLng }

        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
        })

        // 釣りエリアの円
        new google.maps.Circle({
          center,
          radius,
          fillColor: '#3B82F6',
          fillOpacity: 0.25,
          strokeColor: '#1D4ED8',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          map,
        })

        // 中心マーカー
        new google.maps.Marker({
          position: center,
          map,
          title: areaName || '釣りポイント',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#EF4444',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#FFFFFF',
          },
        })
      } catch (err) {
        console.error('Google Maps loading error:', err)
        setError('地図の読み込みに失敗しました')
      }
    }

    initMap()
  }, [centerLat, centerLng, radius, areaName])

  if (error) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f5f5',
          borderRadius: 2,
          border: '1px solid #ddd',
        }}
      >
        <Typography variant="body2" color="text.secondary">{error}</Typography>
      </Box>
    )
  }

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%', borderRadius: 8, border: '1px solid #ddd' }}
    />
  )
}
