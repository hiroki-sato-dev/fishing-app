'use client'

import { useRef, useEffect, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { Fab, Box } from '@mui/material'
import { MyLocation } from '@mui/icons-material'
import type { FishingArea } from '@/types/fishing-area'

type FishingAreaMapProps = {
  fishingAreas: FishingArea[]
  height?: string
  onAreaClick?: (area: FishingArea) => void
}

export const SimpleMap = ({ fishingAreas, height = '400px', onAreaClick }: FishingAreaMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)

  // 現在地を取得
  useEffect(() => {
    if (navigator.geolocation && !currentLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('現在地の取得に失敗:', error)
        },
        { timeout: 10000, enableHighAccuracy: false }
      )
    }
  }, [])

  // 現在地に戻る関数
  const returnToCurrentLocation = () => {
    if (currentLocation && mapInstanceRef.current) {
      mapInstanceRef.current.panTo(currentLocation)
      mapInstanceRef.current.setZoom(14)
    }
  }

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current) return

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        setError('Google Maps APIキーが設定されていません')
        return
      }

      try {
        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['maps']
        })

        await loader.importLibrary('maps')

        const map = new google.maps.Map(mapRef.current, {
          center: currentLocation || { lat: 35.6762, lng: 139.6503 },
          zoom: currentLocation ? 14 : 11,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        })

        // mapインスタンスを保存
        mapInstanceRef.current = map

        // 現在地マーカーを表示
        if (currentLocation) {
          new google.maps.Marker({
            position: currentLocation,
            map,
            title: '現在地',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#EF4444',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#FFFFFF'
            }
          })
        }

        // 現在地が後から取得された場合の地図更新処理
        if (currentLocation && !fishingAreas.find(area => area.centerLat === currentLocation.lat)) {
          // 現在地を中心に移動し、適切なズームレベルに設定
          map.panTo(currentLocation)
          map.setZoom(14)
        }

        // 釣りエリアの円を描画
        fishingAreas.forEach((area) => {
          const circle = new google.maps.Circle({
            center: { lat: area.centerLat, lng: area.centerLng },
            radius: area.radius,
            fillColor: '#3B82F6',
            fillOpacity: 0.3,
            strokeColor: '#1D4ED8',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            clickable: true,
            map
          })

          // エリア名と投稿数を表示するマーカー
          const marker = new google.maps.Marker({
            position: { lat: area.centerLat, lng: area.centerLng },
            map,
            title: area.name || '名前未設定',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: '#EF4444',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#FFFFFF'
            },
            label: {
              text: area.postCount.toString(),
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 'bold'
            }
          })

          // インフォウィンドウを作成
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; color: #1D4ED8; font-size: 16px;">
                  ${area.name || '名前未設定'}
                </h3>
                <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">
                  投稿数: ${area.postCount}件
                </p>
                ${area.description ? `
                  <p style="margin: 4px 0 0 0; color: #333; font-size: 13px;">
                    ${area.description}
                  </p>
                ` : ''}
              </div>
            `
          })

          // クリックイベント
          const handleClick = () => {
            infoWindow.open(map, marker)
            if (onAreaClick) {
              onAreaClick(area)
            }
          }

          circle.addListener('click', handleClick)
          marker.addListener('click', handleClick)
        })

        // 現在地が取得できていない場合のみ、釣りエリアに合わせて範囲を調整
        if (!currentLocation && fishingAreas.length > 0) {
          const bounds = new google.maps.LatLngBounds()
          fishingAreas.forEach(area => {
            // 円の範囲を考慮してboundsを拡張
            const circle = new google.maps.Circle({
              center: { lat: area.centerLat, lng: area.centerLng },
              radius: area.radius
            })
            bounds.union(circle.getBounds()!)
          })
          map.fitBounds(bounds)
          
          // ズームが近すぎる場合は調整
          const listener = google.maps.event.addListener(map, 'idle', () => {
            if (map.getZoom()! > 15) map.setZoom(15)
            google.maps.event.removeListener(listener)
          })
        }

        // マップの初期化完了
      } catch (err) {
        console.error('Google Maps loading error:', err)
        setError('地図の読み込みに失敗しました')
      }
    }

    initializeMap()
  }, [fishingAreas, onAreaClick, currentLocation])

  if (error) {
    return (
      <div 
        style={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}
      >
        <div style={{ textAlign: 'center', color: '#666' }}>
          {error}
        </div>
      </div>
    )
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <div 
        ref={mapRef}
        style={{ 
          height, 
          width: '100%', 
          borderRadius: '8px',
          border: '1px solid #ddd'
        }} 
      />
      
      {/* 現在地に戻るボタン */}
      {currentLocation && (
        <Fab
          size="small"
          color="primary"
          onClick={returnToCurrentLocation}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: 'white',
            color: 'primary.main',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            }
          }}
        >
          <MyLocation />
        </Fab>
      )}
    </Box>
  )
}