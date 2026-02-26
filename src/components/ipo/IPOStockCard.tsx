import React, { memo } from 'react'
import { Pressable } from 'react-native'
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
import { useIPOStatus } from '../../hooks/useIPOStatus'
import { CompanyLogo } from './CompanyLogo'

interface IPOStockCardProps {
  ipo: DisplayIPO
  onPress?: () => void
  onCheckStatus?: () => void
  showCheckButton?: boolean
}

export const IPOStockCard = memo(function IPOStockCard({
  ipo,
  onPress,
  onCheckStatus,
  showCheckButton = false,
}: IPOStockCardProps) {
  const {
    priceRange,
    gmpDisplay,
    statusConfig,
    liveStatusMeta,
    isLiveIPO
  } = useIPOStatus(ipo)

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

  const liveCloseLabel = isLiveIPO ? liveStatusMeta.label : null

  const CardContent = (
    // Figma node 1:6097: 176×160px, borderRadius:10, border:1 #e8e8e8, NO shadow/elevation
    <Box
      style={{
        backgroundColor: growwColors.surface,
        borderColor: '#e8e8e8',
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

      {/* Logo */}
      <Box style={{ position: 'absolute', top: 13, left: 14 }}>
        <CompanyLogo ipo={ipo} size={38} />
      </Box>

      {/* Text block */}
      <VStack style={{ position: 'absolute', left: 14, right: 14, top: 58 }}>
        <Text
          style={{ fontSize: 16, fontWeight: '500', color: '#000000', lineHeight: 21 }}
          numberOfLines={1}
        >
          {ipo.name}
        </Text>

        <Text
          style={{ fontSize: 15, fontWeight: '400', color: '#000000', lineHeight: 20, marginTop: 11 }}
        >
          {priceRange}
        </Text>

        {gmpDisplay ? (
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: gmpDisplay.isPositive ? '#00b386' : '#f35d5d',
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
