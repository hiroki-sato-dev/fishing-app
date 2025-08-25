'use client'

import { useRef, useEffect, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { reverseGeocode } from '@/lib/geocoding'
import type { Post } from '@/types/post'

type SimpleMapProps = {
  posts: Post[]
  height?: string
}

export const SimpleMap = ({ posts, height = '400px' }: SimpleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
          libraries: ['maps', 'marker']
        })

        await loader.importLibrary('maps')
        await loader.importLibrary('marker')

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 35.6762, lng: 139.6503 },
          zoom: 10,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        })

        // マーカーを追加
        posts.forEach(async (post) => {
          if (post.latitude !== null && post.longitude !== null) {
            const address = post.address || await reverseGeocode(post.latitude, post.longitude)
            const title = `${post.user.name} - ${address}`
            
            new google.maps.Marker({
              position: { lat: post.latitude, lng: post.longitude },
              map,
              title,
            })
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
        console.error('Google Maps loading error:', err)
        setError('地図の読み込みに失敗しました')
      }
    }

    initializeMap()
  }, [posts])

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
    <div 
      ref={mapRef}
      style={{ 
        height, 
        width: '100%', 
        borderRadius: '8px',
        border: '1px solid #ddd'
      }} 
    />
  )
}