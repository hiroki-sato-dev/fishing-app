'use client'

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box, Alert, Fab } from '@mui/material'
import { MyLocation } from '@mui/icons-material'
import type { FishingArea } from '@/types/fishing-area'

type InteractiveMapProps = {
  fishingAreas: FishingArea[]
  height?: string
  onAreaSelect?: (area: FishingArea) => void
  onNewAreaCreate?: (area: { name?: string; centerLat: number; centerLng: number; radius: number; description?: string }) => void
  currentLocation?: { lat: number; lng: number } | null
}

type NewAreaData = {
  name: string
  centerLat: number
  centerLng: number
  radius: number
  description: string
}

export const InteractiveMap = forwardRef<{ clearSelection?: () => void }, InteractiveMapProps>(({ fishingAreas, height = '400px', onAreaSelect, onNewAreaCreate, currentLocation }, ref) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [clickedPosition, setClickedPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedArea, setSelectedArea] = useState<FishingArea | null>(null)
  const [showNewAreaDialog, setShowNewAreaDialog] = useState(false)
  const [showAreaSelectDialog, setShowAreaSelectDialog] = useState(false)
  const [newAreaData, setNewAreaData] = useState<NewAreaData>({
    name: '',
    centerLat: 0,
    centerLng: 0,
    radius: 200,
    description: ''
  })
  const [previewCircle, setPreviewCircle] = useState<google.maps.Circle | null>(null)
  const [nearbyAreas, setNearbyAreas] = useState<FishingArea[]>([])
  const [selectedAreaCircle, setSelectedAreaCircle] = useState<google.maps.Circle | null>(null)
  
  // エリアハイライト関数
  const highlightArea = (area: { centerLat: number; centerLng: number; radius: number }, fillColor: string, strokeColor: string) => {
    if (selectedAreaCircle) {
      selectedAreaCircle.setMap(null)
    }
    
    if (mapInstanceRef.current) {
      const highlightCircle = new google.maps.Circle({
        center: { lat: area.centerLat, lng: area.centerLng },
        radius: area.radius,
        fillColor,
        fillOpacity: 0.4,
        strokeColor,
        strokeOpacity: 1,
        strokeWeight: 3,
        clickable: false,
        map: mapInstanceRef.current
      })
      setSelectedAreaCircle(highlightCircle)
    }
  }

  // 現在地に戻る関数
  const returnToCurrentLocation = () => {
    if (currentLocation && mapInstanceRef.current) {
      mapInstanceRef.current.panTo(currentLocation)
      mapInstanceRef.current.setZoom(15)
      // setHasUserInteracted(false)
    }
  }

  // 親コンポーネントから呼び出せる関数を公開
  useImperativeHandle(ref, () => ({
    clearSelection: () => {
      if (selectedAreaCircle) {
        selectedAreaCircle.setMap(null)
        setSelectedAreaCircle(null)
      }
    },
    returnToCurrentLocation
  }))

  // 指定位置から半径内の既存エリアを検索
  const findNearbyAreas = (lat: number, lng: number, searchRadius: number = 300) => {
    const nearby = fishingAreas.filter(area => {
      const distance = calculateDistance(lat, lng, area.centerLat, area.centerLng)
      return distance <= searchRadius
    })
    return nearby
  }

  // 2点間の距離を計算（メートル）
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371e3 // 地球の半径（メートル）
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lng2 - lng1) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  const handleAreaSelect = (area: FishingArea) => {
    // setHasUserInteracted(true)
    
    if (onAreaSelect) {
      onAreaSelect(area)
    }
    
    // 選択されたエリアをハイライト表示（地図の位置は変えない）
    highlightArea(area, '#10B981', '#059669') // 既存エリアは緑色
    
    setShowAreaSelectDialog(false)
    setSelectedArea(null)
  }

  const handleNewAreaCreate = () => {
    // setHasUserInteracted(true)
    
    if (onNewAreaCreate && clickedPosition) {
      const newArea = {
        name: newAreaData.name || undefined,
        centerLat: clickedPosition.lat,
        centerLng: clickedPosition.lng,
        radius: 200, // 固定値
        description: newAreaData.description || undefined
      }
      
      // 新規作成予定のエリアをオレンジ色でハイライト（まだDBには保存しない）
      highlightArea({
        centerLat: clickedPosition.lat,
        centerLng: clickedPosition.lng,
        radius: 200
      }, '#F97316', '#EA580C') // オレンジ色で新規作成予定を強調
      
      // 親コンポーネントに新規エリア情報を渡す（DBには保存しない）
      onNewAreaCreate(newArea)
    }
    setShowNewAreaDialog(false)
    setNewAreaData({ name: '', centerLat: 0, centerLng: 0, radius: 200, description: '' })
    setClickedPosition(null)
    // プレビュー円を削除
    if (previewCircle) {
      previewCircle.setMap(null)
      setPreviewCircle(null)
    }
  }

  const handleDialogClose = () => {
    setShowNewAreaDialog(false)
    setShowAreaSelectDialog(false)
    setSelectedArea(null)
    setClickedPosition(null)
    setNearbyAreas([])
    // プレビュー円を削除
    if (previewCircle) {
      previewCircle.setMap(null)
      setPreviewCircle(null)
    }
    // 選択エリアのハイライトを削除
    if (selectedAreaCircle) {
      selectedAreaCircle.setMap(null)
      setSelectedAreaCircle(null)
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

        const center = currentLocation || { lat: 35.6762, lng: 139.6503 }
        const zoom = currentLocation ? 15 : 10
        
        
        // 既存のマップインスタンスがある場合は、位置とズームを更新
        if (mapInstanceRef.current && currentLocation) {
          mapInstanceRef.current.setCenter(center)
          mapInstanceRef.current.setZoom(15)
          
          // 現在地マーカーを追加（再描画時）
          new google.maps.Marker({
            position: currentLocation,
            map: mapInstanceRef.current,
            title: '現在地',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#EF4444',
              fillOpacity: 1,
              strokeWeight: 3,
              strokeColor: '#FFFFFF'
            }
          })
          return
        }
        
        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom,
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

        // 既存の釣りエリアの円を描画
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

          // 既存エリアクリック時
          const handleAreaClick = () => {
            setSelectedArea(area)
            setShowAreaSelectDialog(true)
          }

          circle.addListener('click', handleAreaClick)
          marker.addListener('click', handleAreaClick)
        })

        // 地図クリック時の処理
        map.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (!event.latLng) return
          
          const lat = event.latLng.lat()
          const lng = event.latLng.lng()
          setClickedPosition({ lat, lng })

          // 近くの既存エリアを検索
          const nearby = findNearbyAreas(lat, lng)
          setNearbyAreas(nearby)

          if (nearby.length > 0) {
            // 既存エリアが近くにある場合は選択ダイアログを表示
            setShowAreaSelectDialog(true)
          } else {
            // 既存エリアがない場合は新規作成ダイアログを表示
            setShowNewAreaDialog(true)
            setNewAreaData(prev => ({ ...prev, centerLat: lat, centerLng: lng }))
            
            // プレビュー円を表示
            if (previewCircle) {
              previewCircle.setMap(null)
            }
            const newPreviewCircle = new google.maps.Circle({
              center: { lat, lng },
              radius: 200,
              fillColor: '#10B981',
              fillOpacity: 0.3,
              strokeColor: '#059669',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              clickable: false,
              map
            })
            setPreviewCircle(newPreviewCircle)
          }
        })

        // 現在地がない場合のみ、地図の範囲をfishingAreasに合わせて調整
        if (!currentLocation && fishingAreas.length > 0) {
          const bounds = new google.maps.LatLngBounds()
          fishingAreas.forEach(area => {
            bounds.extend({ lat: area.centerLat, lng: area.centerLng })
          })
          map.fitBounds(bounds)
          
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

    // 現在地の取得を待ってから地図を初期化
    initializeMap()
  }, [fishingAreas, currentLocation])

  // ユーザーが操作したかどうかのフラグ（将来の機能拡張用）
  // const [hasUserInteracted, setHasUserInteracted] = useState(false)

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

      {/* 既存エリア選択ダイアログ */}
      <Dialog open={showAreaSelectDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>釣りエリアを選択</DialogTitle>
        <DialogContent>
          {selectedArea ? (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                既存のエリアが選択されました
              </Alert>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {selectedArea.name || '名前未設定'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                投稿数: {selectedArea.postCount}件
              </Typography>
              {selectedArea.description && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedArea.description}
                </Typography>
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
                    p: 2, 
                    mb: 2, 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(14, 165, 233, 0.1)' }
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
                    <Typography variant="caption" color="text.secondary">
                      {area.description}
                    </Typography>
                  )}
                </Box>
              ))}
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => {
                  setShowAreaSelectDialog(false)
                  setShowNewAreaDialog(true)
                  if (clickedPosition) {
                    setNewAreaData(prev => ({ 
                      ...prev, 
                      centerLat: clickedPosition.lat, 
                      centerLng: clickedPosition.lng 
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
          <Alert severity="success" sx={{ mb: 2 }}>
            新しいエリアを作成します（半径200m）
          </Alert>
          <TextField
            label="エリア名（任意）"
            fullWidth
            margin="normal"
            value={newAreaData.name}
            onChange={(e) => setNewAreaData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="例: 〇〇川河口"
            helperText="32文字以内"
          />
          <TextField
            label="説明（任意）"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={newAreaData.description}
            onChange={(e) => setNewAreaData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="例: シーバス狙いに最適。朝マヅメがおすすめ"
            helperText="256文字以内"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>キャンセル</Button>
          <Button variant="contained" onClick={handleNewAreaCreate}>
            エリアを作成
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
})

InteractiveMap.displayName = 'InteractiveMap'