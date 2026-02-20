import React, { memo, useMemo } from 'react'
import { Pressable } from 'react-native'
import { Image as RNImage } from 'react-native'
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

const getStatusConfig = (status: DisplayIPO['status']) => {
  switch (status) {
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
const CompanyLogo = ({ ipo, size = 48 }: { ipo: DisplayIPO; size?: number }) => {
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
          borderRadius: size / 2,
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
            width: size * 0.8,
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
        backgroundColor: growwColors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: growwColors.border,
      }}
    >
      <Text
        style={{ fontSize: size > 40 ? 16 : 12, fontWeight: '700', color: growwColors.primary }}
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
    <Box
      style={{
        backgroundColor: growwColors.surface,
        borderRadius: 13,
        borderWidth: 1,
        borderColor: growwColors.border,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      {/* Header with Logo and Company Name */}
      <HStack style={{ alignItems: 'flex-start', marginBottom: 12, gap: 12 }}>
        <CompanyLogo ipo={ipo} size={48} />
        
        <VStack style={{ flex: 1, gap: 4 }}>
          <HStack style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <VStack style={{ flex: 1, marginRight: 8 }}>
              <Text 
                style={{ fontSize: 16, fontWeight: '700', color: growwColors.text }}
                numberOfLines={1}
              >
                {ipo.name}
              </Text>
              <Text style={{ fontSize: 12, color: growwColors.textSecondary, marginTop: 2 }}>
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
              <Text style={{ fontSize: 10, fontWeight: '700', color: growwColors.textInverse }}>
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
            <Text style={{ fontSize: 12, color: growwColors.textSecondary }}>
              GMP
            </Text>
            <Text 
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: ipo.gmp.value >= 0 ? growwColors.success : growwColors.error,
              }}
            >
              {ipo.gmp.value >= 0 ? '+' : ''}₹{ipo.gmp.value}
            </Text>
          </VStack>
          
          {ipo.gmp.gainPercent !== undefined && (
            <VStack style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 12, color: growwColors.textSecondary }}>
                Expected Gain
              </Text>
              <Text 
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: ipo.gmp.gainPercent >= 0 ? growwColors.success : growwColors.error,
                }}
              >
                {ipo.gmp.gainPercent >= 0 ? '+' : ''} {ipo.gmp.gainPercent.toFixed(2)}%
              </Text>
            </VStack>
          )}
        </HStack>
      )}

      {/* Footer with Price Range and Action Button */}
      <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <VStack>
          <Text style={{ fontSize: 12, color: growwColors.textSecondary }}>
            Price Range
          </Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: growwColors.text, marginTop: 2 }}>
            {priceRange}
          </Text>
        </VStack>

        {onCheckStatus && (
          <Pressable
            style={{
              backgroundColor: growwColors.primary,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 6,
            }}
            onPress={onCheckStatus}
            accessibilityRole="button"
            accessibilityLabel={`Check allotment status for ${ipo.name}`}
          >
            <Text style={{ color: growwColors.textInverse, fontWeight: '600', fontSize: 13 }}>
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
