import React from 'react'
import { Image } from 'react-native'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import type { DisplayIPO } from '../../types'

interface CompanyLogoProps {
  ipo: DisplayIPO
  size?: number
}

/**
 * Squircle company logo — Figma node 1:6097: 38×38px, borderRadius:12.
 * Falls back to colored initials when no logoUrl.
 */
export const CompanyLogo = ({ ipo, size = 38 }: CompanyLogoProps) => {
  const initials = ipo.name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()

  const palette = ['#4e5acc', '#00b386', '#f35d5d', '#ffb900', '#9c27b0', '#2196f3']
  const bgColor = palette[ipo.name.charCodeAt(0) % palette.length] + '20'
  const textColor = palette[ipo.name.charCodeAt(0) % palette.length]

  if (ipo.logoUrl) {
    return (
      <Box
        style={{
          width: size,
          height: size,
          borderRadius: 12,
          backgroundColor: '#f8f9fa',
          borderWidth: 1,
          borderColor: '#e8e8e8',
          overflow: 'hidden',
        }}
      >
        <Image
          source={{ uri: ipo.logoUrl }}
          style={{ width: size, height: size, borderRadius: 12 }}
          resizeMode="contain"
          onError={() => {
            if (__DEV__) console.log('Failed to load logo for:', ipo.name)
          }}
        />
      </Box>
    )
  }

  return (
    <Box
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        backgroundColor: bgColor,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e8e8e8',
      }}
    >
      <Text style={{ fontSize: 14, fontWeight: '600', color: textColor }}>
        {initials}
      </Text>
    </Box>
  )
}
