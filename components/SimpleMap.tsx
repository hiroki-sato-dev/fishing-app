'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Map,
  AdvancedMarker,
  InfoWindow,
  MapControl,
  ControlPosition,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps'
import { Fab, Box } from '@mui/material'
import { MyLocation } from '@mui/icons-material'
import type { FishingArea } from '@/types/fishing-area'

type CircleOverlayProps = {
  centerLat: number
  centerLng: number
  radius: number
  fillColor?: string
  fillOpacity?: number
  strokeColor?: string
  strokeOpacity?: number
  strokeWeight?: number
  clickable?: boolean
  onClick?: () => void
}

const CircleOverlay = ({
  centerLat, centerLng, radius,
  fillColor = '#3B82F6', fillOpacity = 0.3,
  strokeColor = '#1D4ED8', strokeOpacity = 0.8, strokeWeight = 2,
  clickable = false,
  onClick,
}: CircleOverlayProps) => {
  const mapsLib = useMapsLibrary('maps')
  const map = useMap()
  const onClickRef = useRef(onClick)
  useEffect(() => { onClickRef.current = onClick }, [onClick])

  useEffect(() => {
    if (!mapsLib || !map) return

    const circle = new google.maps.Circle({
      center: { lat: centerLat, lng: centerLng },
      radius,
      fillColor, fillOpacity,
      strokeColor, strokeOpacity, strokeWeight,
      clickable,
      map,
    })

    const listener = clickable ? circle.addListener('click', () => onClickRef.current?.()) : null

    return () => {
      if (listener) google.maps.event.removeListener(listener)
      circle.setMap(null)
    }
  }, [mapsLib, map, centerLat, centerLng, radius, fillColor, fillOpacity, strokeColor, strokeOpacity, strokeWeight, clickable])

  return null
}

const MapSetup = ({
  fishingAreas,
  currentLocation,
}: {
  fishingAreas: FishingArea[]
  currentLocation: { lat: number; lng: number } | null
}) => {
  const map = useMap()
  const mapsLib = useMapsLibrary('maps')
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!map || !mapsLib || initializedRef.current) return
    if (currentLocation) {
      map.panTo(currentLocation)
      map.setZoom(14)
      initializedRef.current = true
    } else if (fishingAreas.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      fishingAreas.forEach(area => bounds.extend({ lat: area.centerLat, lng: area.centerLng }))
      map.fitBounds(bounds)
      const listener = google.maps.event.addListener(map, 'idle', () => {
        if ((map.getZoom() ?? 0) > 15) map.setZoom(15)
        google.maps.event.removeListener(listener)
      })
      initializedRef.current = true
    }
  }, [map, mapsLib, fishingAreas, currentLocation])

  // 現在地が後から取得された場合
  useEffect(() => {
    if (!currentLocation || !map) return
    map.panTo(currentLocation)
    map.setZoom(14)
  }, [currentLocation, map])

  return null
}

const ReturnToLocationControl = ({ currentLocation }: { currentLocation: { lat: number; lng: number } }) => {
  const map = useMap()

  return (
    <MapControl position={ControlPosition.TOP_RIGHT}>
      <Fab
        size="small"
        onClick={() => {
          map?.panTo(currentLocation)
          map?.setZoom(14)
        }}
        sx={{
          m: 1,
          backgroundColor: 'white',
          color: 'primary.main',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          '&:hover': { backgroundColor: '#f5f5f5' },
        }}
      >
        <MyLocation />
      </Fab>
    </MapControl>
  )
}

type FishingAreaMapProps = {
  fishingAreas: FishingArea[]
  height?: string
  onAreaClick?: (area: FishingArea) => void
}

export const SimpleMap = ({ fishingAreas, height = '400px', onAreaClick }: FishingAreaMapProps) => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedArea, setSelectedArea] = useState<FishingArea | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 10000, enableHighAccuracy: false }
    )
  }, [])

  const handleAreaClick = (area: FishingArea) => {
    setSelectedArea(area)
    onAreaClick?.(area)
  }

  return (
    <Box sx={{ height, borderRadius: '8px', border: '1px solid #ddd', overflow: 'hidden' }}>
      <Map
        style={{ width: '100%', height: '100%' }}
        defaultCenter={{ lat: 35.6762, lng: 139.6503 }}
        defaultZoom={11}
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? 'DEMO_MAP_ID'}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
        gestureHandling="greedy"
      >
        <MapSetup fishingAreas={fishingAreas} currentLocation={currentLocation} />

        {currentLocation && (
          <>
            <AdvancedMarker position={currentLocation} title="現在地">
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                backgroundColor: '#EF4444', border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }} />
            </AdvancedMarker>
            <ReturnToLocationControl currentLocation={currentLocation} />
          </>
        )}

        {fishingAreas.map(area => (
          <CircleOverlay
            key={`circle-${area.id}`}
            centerLat={area.centerLat} centerLng={area.centerLng} radius={area.radius}
            clickable
            onClick={() => handleAreaClick(area)}
          />
        ))}

        {fishingAreas.map(area => (
          <AdvancedMarker
            key={`marker-${area.id}`}
            position={{ lat: area.centerLat, lng: area.centerLng }}
            title={area.name || '名前未設定'}
            onClick={() => handleAreaClick(area)}
          >
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              backgroundColor: '#EF4444', border: '2px solid white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '12px', fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}>
              {area.postCount}
            </div>
          </AdvancedMarker>
        ))}

        {selectedArea && (
          <InfoWindow
            position={{ lat: selectedArea.centerLat, lng: selectedArea.centerLng }}
            onCloseClick={() => setSelectedArea(null)}
          >
            <div style={{ padding: '8px', minWidth: '200px' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#1D4ED8', fontSize: '16px' }}>
                {selectedArea.name || '名前未設定'}
              </h3>
              <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '14px' }}>
                投稿数: {selectedArea.postCount}件
              </p>
              {selectedArea.description && (
                <p style={{ margin: '4px 0 0 0', color: '#333', fontSize: '13px' }}>
                  {selectedArea.description}
                </p>
              )}
            </div>
          </InfoWindow>
        )}
      </Map>
    </Box>
  )
}
