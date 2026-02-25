import React, { memo, useMemo } from 'react'
import { Pressable, Image as RNImage } from 'react-native'
import { devLog } from '../../utils/logger'
import { Box } from '@/components/ui/box'
import { HStack } from '@/components/ui/hstack'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { growwColors } from '../../design-system/tokens/colors'
import type { DisplayIPO } from '../../types'

interface IPOCardProps {
  ipo: DisplayIPO
  onCheckStatus?: () => void
  onPress?: () => void
}

const getStatusConfig = (status: string) => {
  switch (status.toUpperCase()) {
    case 'LIVE':
      return { color: growwColors.ipoLive, bg: growwColors.ipoLiveBg, label: 'LIVE' }
    case 'UPCOMING':
      return { color: growwColors.ipoUpcoming, bg: growwColors.ipoUpcomingBg, label: 'UPCOMING' }
    case 'CLOSED':
      return { color: growwColors.ipoClosed, bg: growwColors.ipoClosedBg, label: 'CLOSED' }
    case 'LISTED':
      return { color: growwColors.ipoAllotment, bg: growwColors.ipoAllotmentBg, label: 'LISTED' }
    default:
      return { color: growwColors.textSecondary, bg: growwColors.backgroundSecondary, label: status }
  }
}

// Company logo component - shows real logo from API or fallback to initials
// Logo uses squircle shape (borderRadius: 12) matching Groww Figma design
const CompanyLogo = ({ ipo, size = 38 }: { ipo: DisplayIPO; size?: number }) => {
  const initials = ipo.name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()

  // If we have a logo URL, show the image
  if (ipo.logoUrl) {
    return (
      <Box
        style={{
          width: size,
          height: size,
          borderRadius: 12,
          backgroundColor: '#f8f9fa',
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: growwColors.border,
          overflow: 'hidden',
        }}
      >
        <RNImage
          source={{ uri: ipo.logoUrl }}
          style={{
            width: size,
            height: size,
            borderRadius: 12,
          }}
          resizeMode="contain"
          onError={() => {
            devLog('Failed to load logo for:', ipo.name)
          }}
        />
      </Box>
    )
  }

  // Fallback to initials with squircle shape
  return (
    <Box
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        backgroundColor: growwColors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: growwColors.border,
      }}
    >
      <Text
        style={{ fontSize: 14, fontWeight: '600', color: growwColors.primary }}
      >
        {initials}
      </Text>
    </Box>
  )
}

export const IPOCard = memo(function IPOCard({ 
  ipo,
  onCheckStatus,
  onPress,
}: IPOCardProps) {
  const statusConfig = useMemo(() => getStatusConfig(ipo.status), [ipo.status])
  const isGmpPositive = (ipo.gmp?.value ?? 0) >= 0
  const gmpSign = isGmpPositive ? '+' : '-'
  
  const priceRange = useMemo(() => {
    if (ipo.priceRange.min && ipo.priceRange.max) {
      if (ipo.priceRange.min === ipo.priceRange.max) {
        return `₹${ipo.priceRange.min}`
      }
      return `₹${ipo.priceRange.min} - ₹${ipo.priceRange.max}`
    }
    return 'Price not available'
  }, [ipo.priceRange])

  const dates = useMemo(() => {
    if (ipo.dates.open && ipo.dates.close) {
      const openDate = new Date(ipo.dates.open).toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short' 
      })
      const closeDate = new Date(ipo.dates.close).toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short' 
      })
      return `${openDate} - ${closeDate}`
    }
    return 'Dates not available'
  }, [ipo.dates])

  const CardContent = (
    // Flat card matching Groww Figma design: borderRadius 10, 1px border, no shadow
    <Box
      style={{
        backgroundColor: growwColors.surface,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: growwColors.border,
        padding: 16,
        marginBottom: 12,
      }}
    >
      {/* Header with Logo and Company Name */}
      <HStack style={{ alignItems: 'flex-start', marginBottom: 12, gap: 12 }}>
        <CompanyLogo ipo={ipo} size={38} />
        
        <VStack style={{ flex: 1, gap: 4 }}>
          <HStack style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <VStack style={{ flex: 1, marginRight: 8 }}>
              {/* Roboto Medium 16px - matches Figma font-['Roboto:Medium'] */}
              <Text 
                style={{ fontSize: 16, fontWeight: '500', color: growwColors.text }}
                numberOfLines={1}
              >
                {ipo.name}
              </Text>
              {/* Roboto Regular 12px for secondary info */}
              <Text style={{ fontSize: 12, fontWeight: '400', color: growwColors.textSecondary, marginTop: 2 }}>
                {dates}
              </Text>
            </VStack>

            <Box 
              style={{
                backgroundColor: statusConfig.color,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 4,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '600', color: growwColors.textInverse }}>
                {statusConfig.label}
              </Text>
            </Box>
          </HStack>
        </VStack>
      </HStack>

      {/* GMP Section */}
      {ipo.gmp && ipo.gmp.value !== undefined && (
        <HStack style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <VStack>
            {/* Roboto Regular 12px label */}
            <Text style={{ fontSize: 12, fontWeight: '400', color: growwColors.textSecondary }}>
              GMP
            </Text>
            {/* Roboto SemiBold 13px value - matches Figma font-['Roboto:SemiBold'] */}
              <Text 
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: isGmpPositive ? growwColors.success : growwColors.error,
                }}
              >
                {gmpSign}₹{Math.abs(ipo.gmp.value)}
              </Text>
            </VStack>
          
          {ipo.gmp.gainPercent !== undefined && (
            <VStack style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 12, fontWeight: '400', color: growwColors.textSecondary }}>
                Expected Gain
              </Text>
              <Text 
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: isGmpPositive ? growwColors.success : growwColors.error,
                }}
              >
                {Math.abs(ipo.gmp.gainPercent).toFixed(2)}%
              </Text>
            </VStack>
          )}
        </HStack>
      )}

      {/* Footer with Price Range and Action Button */}
      <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <VStack>
          <Text style={{ fontSize: 12, fontWeight: '400', color: growwColors.textSecondary }}>
            Price Range
          </Text>
          {/* Roboto Regular 15px for price value */}
          <Text style={{ fontSize: 15, fontWeight: '400', color: growwColors.text, marginTop: 2 }}>
            {priceRange}
          </Text>
        </VStack>

        {onCheckStatus && (
          <Pressable
            style={{
              backgroundColor: growwColors.primary,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
            }}
            onPress={onCheckStatus}
            accessibilityRole="button"
            accessibilityLabel={`Check allotment status for ${ipo.name}`}
          >
            <Text style={{ color: growwColors.textInverse, fontWeight: '500', fontSize: 13 }}>
              Check
            </Text>
          </Pressable>
        )}
      </HStack>
    </Box>
  )

  if (onPress) {
    return (
      <Pressable 
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`View details for ${ipo.name} IPO`}
      >
        {CardContent}
      </Pressable>
    )
  }

  return CardContent
})
