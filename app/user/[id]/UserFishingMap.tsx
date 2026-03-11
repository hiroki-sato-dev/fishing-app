'use client'

import { useRef, useEffect, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { Box, Typography } from '@mui/material'

type AreaPin = {
  id: string
  name: string | null
  centerLat: number
  centerLng: number
  radius: number
  postCount: number
}

type Props = {
  areas: AreaPin[]
  height?: string
}

export function UserFishingMap({ areas, height = '300px' }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || areas.length === 0) return

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        setError('Google Maps APIキーが設定されていません')
        return
      }

      try {
        const loader = new Loader({ apiKey, version: 'weekly', libraries: ['maps'] })
        await loader.importLibrary('maps')

        // 全エリアの中心を計算して初期表示位置にする
        const avgLat = areas.reduce((sum, a) => sum + a.centerLat, 0) / areas.length
        const avgLng = areas.reduce((sum, a) => sum + a.centerLng, 0) / areas.length

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: avgLat, lng: avgLng },
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
        })

        const bounds = new google.maps.LatLngBounds()

        areas.forEach((area) => {
          const center = { lat: area.centerLat, lng: area.centerLng }

          const circle = new google.maps.Circle({
            center,
            radius: area.radius,
            fillColor: '#3B82F6',
            fillOpacity: 0.25,
            strokeColor: '#1D4ED8',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            map,
          })

          const marker = new google.maps.Marker({
            position: center,
            map,
            title: area.name || '釣りポイント',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#EF4444',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#FFFFFF',
            },
            label: {
              text: area.postCount.toString(),
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 'bold',
            },
          })

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; min-width: 160px;">
                <p style="margin: 0; font-weight: 600; color: #1D4ED8; font-size: 14px;">
                  ${area.name || '釣りポイント'}
                </p>
                <p style="margin: 4px 0 0; color: #666; font-size: 12px;">投稿数: ${area.postCount}件</p>
              </div>
            `,
          })

          marker.addListener('click', () => infoWindow.open(map, marker))
          circle.addListener('click', () => infoWindow.open(map, marker))

          bounds.union(circle.getBounds()!)
        })

        // 全エリアが収まるようにズーム調整
        if (areas.length > 1) {
          map.fitBounds(bounds)
          const listener = google.maps.event.addListener(map, 'idle', () => {
            if (map.getZoom()! > 15) map.setZoom(15)
            google.maps.event.removeListener(listener)
          })
        } else {
          map.setCenter({ lat: areas[0].centerLat, lng: areas[0].centerLng })
          map.setZoom(15)
        }
      } catch (err) {
        console.error('Google Maps loading error:', err)
        setError('地図の読み込みに失敗しました')
      }
    }

    initMap()
  }, [areas])

  if (areas.length === 0) return null

  if (error) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 2, border: '1px solid #ddd' }}>
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
