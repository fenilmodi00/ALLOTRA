import React, { memo, useMemo } from 'react'
import { Image, Pressable } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { Badge, BadgeText } from '@/components/ui/badge'
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
        return { action: 'success' as const, label: 'LIVE', hasDot: true, dotColor: '#22c55e', isBlinking: true }
      case 'UPCOMING':
        const daysUntil = getDaysUntilOpen()
        return { action: 'warning' as const, label: daysUntil || 'UPCOMING', hasDot: true, dotColor: '#eab308', isBlinking: false }
      case 'CLOSED':
        return { action: 'error' as const, label: 'CLOSED', hasDot: true, dotColor: '#ea580c', isBlinking: false }
      case 'LISTED':
        return { action: 'info' as const, label: 'LISTED', hasDot: true, dotColor: '#3b82f6', isBlinking: false }
      default:
        return { action: 'muted' as const, label: ipo.status, hasDot: false, dotColor: '#6b7280', isBlinking: false }
    }
  }, [ipo.status, ipo.dates])

  function getDaysUntilOpen(): string | null {
    if (!ipo.dates.open) return null
    const openDate = new Date(ipo.dates.open)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    openDate.setHours(0, 0, 0, 0)
    const diffTime = openDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays <= 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays <= 7) return `In ${diffDays} days`
    return `In ${Math.ceil(diffDays / 7)} weeks`
  }

  const opacity = useSharedValue(1)
  const scale = useSharedValue(1)
  const glowOpacity = useSharedValue(0.6)

  React.useEffect(() => {
    if (statusConfig.isBlinking) {
      opacity.value = withRepeat(
        withTiming(0.5, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
      scale.value = withRepeat(
        withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
      glowOpacity.value = withRepeat(
        withTiming(0.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    } else {
      opacity.value = 1
      scale.value = 1
      glowOpacity.value = 0.6
    }
  }, [statusConfig.isBlinking, opacity, scale, glowOpacity])

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: glowOpacity.value,
  }))

  const dotAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

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
      <Animated.View style={{
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      }}>
        {statusConfig.hasDot && (
          <Box style={{ position: 'relative', width: 10, height: 10, justifyContent: 'center', alignItems: 'center' }}>
            {/* Glow effect behind the dot */}
            {statusConfig.isBlinking && (
              <Animated.View style={[{
                position: 'absolute',
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: statusConfig.dotColor,
              }, glowAnimatedStyle]} />
            )}
            {/* The dot */}
            <Animated.View style={[{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: statusConfig.dotColor,
            }, dotAnimatedStyle]} />
          </Box>
        )}
        <Badge action={statusConfig.action} variant="solid" size="sm">
          <BadgeText bold>{statusConfig.label}</BadgeText>
        </Badge>
      </Animated.View>

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
