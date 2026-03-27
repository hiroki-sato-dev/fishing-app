'use client'

import { useEffect, useRef, useState } from 'react'
import { Map, AdvancedMarker, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps'
import { Box, Dialog, IconButton, Tooltip, Typography } from '@mui/material'
import { Close, Fullscreen } from '@mui/icons-material'

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

type AreaCircleProps = {
  area: AreaPin
  onClick: () => void
}

const AreaCircle = ({ area, onClick }: AreaCircleProps) => {
  const mapsLib = useMapsLibrary('maps')
  const map = useMap()
  const onClickRef = useRef(onClick)
  useEffect(() => { onClickRef.current = onClick }, [onClick])

  useEffect(() => {
    if (!mapsLib || !map) return

    const circle = new google.maps.Circle({
      center: { lat: area.centerLat, lng: area.centerLng },
      radius: area.radius,
      fillColor: '#3B82F6',
      fillOpacity: 0.25,
      strokeColor: '#1D4ED8',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      clickable: true,
      map,
    })

    const listener = circle.addListener('click', () => onClickRef.current())

    return () => {
      google.maps.event.removeListener(listener)
      circle.setMap(null)
    }
  }, [mapsLib, map, area.centerLat, area.centerLng, area.radius])

  return null
}

const MapSetup = ({ areas }: { areas: AreaPin[] }) => {
  const map = useMap()
  const mapsLib = useMapsLibrary('maps')
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!map || !mapsLib || initializedRef.current || areas.length === 0) return

    if (areas.length === 1) {
      map.setCenter({ lat: areas[0].centerLat, lng: areas[0].centerLng })
      map.setZoom(15)
    } else {
      const bounds = new google.maps.LatLngBounds()
      areas.forEach(area => bounds.extend({ lat: area.centerLat, lng: area.centerLng }))
      map.fitBounds(bounds)
      const listener = google.maps.event.addListener(map, 'idle', () => {
        if ((map.getZoom() ?? 0) > 15) map.setZoom(15)
        google.maps.event.removeListener(listener)
      })
    }

    initializedRef.current = true
  }, [map, mapsLib, areas])

  return null
}

export function UserFishingMap({ areas, height = '300px' }: Props) {
  const [selectedArea, setSelectedArea] = useState<AreaPin | null>(null)
  const [modalSelectedArea, setModalSelectedArea] = useState<AreaPin | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (areas.length === 0) return null

  const avgLat = areas.reduce((sum, a) => sum + a.centerLat, 0) / areas.length
  const avgLng = areas.reduce((sum, a) => sum + a.centerLng, 0) / areas.length

  const mapProps = {
    defaultCenter: { lat: avgLat, lng: avgLng },
    defaultZoom: 12,
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
          <MapSetup areas={areas} />
          {areas.map(area => (
            <AreaCircle key={area.id} area={area} onClick={() => setSelectedArea(area)} />
          ))}
          {areas.map(area => (
            <AdvancedMarker
              key={area.id}
              position={{ lat: area.centerLat, lng: area.centerLng }}
              title={area.name || '釣りポイント'}
              onClick={() => setSelectedArea(area)}
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
              <div style={{ padding: '8px', minWidth: '160px' }}>
                <p style={{ margin: 0, fontWeight: 600, color: '#1D4ED8', fontSize: '14px' }}>
                  {selectedArea.name || '釣りポイント'}
                </p>
                <p style={{ margin: '4px 0 0', color: '#666', fontSize: '12px' }}>
                  投稿数: {selectedArea.postCount}件
                </p>
              </div>
            </InfoWindow>
          )}
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
            <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>釣りエリアマップ</Typography>
            <IconButton onClick={() => setIsModalOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Map style={{ width: '100%', height: '100%' }} {...mapProps}>
              <MapSetup areas={areas} />
              {areas.map(area => (
                <AreaCircle key={area.id} area={area} onClick={() => setModalSelectedArea(area)} />
              ))}
              {areas.map(area => (
                <AdvancedMarker
                  key={area.id}
                  position={{ lat: area.centerLat, lng: area.centerLng }}
                  title={area.name || '釣りポイント'}
                  onClick={() => setModalSelectedArea(area)}
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
              {modalSelectedArea && (
                <InfoWindow
                  position={{ lat: modalSelectedArea.centerLat, lng: modalSelectedArea.centerLng }}
                  onCloseClick={() => setModalSelectedArea(null)}
                >
                  <div style={{ padding: '8px', minWidth: '160px' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#1D4ED8', fontSize: '14px' }}>
                      {modalSelectedArea.name || '釣りポイント'}
                    </p>
                    <p style={{ margin: '4px 0 0', color: '#666', fontSize: '12px' }}>
                      投稿数: {modalSelectedArea.postCount}件
                    </p>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </Box>
        </Box>
      </Dialog>
    </>
  )
}
