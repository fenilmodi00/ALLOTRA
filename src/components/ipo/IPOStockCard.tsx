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
import { growwColors } from '../../design-system/tokens/colors'
import type { DisplayIPO } from '../../types'
import { colors } from '../../design-system/tokens';

interface IPOStockCardProps {
  ipo: DisplayIPO
  onPress?: () => void
  onCheckStatus?: () => void
  showCheckButton?: boolean
}

/**
 * Squircle company logo — Figma node 1:6097: 38×38px, borderRadius:12.
 * Falls back to colored initials when no logoUrl.
 */
const CompanyLogo = ({ ipo, size = 38 }: { ipo: DisplayIPO; size?: number }) => {
  const initials = ipo.name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()

  const palette = [colors.contentLink, colors.contentAccent, colors.contentNegative, colors.contentWarning, '#9c27b0', '#2196f3']
  const bgColor = palette[ipo.name.charCodeAt(0) % palette.length] + '20'
  const textColor = palette[ipo.name.charCodeAt(0) % palette.length]

  if (ipo.logoUrl) {
    return (
      <Box
        style={{
          width: size,
          height: size,
          borderRadius: 12,
          backgroundColor: colors.backgroundTertiary,
          borderWidth: 1,
          borderColor: colors.borderLight,
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
        borderColor: colors.borderLight,
      }}
    >
      <Text style={{ fontSize: 14, fontWeight: '600', color: textColor }}>
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
      const sign = isPositive ? '+' : '-'
      return {
        text: `${sign}₹${Math.abs(ipo.gmp.value)} (${Math.abs(gainPercent).toFixed(1)}%)`,
        isPositive
      }
    }
    return null
  }, [ipo.gmp])

  function getDaysUntilClose(): string | null {
    if (!ipo.dates.close) return null
    const closeDate = new Date(ipo.dates.close)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    closeDate.setHours(0, 0, 0, 0)
    const diffTime = closeDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return null
    if (diffDays === 0) return 'Closes today'
    if (diffDays === 1) return 'Closes tomorrow'
    return `Closes in ${diffDays} days`
  }

  const liveStatusMeta = useMemo(() => {
    if (ipo.status.toUpperCase() !== 'LIVE') {
      return {
        isEffectivelyClosed: false,
        label: null as string | null,
        dotColor: '#22c55e',
        isBlinking: true,
      }
    }

    const now = new Date()
    const closeLabel = getDaysUntilClose()

    if (!ipo.dates.close) {
      return {
        isEffectivelyClosed: false,
        label: closeLabel,
        dotColor: '#22c55e',
        isBlinking: true,
      }
    }

    const closeDate = new Date(ipo.dates.close)
    closeDate.setHours(16, 0, 0, 0)

    const allotmentDate = ipo.dates.allotment ? new Date(ipo.dates.allotment) : null
    if (allotmentDate) {
      allotmentDate.setHours(0, 0, 0, 0)
    }

    const beforeAllotment = !allotmentDate || now < allotmentDate
    const isAfterCloseCutoff = now >= closeDate
    const isEffectivelyClosed = isAfterCloseCutoff && beforeAllotment

    if (isEffectivelyClosed) {
      return {
        isEffectivelyClosed: true,
        label: 'Closed',
        dotColor: '#dc2626',
        isBlinking: false,
      }
    }

    return {
      isEffectivelyClosed: false,
      label: closeLabel,
      dotColor: '#22c55e',
      isBlinking: true,
    }
  }, [ipo.status, ipo.dates])

  const statusConfig = useMemo(() => {
    const hasTimelineDates = !!ipo.dates.open || !!ipo.dates.close || !!ipo.dates.allotment || !!ipo.dates.listing

    switch (ipo.status.toUpperCase()) {
      case 'LIVE': {
        const closeLabel = liveStatusMeta.label
        return {
          label: closeLabel || 'LIVE',
          hasDot: true,
          dotColor: liveStatusMeta.dotColor,
          isBlinking: liveStatusMeta.isBlinking,
          bgColor: '#dcfce7',
          textColor: '#16a34a',
        }
      }
      case 'UPCOMING': {
        if (!ipo.dates.open) {
          return {
            label: 'TBA',
            hasDot: true,
            dotColor: '#94a3b8',
            isBlinking: false,
            bgColor: '#e2e8f0',
            textColor: '#334155',
          }
        }

        const daysUntil = getDaysUntilOpen()
        return { label: daysUntil || 'UPCOMING', hasDot: true, dotColor: '#eab308', isBlinking: false, bgColor: '#fef9c3', textColor: '#a16207' }
      }
      case 'CLOSED':
        return { label: 'CLOSED', hasDot: true, dotColor: '#ea580c', isBlinking: false, bgColor: '#fee2e2', textColor: '#dc2626' }
      case 'LISTED':
        return { label: 'LISTED', hasDot: true, dotColor: '#3b82f6', isBlinking: false, bgColor: '#dbeafe', textColor: '#2563eb' }
      case 'UNKNOWN':
        if (!hasTimelineDates) {
          return { label: 'TBA', hasDot: true, dotColor: '#94a3b8', isBlinking: false, bgColor: '#e2e8f0', textColor: '#334155' }
        }
        return { label: 'UPCOMING', hasDot: true, dotColor: '#eab308', isBlinking: false, bgColor: '#fef9c3', textColor: '#a16207' }
      default:
        return { label: ipo.status, hasDot: false, dotColor: '#6b7280', isBlinking: false, bgColor: '#f3f4f6', textColor: '#6b7280' }
    }
  }, [ipo.status, ipo.dates, liveStatusMeta])

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

  const isLiveIPO = ipo.status.toUpperCase() === 'LIVE'
  const liveCloseLabel = isLiveIPO ? liveStatusMeta.label : null

  const CardContent = (
    // Figma node 1:6097: 176×160px, borderRadius:10, border:1 #e8e8e8, NO shadow/elevation
    <Box
      style={{
        backgroundColor: growwColors.surface,
        borderColor: colors.borderLight,
        borderWidth: 1,
        borderRadius: 10,
        width: 176,
        height: showCheckButton ? 195 : 160,
        overflow: 'hidden',
      }}
    >
      {isLiveIPO ? (
        <>
          <Animated.View style={{
            position: 'absolute',
            top: 12,
            right: 14,
            zIndex: 1,
          }}>
            <Box style={{ position: 'relative', width: 12, height: 12, justifyContent: 'center', alignItems: 'center' }}>
              <Animated.View
                style={[{
                  position: 'absolute',
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: statusConfig.dotColor,
                  shadowColor: statusConfig.dotColor,
                  shadowOpacity: 0.4,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 0 },
                  elevation: 3,
                }, glowAnimatedStyle]}
              />
              <Animated.View
                style={[{
                  width: 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: statusConfig.dotColor,
                }, dotAnimatedStyle]}
              />
            </Box>
          </Animated.View>

          {liveCloseLabel ? (
            <Text
              style={{
                position: 'absolute',
                top: 28,
                right: 14,
                fontSize: 11,
                fontWeight: '500',
                color: liveStatusMeta.isEffectivelyClosed ? '#dc2626' : growwColors.textSecondary,
                textAlign: 'right',
                zIndex: 1,
              }}
            >
              {liveCloseLabel}
            </Text>
          ) : null}
        </>
      ) : (
        <Animated.View style={{
          position: 'absolute',
          top: 8,
          right: 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          zIndex: 1,
        }}>
          {statusConfig.hasDot && (
            <Box style={{ position: 'relative', width: 10, height: 10, justifyContent: 'center', alignItems: 'center' }}>
              {statusConfig.isBlinking && (
                <Animated.View style={[{
                  position: 'absolute',
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: statusConfig.dotColor,
                }, glowAnimatedStyle]} />
              )}
              <Animated.View style={[{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: statusConfig.dotColor,
              }, dotAnimatedStyle]} />
            </Box>
          )}
          <Animated.View style={{
            backgroundColor: statusConfig.bgColor,
            borderRadius: 4,
            paddingHorizontal: 6,
            paddingVertical: 2,
          }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: statusConfig.textColor, letterSpacing: 0.3 }}>
              {statusConfig.label}
            </Text>
          </Animated.View>
        </Animated.View>
      )}

      {/* Logo — Figma: left:14 top:13, 38×38, borderRadius:12 */}
      <Box style={{ position: 'absolute', top: 13, left: 14 }}>
        <CompanyLogo ipo={ipo} size={38} />
      </Box>

      {/* Text block — Figma absolute positions translated to paddingTop layout:
          name center ~68.5px → top ~58
          price center ~100px → ~32px gap
          change center ~124.5px → ~24px gap */}
      <VStack style={{ position: 'absolute', left: 14, right: 14, top: 58 }}>
        {/* Roboto Medium 16px — Figma: font-medium text-[16px] text-black */}
        <Text
          style={{ fontSize: 16, fontWeight: '500', color: colors.contentPrimary, lineHeight: 21 }}
          numberOfLines={1}
        >
          {ipo.name}
        </Text>

        {/* Roboto Regular 15px — Figma: font-normal text-[15px] text-black, ~top:100 */}
        <Text
          style={{ fontSize: 15, fontWeight: '400', color: colors.contentPrimary, lineHeight: 20, marginTop: 11 }}
        >
          {priceRange}
        </Text>

        {/* Roboto SemiBold 13px — Figma: font-semibold text-[13px], ~top:124.5 */}
        {gmpDisplay ? (
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: gmpDisplay.isPositive ? colors.contentAccent : colors.contentNegative,
              lineHeight: 18,
              marginTop: 5,
            }}
          >
            {gmpDisplay.text}
          </Text>
        ) : (
          <Text
            style={{ fontSize: 13, fontWeight: '600', color: growwColors.textSecondary, lineHeight: 18, marginTop: 5 }}
          >
            GMP N/A
          </Text>
        )}

        {showCheckButton && onCheckStatus && (
          <Pressable
            style={{
              backgroundColor: growwColors.primary,
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 6,
              marginTop: 8,
              alignItems: 'center',
            }}
            onPress={onCheckStatus}
          >
            <Text style={{ color: growwColors.textInverse, fontSize: 12, fontWeight: '500' }}>
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
