'use client'

import { useState, useEffect } from 'react'
import { Chip } from '@mui/material'
import { LocationOn } from '@mui/icons-material'
import { reverseGeocode } from '@/lib/geocoding'

type LocationDisplayProps = {
  latitude: number
  longitude: number
  address?: string
}

export const LocationDisplay = ({ latitude, longitude, address }: LocationDisplayProps) => {
  const [displayText, setDisplayText] = useState<string>(
    address || `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`
  )
  const [isLoading, setIsLoading] = useState(!address)

  useEffect(() => {
    if (!address) {
      const loadAddress = async () => {
        setIsLoading(true)
        const resolvedAddress = await reverseGeocode(latitude, longitude)
        setDisplayText(resolvedAddress)
        setIsLoading(false)
      }
      loadAddress()
    }
  }, [latitude, longitude, address])

  return (
    <Chip
      icon={<LocationOn sx={{ fontSize: 16 }} />}
      label={isLoading ? '住所を取得中...' : displayText}
      size="small"
      variant="filled"
      sx={{ 
        bgcolor: 'rgba(14, 165, 233, 0.1)',
        color: 'primary.main',
        fontWeight: 500,
        '& .MuiChip-icon': { color: 'primary.main' }
      }}
    />
  )
}