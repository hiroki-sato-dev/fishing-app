'use client'

import { useState, useEffect, useRef } from 'react'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { createPost } from '../actions/createPost'
import { generatePresignedUrl } from '../actions/generatePresignedUrl'
import { convertToWebP } from '@/lib/imageUtils'
import { reverseGeocode } from '@/lib/geocoding'
import {
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  LinearProgress,
} from '@mui/material'
import { Send, AddPhotoAlternate, Close } from '@mui/icons-material'
import { InteractiveMap } from '@/components/InteractiveMap'
import type { FishingArea } from '@/types/fishing-area'

const MAX_IMAGES = 4
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']


type ImageItem = {
  file: File
  blob: Blob
  previewUrl: string | null
  uploadedUrl: string | null
  status: 'pending' | 'uploading' | 'done' | 'error'
  error: string | null
}

type PostFormClientProps = {
  fishingAreas: FishingArea[]
}

export const PostFormClient = ({ fishingAreas }: PostFormClientProps) => {
  const router = useRouter()
  const mapRef = useRef<{ clearSelection?: () => void }>(null)
  const [state, formAction, isPending] = useActionState(createPost, {
    success: false,
    message: '',
  })

  const [content, setContent] = useState('')
  const [images, setImages] = useState<ImageItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [locationError, setLocationError] = useState<string>('')
  const [selectedFishingArea, setSelectedFishingArea] = useState<FishingArea | null>(null)
  const [localFishingAreas, setLocalFishingAreas] = useState<FishingArea[]>(fishingAreas)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)

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

          setIsLoadingAddress(true)
          try {
            const address = await reverseGeocode(location.lat, location.lng)
            setLocationAddress(address)
          } catch {
            // エラー時は住所なしで続行
          } finally {
            setIsLoadingAddress(false)
          }
        },
        () => {
          // エラーは表示せず、手動取得を促す
        },
        { timeout: 10000, enableHighAccuracy: false }
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return
    const remaining = MAX_IMAGES - images.length
    const selected = Array.from(files).slice(0, remaining)

    for (let i = 0; i < selected.length; i++) {
      const file = selected[i]

      if (!ALLOWED_TYPES.includes(file.type)) {
        setImages((prev) => [...prev, {
          file, blob: file, previewUrl: null, uploadedUrl: null,
          status: 'error', error: '対応していない形式です（JPEG・PNG・WebP・HEIC）',
        }])
        continue
      }

      let blob: Blob
      let previewUrl: string | null
      try {
        blob = await convertToWebP(file)
        previewUrl = URL.createObjectURL(blob)
      } catch {
        setImages((prev) => [...prev, {
          file, blob: file, previewUrl: null, uploadedUrl: null,
          status: 'error', error: '画像の変換に失敗しました',
        }])
        continue
      }

      const index = images.length + i
      setImages((prev) => [...prev, {
        file, blob, previewUrl, uploadedUrl: null, status: 'uploading', error: null,
      }])

      const result = await generatePresignedUrl(blob.type, blob.size, 'posts')
      if (!result.success) {
        setImages((prev) =>
          prev.map((img, idx) => idx === index ? { ...img, status: 'error', error: result.message } : img)
        )
        continue
      }

      try {
        const res = await fetch(result.uploadUrl, {
          method: 'PUT',
          body: blob,
          headers: { 'Content-Type': blob.type },
        })
        if (!res.ok) throw new Error('アップロードに失敗しました')
        setImages((prev) =>
          prev.map((img, idx) =>
            idx === index ? { ...img, status: 'done', uploadedUrl: result.publicUrl } : img
          )
        )
      } catch {
        setImages((prev) =>
          prev.map((img, idx) =>
            idx === index ? { ...img, status: 'error', error: 'アップロードに失敗しました' } : img
          )
        )
      }
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const item = prev[index]
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  const isUploading = images.some((img) => img.status === 'uploading')
  const uploadedUrls = images.filter((img) => img.status === 'done' && img.uploadedUrl).map((img) => img.uploadedUrl!)

  const isValid = !!content.trim() && content.length <= 256 && !isUploading

  const handleAreaSelect = async (area: FishingArea) => {
    setSelectedFishingArea(area)
    setLatitude(area.centerLat)
    setLongitude(area.centerLng)
    setLocationError('')

    setIsLoadingAddress(true)
    try {
      const address = await reverseGeocode(area.centerLat, area.centerLng)
      setLocationAddress(address)
    } catch {
      setLocationAddress('')
    } finally {
      setIsLoadingAddress(false)
    }
  }

  const handleNewAreaCreate = async (areaData: { name?: string; centerLat: number; centerLng: number; radius: number; description?: string }) => {
    try {
      const tempArea: FishingArea = {
        id: 'temp-' + Date.now(),
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

      setSelectedFishingArea(tempArea)
      setLatitude(tempArea.centerLat)
      setLongitude(tempArea.centerLng)
      setLocationError('')

      setIsLoadingAddress(true)
      try {
        const address = await reverseGeocode(tempArea.centerLat, tempArea.centerLng)
        setLocationAddress(address)
      } catch {
        // エラー時は住所なしで続行
      } finally {
        setIsLoadingAddress(false)
      }
    } catch {
      setLocationError('エリアの準備に失敗しました')
    }
  }

  return (
    <Box component="form" action={formAction} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Content Section */}
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          釣果の内容
        </Typography>
        <TextField
          name="content"
          label="今日の釣果はいかがでしたか？"
          multiline
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="釣った魚の種類、使用した道具、天候など"
          required
          fullWidth
          variant="outlined"
          error={content.length > 256 || !!(state.errors?.content)}
          helperText={
            state.errors?.content?.[0] ||
            `${content.length}/256文字${content.length > 256 ? '（文字数制限を超過）' : ''}`
          }
          sx={{ '& .MuiOutlinedInput-root': { fontSize: '16px' } }}
        />
      </Box>

      {/* Image Section */}
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          写真（任意・最大{MAX_IMAGES}枚）
        </Typography>

        {images.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
            {images.map((img, idx) => (
              <Box
                key={idx}
                sx={{
                  position: 'relative',
                  width: { xs: 80, sm: 100 },
                  height: { xs: 80, sm: 100 },
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: img.status === 'error' ? 'error.main' : 'divider',
                  bgcolor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {img.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.previewUrl}
                    alt={`画像 ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <AddPhotoAlternate sx={{ color: 'text.secondary', fontSize: 40 }} />
                )}

                {img.status === 'uploading' && (
                  <Box sx={{
                    position: 'absolute', inset: 0,
                    bgcolor: 'rgba(0,0,0,0.4)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 0.5,
                  }}>
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                    <LinearProgress sx={{ width: '80%' }} />
                  </Box>
                )}

                {img.status === 'error' && (
                  <Box sx={{
                    position: 'absolute', inset: 0,
                    bgcolor: 'rgba(211,47,47,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Typography variant="caption" color="error" sx={{ textAlign: 'center', px: 0.5, fontSize: 10 }}>
                      {img.error}
                    </Typography>
                  </Box>
                )}

                <IconButton
                  size="small"
                  onClick={() => removeImage(idx)}
                  sx={{
                    position: 'absolute', top: 2, right: 2,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    p: 0.25,
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                  }}
                >
                  <Close sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        {images.length < MAX_IMAGES && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e.target.files)}
              onClick={(e) => { (e.target as HTMLInputElement).value = '' }}
            />
            <Button
              type="button"
              variant="outlined"
              startIcon={<AddPhotoAlternate />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ borderStyle: 'dashed' }}
            >
              写真を選択 ({images.length}/{MAX_IMAGES})
            </Button>
          </>
        )}

        {state.errors?.imageUrls && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {state.errors.imageUrls[0]}
          </Alert>
        )}

        {uploadedUrls.map((url, idx) => (
          <input key={idx} type="hidden" name="imageUrls" value={url} />
        ))}
      </Box>

      {/* Hidden inputs */}
      {latitude !== null && <input type="hidden" name="latitude" value={latitude} />}
      {longitude !== null && <input type="hidden" name="longitude" value={longitude} />}
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
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          釣り場（任意）
        </Typography>

        {selectedFishingArea ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label={selectedFishingArea.name || '名前未設定'}
              color="primary"
              variant="outlined"
              size="small"
              onDelete={() => {
                setSelectedFishingArea(null)
                setLatitude(null)
                setLongitude(null)
                setLocationAddress('')
                mapRef.current?.clearSelection?.()
              }}
            />
            {isLoadingAddress ? (
              <CircularProgress size={14} />
            ) : locationAddress ? (
              <Typography variant="caption" color="text.secondary">{locationAddress}</Typography>
            ) : null}
          </Box>
        ) : (
          <Box sx={{ mb: 2 }}>
            {isLoadingAddress ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={14} />
                <Typography variant="caption" color="text.secondary">位置情報を取得中...</Typography>
              </Box>
            ) : locationAddress ? (
              <Typography variant="caption" color="text.secondary">{locationAddress}</Typography>
            ) : null}
          </Box>
        )}

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
          <Box sx={{
            height: 400,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid', borderColor: 'divider',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
              <CircularProgress size={16} />
              <Typography variant="body2">現在地を取得中...</Typography>
            </Box>
          </Box>
        )}

        {locationError && (
          <Alert severity="error" sx={{ mt: 1.5 }}>{locationError}</Alert>
        )}
      </Box>

      {state.message && (
        <Alert severity={state.success ? 'success' : 'error'}>
          {state.message}
        </Alert>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, pt: 1 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={!isValid || isPending}
          startIcon={<Send />}
          size="large"
          sx={{ flex: 1 }}
        >
          {isPending ? '投稿中...' : '投稿する'}
        </Button>

        <Button
          type="button"
          variant="outlined"
          size="large"
          sx={{ flex: 1 }}
          onClick={() => window.history.back()}
        >
          キャンセル
        </Button>
      </Box>
    </Box>
  )
}
