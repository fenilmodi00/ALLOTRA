import React, { memo, useMemo } from 'react'
import { Image, Pressable } from 'react-native'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { growwColors } from '../../design-system/tokens/colors'
import type { DisplayIPO } from '../../types'

interface IPOStockCardProps {
  ipo: DisplayIPO
  onPress?: () => void
  onCheckStatus?: () => void
  showCheckButton?: boolean
}

// Company logo component - shows real logo from API or fallback to initials
const CompanyLogo = ({ ipo, size = 60 }: { ipo: DisplayIPO; size?: number }) => {
  const initials = ipo.name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()

  // Generate consistent color based on name
  const colors = ['#4e5acc', '#00b386', '#f35d5d', '#ffb900', '#9c27b0', '#2196f3']
  const colorIndex = ipo.name.charCodeAt(0) % colors.length
  const bgColor = colors[colorIndex] + '20' // 20% opacity
  const textColor = colors[colorIndex]

  // If we have a logo URL, show the image
  if (ipo.logoUrl) {
    return (
      <Box
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#f8f9fa',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <Image
          source={{ uri: ipo.logoUrl }}
          style={{
            width: size * 0.8, // Slightly smaller than container
            height: size * 0.8,
            borderRadius: (size * 0.8) / 2,
          }}
          resizeMode="contain"
          onError={() => {
            console.log('❌ Failed to load logo for:', ipo.name)
          }}
        />
      </Box>
    )
  }

  // Fallback to initials
  return (
    <Box
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bgColor,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: size > 50 ? 20 : 14,
          fontWeight: 'bold',
          color: textColor,
          fontFamily: 'Inter',
        }}
      >
        {initials}
      </Text>
    </Box>
  )
}

export const IPOStockCard = memo(function IPOStockCard({
  ipo,
  onPress,
  onCheckStatus,
  showCheckButton = false,
}: IPOStockCardProps) {
  const priceRange = useMemo(() => {
    if (ipo.priceRange.min && ipo.priceRange.max) {
      if (ipo.priceRange.min === ipo.priceRange.max) {
        return `₹${ipo.priceRange.min}`
      }
      return `₹${ipo.priceRange.min}-${ipo.priceRange.max}`
    }
    return 'Price TBA'
  }, [ipo.priceRange])

  const gmpDisplay = useMemo(() => {
    if (ipo.gmp && ipo.gmp.value !== undefined) {
      const isPositive = ipo.gmp.value >= 0
      const gainPercent = ipo.gmp.gainPercent || 0
      return {
        text: `${isPositive ? '+' : ''}₹${Math.abs(ipo.gmp.value)} (${isPositive ? '+' : ''}${gainPercent.toFixed(1)}%)`,
        isPositive
      }
    }
    return null
  }, [ipo.gmp])

  const statusConfig = useMemo(() => {
    switch (ipo.status) {
      case 'LIVE':
        return { color: '#f35d5d', bgColor: '#ffe5e5', label: 'CLOSED' } // Red for closed/live
      case 'UPCOMING':
        return { color: '#757575', bgColor: '#f5f5f5', label: 'UNKNOWN' }
      case 'CLOSED':
        return { color: '#f35d5d', bgColor: '#ffe5e5', label: 'CLOSED' }
      case 'LISTED':
        return { color: '#4e5acc', bgColor: '#eef0ff', label: 'LISTED' }
      default:
        return { color: '#757575', bgColor: '#f5f5f5', label: ipo.status }
    }
  }, [ipo.status])

  // Truncate name to fit card
  const displayName = useMemo(() => {
    const maxLength = 12
    if (ipo.name.length > maxLength) {
      return ipo.name.substring(0, maxLength) + '...'
    }
    return ipo.name
  }, [ipo.name])

  const CardContent = (
    <Box
      style={{
        backgroundColor: growwColors.surface,
        borderColor: '#d2cdcd',
        borderWidth: 1,
        borderRadius: 13,
        padding: 12,
        width: 171,
        height: showCheckButton ? 195 : 171, // Slightly taller when check button is shown
      }}
    >
      {/* Status Badge - Top Right */}
      <Box
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          backgroundColor: statusConfig.bgColor,
          borderRadius: 4,
          paddingHorizontal: 8,
          paddingVertical: 3,
        }}
      >
        <Text 
          style={{
            fontSize: 10,
            fontWeight: 'bold',
            color: statusConfig.color,
            fontFamily: 'Inter',
          }}
        >
          {statusConfig.label}
        </Text>
      </Box>

      {/* Company Logo */}
      <Box style={{ marginTop: 4 }}>
        <CompanyLogo ipo={ipo} size={60} />
      </Box>

      {/* IPO Info - Bottom Section */}
      <VStack style={{ marginTop: 'auto', gap: 2 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '500',
            color: growwColors.text,
            fontFamily: 'Inter',
          }}
          numberOfLines={1}
        >
          {displayName}
        </Text>

        <Text
          style={{
            fontSize: 15,
            fontWeight: 'bold',
            color: growwColors.text,
            fontFamily: 'Inter',
          }}
        >
          {priceRange}
        </Text>

        {gmpDisplay ? (
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: gmpDisplay.isPositive ? growwColors.success : growwColors.error,
              fontFamily: 'Inter',
            }}
          >
            {gmpDisplay.text}
          </Text>
        ) : (
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: growwColors.textSecondary,
              fontFamily: 'Inter',
            }}
          >
            +₹0(+0.0%)
          </Text>
        )}

        {/* Check Status Button for Allotted IPOs */}
        {showCheckButton && onCheckStatus && (
          <Pressable
            style={{
              backgroundColor: growwColors.primary,
              borderRadius: 6,
              paddingHorizontal: 12,
              paddingVertical: 6,
              marginTop: 4,
              alignItems: 'center',
            }}
            onPress={onCheckStatus}
          >
            <Text
              style={{
                color: growwColors.textInverse,
                fontSize: 12,
                fontWeight: 'bold',
                fontFamily: 'Inter',
              }}
            >
              Check
            </Text>
          </Pressable>
        )}
      </VStack>
    </Box>
  )

  if (onPress) {
    return (
      <Pressable 
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${ipo.name} IPO, ${priceRange}, ${ipo.status}`}
      >
        {CardContent}
      </Pressable>
    )
  }

  return CardContent
})
