'use client'

import { useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import type { Post } from '@/types/post'

type SimpleMapProps = {
  posts: Post[]
  height?: string
}

export const SimpleMap = ({ posts, height = '400px' }: SimpleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializeMap = async (container: HTMLDivElement) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      setError('Google Maps APIキーが設定されていません')
      return
    }

    try {
      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['maps', 'marker']
      })

      const google = await loader.load()
      
      const map = new google.maps.Map(container, {
        center: { lat: 35.6762, lng: 139.6503 },
        zoom: 10,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        mapId: 'FISHING_APP_MAP', // AdvancedMarkerElement用のMap ID
      })

      // マーカーを追加（AdvancedMarkerElementを使用）
      posts.forEach((post) => {
        // 位置情報がnullでないことを確認
        if (post.latitude !== null && post.longitude !== null) {
          // AdvancedMarkerElementを試行、失敗した場合は従来のMarkerを使用
          if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
            new google.maps.marker.AdvancedMarkerElement({
              position: { lat: post.latitude, lng: post.longitude },
              map,
              title: post.user.name,
            })
          } else {
            // フォールバック: 古いMarkerを使用（非推奨だが互換性のため）
            // @ts-ignore - 非推奨APIの警告を抑制
            new google.maps.Marker({
              position: { lat: post.latitude, lng: post.longitude },
              map,
              title: post.user.name,
            })
          }
        }
      })

      // 投稿がある場合は範囲を調整
      const validPosts = posts.filter(post => post.latitude !== null && post.longitude !== null)
      if (validPosts.length > 0) {
        const bounds = new google.maps.LatLngBounds()
        validPosts.forEach(post => {
          bounds.extend({ lat: post.latitude!, lng: post.longitude! })
        })
        map.fitBounds(bounds)
      }

      setIsLoaded(true)
    } catch (err) {
      setError('地図の読み込みに失敗しました')
      console.error(err)
    }
  }

  const handleRef = (node: HTMLDivElement | null) => {
    if (node && !isLoaded && !error) {
      mapRef.current = node
      initializeMap(node)
    }
  }

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
          <div>{error}</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            APIキーの設定を確認してください
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={handleRef}
      style={{ 
        height, 
        width: '100%', 
        borderRadius: '8px',
        border: '1px solid #ddd'
      }} 
    />
  )
}