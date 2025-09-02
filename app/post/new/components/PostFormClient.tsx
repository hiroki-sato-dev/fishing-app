'use client'

import { useState, useEffect, useRef } from 'react'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { createPost } from '../actions/createPost'
import { reverseGeocode } from '@/lib/geocoding'
import {
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  Paper,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material'
import { LocationOn, Send, Cancel, Check, Image, EditNote } from '@mui/icons-material'
import { InteractiveMap } from '@/components/InteractiveMap'
import type { FishingArea } from '@/types/fishing-area'

type PostFormClientProps = {
  fishingAreas: FishingArea[]
}

export const PostFormClient = ({ fishingAreas }: PostFormClientProps) => {
  const router = useRouter()
  const mapRef = useRef<any>(null)
  const [state, formAction, isPending] = useActionState(createPost, {
    success: false,
    message: '',
  })
  
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [locationError, setLocationError] = useState<string>('')
  const [selectedFishingArea, setSelectedFishingArea] = useState<FishingArea | null>(null)
  const [localFishingAreas, setLocalFishingAreas] = useState<FishingArea[]>(fishingAreas)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isCreatingArea, setIsCreatingArea] = useState(false)
  const [locationAddress, setLocationAddress] = useState<string>('')
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)

  // リダイレクト処理
  useEffect(() => {
    if (state.success && state.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [state.success, state.redirectTo, router])

  // 初期化時にpropsのfishingAreasをローカルステートにセット
  useEffect(() => {
    setLocalFishingAreas(fishingAreas)
  }, [fishingAreas])

  // 現在地を自動取得し、住所情報も取得
  useEffect(() => {
    if (navigator.geolocation && !currentLocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setCurrentLocation(location)
          setLatitude(location.lat)
          setLongitude(location.lng)
          
          // 住所情報を取得
          setIsLoadingAddress(true)
          try {
            const address = await reverseGeocode(location.lat, location.lng)
            setLocationAddress(address)
          } catch (error) {
            console.error('住所情報の取得に失敗:', error)
          } finally {
            setIsLoadingAddress(false)
          }
        },
        (error) => {
          console.error('現在地の自動取得に失敗:', error)
          // エラーは表示せず、手動取得を促す
        },
        { timeout: 10000, enableHighAccuracy: false }
      )
    }
  }, [])

  // フォームの有効性をチェック（投稿内容は必須、位置情報は任意）
  const isValid = !!content.trim() && content.length <= 256


  // 釣りエリア選択時の処理
  const handleAreaSelect = async (area: FishingArea) => {
    console.log('Area selected:', area)
    setSelectedFishingArea(area)
    setLatitude(area.centerLat)
    setLongitude(area.centerLng)
    setLocationError('')
    
    // 選択したエリアの住所情報を取得（バックグラウンドで実行）
    setIsLoadingAddress(true)
    try {
      const address = await reverseGeocode(area.centerLat, area.centerLng)
      setLocationAddress(address)
    } catch (error) {
      console.error('住所情報の取得に失敗:', error)
      setLocationAddress('') // エラー時は空にする
    } finally {
      setIsLoadingAddress(false)
    }
  }

  // 新規エリア作成予定時の処理（投稿まで一時的な選択状態にする）
  const handleNewAreaCreate = async (areaData: { name?: string; centerLat: number; centerLng: number; radius: number; description?: string }) => {
    setIsCreatingArea(true)
    try {
      console.log('Preparing new area (not saving to DB yet):', areaData)
      
      // 一時的な釣りエリアオブジェクトを作成（投稿時に実際に保存）
      const tempArea: FishingArea = {
        id: 'temp-' + Date.now(), // 一時ID
        name: areaData.name || null,
        centerLat: areaData.centerLat,
        centerLng: areaData.centerLng,
        radius: 200,
        description: areaData.description || null,
        createdBy: 'temp-user-id',
        postCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // 新しいエリアを選択状態にする（DBには保存しない）
      setSelectedFishingArea(tempArea)
      setLatitude(tempArea.centerLat)
      setLongitude(tempArea.centerLng)
      setLocationError('')
      
      // 新しいエリアの住所情報を取得
      setIsLoadingAddress(true)
      try {
        const address = await reverseGeocode(tempArea.centerLat, tempArea.centerLng)
        setLocationAddress(address)
      } catch (error) {
        console.error('住所情報の取得に失敗:', error)
      } finally {
        setIsLoadingAddress(false)
      }
    } catch (error) {
      console.error('エリア準備エラー:', error)
      setLocationError('エリアの準備に失敗しました')
    } finally {
      setIsCreatingArea(false)
    }
  }

  return (
    <Box component="form" action={formAction} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Content Section */}
      <Paper sx={{ 
        p: 3, 
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(5px)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EditNote sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            釣果の内容
          </Typography>
        </Box>
        
        <TextField
          name="content"
          label="今日の釣果はいかがでしたか？"
          multiline
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="例: 朝5時から河口で釣りを開始。シーバス40cmを2匹ゲット！ルアーはミノー系が効果的でした。天気も良く最高の一日でした🎣"
          required
          fullWidth
          variant="outlined"
          error={content.length > 256 || !!(state.errors?.content)}
          helperText={
            state.errors?.content?.[0] || 
            `${content.length}/256文字 ${content.length > 256 ? '（文字数制限を超過）' : ''}`
          }
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              fontSize: '16px',
              '& fieldset': {
                borderColor: 'rgba(14, 165, 233, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(14, 165, 233, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
                borderWidth: 2,
              }
            },
            '& .MuiInputLabel-root': {
              color: 'text.secondary',
              '&.Mui-focused': {
                color: 'primary.main',
              }
            }
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          💡 釣った魚の種類、使用した道具、天候などの詳細を書くとより参考になります
        </Typography>
      </Paper>

      {/* Image Section */}
      <Paper sx={{ 
        p: 3, 
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(5px)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Image sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            写真を追加（オプション）
          </Typography>
        </Box>
        
        <TextField
          name="imageUrl"
          label="画像のURL"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/fish-photo.jpg"
          fullWidth
          variant="outlined"
          error={!!(state.errors?.imageUrl)}
          helperText={state.errors?.imageUrl?.[0]}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '& fieldset': {
                borderColor: 'rgba(14, 165, 233, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(14, 165, 233, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
                borderWidth: 2,
              }
            }
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          📸 釣果の写真があるとより魅力的な投稿になります
        </Typography>
      </Paper>

      {/* Hidden inputs for coordinates and fishing area */}
      {latitude !== null && (
        <input type="hidden" name="latitude" value={latitude} />
      )}
      {longitude !== null && (
        <input type="hidden" name="longitude" value={longitude} />
      )}
      {selectedFishingArea && (
        <>
          <input type="hidden" name="fishingAreaId" value={selectedFishingArea.id} />
          {selectedFishingArea.id.startsWith('temp-') && (
            <>
              <input type="hidden" name="newAreaName" value={selectedFishingArea.name || ''} />
              <input type="hidden" name="newAreaDescription" value={selectedFishingArea.description || ''} />
            </>
          )}
        </>
      )}

      {/* Location Section */}
      <Paper sx={{ 
        p: 3, 
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(5px)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOn sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            釣り場の位置情報
          </Typography>
        </Box>
        
        {selectedFishingArea ? (
          <Box>
            <Alert 
              severity="success" 
              sx={{ 
                mb: 2,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  color: 'success.main'
                }
              }}
            >
              釣りエリアが選択されました！
            </Alert>
            <Box sx={{ mb: 2 }}>
              <Chip
                icon={<Check />}
                label={`📍 ${selectedFishingArea.name || '名前未設定'}`}
                color="primary"
                variant="filled"
                sx={{ fontWeight: 500, mr: 1, mb: 1 }}
              />
              <Chip
                label={`投稿数: ${selectedFishingArea.postCount}件`}
                color="default"
                variant="outlined"
                size="small"
                sx={{ fontWeight: 500 }}
              />
            </Box>
            {selectedFishingArea.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedFishingArea.description}
              </Typography>
            )}
            <Button
              type="button"
              variant="outlined"
              size="small"
              onClick={() => {
                setSelectedFishingArea(null)
                setLatitude(null)
                setLongitude(null)
                setLocationAddress('')
                // 地図上のハイライトも削除
                if (mapRef.current && mapRef.current.clearSelection) {
                  mapRef.current.clearSelection()
                }
              }}
            >
              選択を解除
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              🗺️ 地図から釣りエリアを選択または作成してください
            </Typography>
            
            {/* 現在の位置情報表示 */}
            {(latitude && longitude || isLoadingAddress) && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  📍 現在の位置:
                </Typography>
                {isLoadingAddress ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="text.secondary">
                      位置情報を取得中...
                    </Typography>
                  </Box>
                ) : locationAddress ? (
                  <Chip
                    icon={<Check />}
                    label={locationAddress}
                    color="primary"
                    variant="filled"
                    sx={{ fontWeight: 500 }}
                  />
                ) : null}
              </Box>
            )}
          </Box>
        )}
        
        {/* インタラクティブ地図 */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            🗺️ 地図から釣りエリアを選択
          </Typography>
          {/* 現在地が取得されるまで地図を表示しない */}
          {currentLocation ? (
            <InteractiveMap
              ref={mapRef}
              fishingAreas={localFishingAreas}
              height="400px"
              onAreaSelect={handleAreaSelect}
              onNewAreaCreate={handleNewAreaCreate}
              currentLocation={currentLocation}
            />
          ) : (
            <div style={{ 
              height: '400px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}>
              <div style={{ textAlign: 'center', color: '#666' }}>
                📍 現在地を取得中...
              </div>
            </div>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            💡 地図上の円をクリックして既存エリアを選択、または空いている場所をクリックして新しいエリアを作成できます
          </Typography>
        </Box>
        
        {locationError && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 2,
              borderRadius: 2
            }}
          >
            {locationError}
          </Alert>
        )}
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          🔒 位置情報はアプリ内でのみ使用され、他のアングラーが釣り場を見つけるのに役立ちます
        </Typography>
      </Paper>

      {/* エラーメッセージ表示 */}
      {state.message && (
        <Alert 
          severity={state.success ? 'success' : 'error'}
          sx={{ borderRadius: 2 }}
        >
          {state.message}
        </Alert>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Button
          type="submit"
          variant="contained"
          disabled={!isValid || isPending}
          startIcon={<Send />}
          size="large"
          sx={{ 
            flex: 1,
            py: 2,
            borderRadius: 3,
            fontWeight: 700,
            fontSize: '16px',
            background: isValid 
              ? 'linear-gradient(135deg, #0ea5e9, #14b8a6)'
              : 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
            boxShadow: isValid 
              ? '0 4px 12px rgba(14, 165, 233, 0.3)'
              : 'none',
            '&:hover': isValid ? {
              background: 'linear-gradient(135deg, #0284c7, #0d9488)',
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 16px rgba(14, 165, 233, 0.4)',
            } : {},
            transition: 'all 0.2s ease'
          }}
        >
          🎣 {isPending ? '投稿中...' : '投稿する'}
        </Button>
        
        <Button
          type="button"
          variant="outlined"
          startIcon={<Cancel />}
          size="large"
          sx={{ 
            flex: 1,
            py: 2,
            borderRadius: 3,
            fontWeight: 600,
            fontSize: '16px',
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'rgba(14, 165, 233, 0.1)',
              borderColor: 'primary.main'
            }
          }}
          onClick={() => window.history.back()}
        >
          キャンセル
        </Button>
      </Box>
    </Box>
  )
}