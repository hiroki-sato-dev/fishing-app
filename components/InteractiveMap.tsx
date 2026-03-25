'use client'

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import {
  Map,
  AdvancedMarker,
  MapControl,
  ControlPosition,
  useMap,
  useMapsLibrary,
  type MapMouseEvent,
} from '@vis.gl/react-google-maps'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, Alert, Fab,
} from '@mui/material'
import { MyLocation } from '@mui/icons-material'
import type { FishingArea } from '@/types/fishing-area'

type NewAreaData = {
  name: string
  centerLat: number
  centerLng: number
  radius: number
  description: string
}

type HighlightCircle = {
  centerLat: number
  centerLng: number
  radius: number
  fillColor: string
  strokeColor: string
}

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
      map.setCenter(currentLocation)
      map.setZoom(15)
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

  useEffect(() => {
    if (!currentLocation || !map) return
    map.panTo(currentLocation)
    map.setZoom(15)
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
          map?.setZoom(15)
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

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371e3
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

type InteractiveMapProps = {
  fishingAreas: FishingArea[]
  height?: string
  onAreaSelect?: (area: FishingArea) => void
  onNewAreaCreate?: (area: { name?: string; centerLat: number; centerLng: number; radius: number; description?: string }) => void
  currentLocation?: { lat: number; lng: number } | null
}

export const InteractiveMap = forwardRef<{ clearSelection?: () => void }, InteractiveMapProps>(
  ({ fishingAreas, height = '400px', onAreaSelect, onNewAreaCreate, currentLocation }, ref) => {
    const [clickedPosition, setClickedPosition] = useState<{ lat: number; lng: number } | null>(null)
    const [selectedArea, setSelectedArea] = useState<FishingArea | null>(null)
    const [showNewAreaDialog, setShowNewAreaDialog] = useState(false)
    const [showAreaSelectDialog, setShowAreaSelectDialog] = useState(false)
    const [newAreaData, setNewAreaData] = useState<NewAreaData>({
      name: '', centerLat: 0, centerLng: 0, radius: 200, description: '',
    })
    const [nearbyAreas, setNearbyAreas] = useState<FishingArea[]>([])
    const [highlightCircle, setHighlightCircle] = useState<HighlightCircle | null>(null)
    const [previewPosition, setPreviewPosition] = useState<{ lat: number; lng: number } | null>(null)

    useImperativeHandle(ref, () => ({
      clearSelection: () => setHighlightCircle(null),
    }))

    const findNearbyAreas = (lat: number, lng: number, searchRadius = 300) =>
      fishingAreas.filter(area => calculateDistance(lat, lng, area.centerLat, area.centerLng) <= searchRadius)

    const handleMapClick = (e: MapMouseEvent) => {
      if (!e.detail.latLng) return
      const lat = e.detail.latLng.lat
      const lng = e.detail.latLng.lng

      setClickedPosition({ lat, lng })

      const nearby = findNearbyAreas(lat, lng)
      setNearbyAreas(nearby)

      if (nearby.length > 0) {
        setShowAreaSelectDialog(true)
      } else {
        setShowNewAreaDialog(true)
        setNewAreaData(prev => ({ ...prev, centerLat: lat, centerLng: lng }))
        setPreviewPosition({ lat, lng })
      }
    }

    const handleAreaSelect = (area: FishingArea) => {
      onAreaSelect?.(area)
      setHighlightCircle({
        centerLat: area.centerLat, centerLng: area.centerLng, radius: area.radius,
        fillColor: '#10B981', strokeColor: '#059669',
      })
      setShowAreaSelectDialog(false)
      setSelectedArea(null)
    }

    const handleNewAreaCreate = () => {
      if (onNewAreaCreate && clickedPosition) {
        onNewAreaCreate({
          name: newAreaData.name || undefined,
          centerLat: clickedPosition.lat,
          centerLng: clickedPosition.lng,
          radius: 200,
          description: newAreaData.description || undefined,
        })
        setHighlightCircle({
          centerLat: clickedPosition.lat, centerLng: clickedPosition.lng, radius: 200,
          fillColor: '#F97316', strokeColor: '#EA580C',
        })
      }
      setShowNewAreaDialog(false)
      setNewAreaData({ name: '', centerLat: 0, centerLng: 0, radius: 200, description: '' })
      setClickedPosition(null)
      setPreviewPosition(null)
    }

    const handleDialogClose = () => {
      setShowNewAreaDialog(false)
      setShowAreaSelectDialog(false)
      setSelectedArea(null)
      setClickedPosition(null)
      setNearbyAreas([])
      setPreviewPosition(null)
      setHighlightCircle(null)
    }

    return (
      <Box sx={{ position: 'relative' }}>
        <Map
          style={{ height, width: '100%', borderRadius: '8px', border: '1px solid #ddd' }}
          defaultCenter={{ lat: 35.6762, lng: 139.6503 }}
          defaultZoom={currentLocation ? 15 : 10}
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? 'DEMO_MAP_ID'}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          onClick={handleMapClick}
        >
          <MapSetup fishingAreas={fishingAreas} currentLocation={currentLocation ?? null} />

          {currentLocation && (
            <>
              <AdvancedMarker position={currentLocation} title="現在地">
                <div style={{
                  width: 16, height: 16, borderRadius: '50%',
                  backgroundColor: '#EF4444', border: '3px solid white',
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
              onClick={() => {
                setSelectedArea(area)
                setShowAreaSelectDialog(true)
              }}
            />
          ))}

          {fishingAreas.map(area => (
            <AdvancedMarker
              key={`marker-${area.id}`}
              position={{ lat: area.centerLat, lng: area.centerLng }}
              title={area.name || '名前未設定'}
              onClick={() => {
                setSelectedArea(area)
                setShowAreaSelectDialog(true)
              }}
            >
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                backgroundColor: '#EF4444', border: '2px solid white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '14px', fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}>
                {area.postCount}
              </div>
            </AdvancedMarker>
          ))}

          {previewPosition && (
            <CircleOverlay
              centerLat={previewPosition.lat} centerLng={previewPosition.lng} radius={200}
              fillColor="#10B981" fillOpacity={0.3}
              strokeColor="#059669" strokeOpacity={0.8} strokeWeight={2}
            />
          )}

          {highlightCircle && (
            <CircleOverlay
              centerLat={highlightCircle.centerLat} centerLng={highlightCircle.centerLng}
              radius={highlightCircle.radius}
              fillColor={highlightCircle.fillColor} fillOpacity={0.4}
              strokeColor={highlightCircle.strokeColor} strokeOpacity={1} strokeWeight={3}
            />
          )}
        </Map>

        {/* 既存エリア選択ダイアログ */}
        <Dialog open={showAreaSelectDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>釣りエリアを選択</DialogTitle>
          <DialogContent>
            {selectedArea ? (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>既存のエリアが選択されました</Alert>
                <Typography variant="h6" sx={{ mb: 1 }}>{selectedArea.name || '名前未設定'}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  投稿数: {selectedArea.postCount}件
                </Typography>
                {selectedArea.description && (
                  <Typography variant="body2" sx={{ mb: 2 }}>{selectedArea.description}</Typography>
                )}
              </Box>
            ) : (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  この位置の近くに{nearbyAreas.length}個のエリアがあります
                </Alert>
                {nearbyAreas.map(area => (
                  <Box
                    key={area.id}
                    sx={{
                      p: 2, mb: 2, border: '1px solid #e0e0e0', borderRadius: 2,
                      cursor: 'pointer', '&:hover': { bgcolor: 'rgba(14, 165, 233, 0.1)' },
                    }}
                    onClick={() => setSelectedArea(area)}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {area.name || '名前未設定'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      投稿数: {area.postCount}件
                    </Typography>
                    {area.description && (
                      <Typography variant="caption" color="text.secondary">{area.description}</Typography>
                    )}
                  </Box>
                ))}
                <Button
                  variant="outlined" fullWidth sx={{ mt: 2 }}
                  onClick={() => {
                    setShowAreaSelectDialog(false)
                    setShowNewAreaDialog(true)
                    if (clickedPosition) {
                      setNewAreaData(prev => ({
                        ...prev,
                        centerLat: clickedPosition.lat,
                        centerLng: clickedPosition.lng,
                      }))
                    }
                  }}
                >
                  新しいエリアを作成する
                </Button>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>キャンセル</Button>
            {selectedArea && (
              <Button variant="contained" onClick={() => handleAreaSelect(selectedArea)}>
                このエリアを選択
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* 新規エリア作成ダイアログ */}
        <Dialog open={showNewAreaDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>新しい釣りエリアを作成</DialogTitle>
          <DialogContent>
            <Alert severity="success" sx={{ mb: 2 }}>新しいエリアを作成します（半径200m）</Alert>
            <TextField
              label="エリア名（任意）" fullWidth margin="normal"
              value={newAreaData.name}
              onChange={(e) => setNewAreaData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="例: 〇〇川河口" helperText="32文字以内"
            />
            <TextField
              label="説明（任意）" fullWidth margin="normal" multiline rows={3}
              value={newAreaData.description}
              onChange={(e) => setNewAreaData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="例: シーバス狙いに最適。朝マヅメがおすすめ" helperText="256文字以内"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>キャンセル</Button>
            <Button variant="contained" onClick={handleNewAreaCreate}>エリアを作成</Button>
          </DialogActions>
        </Dialog>
      </Box>
    )
  }
)

InteractiveMap.displayName = 'InteractiveMap'
