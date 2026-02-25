import React, { useEffect, useRef } from 'react'
import { Animated, View, ViewStyle } from 'react-native'
import { growwColors } from '../../../design-system/tokens/colors'

interface SkeletonProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: ViewStyle
}

export const Skeleton = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  style,
}: SkeletonProps) => {
  const animatedValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [animatedValue])

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  })

  return (
    <Animated.View
      style={[
        {
          width: typeof width === 'string' ? (width as `${number}%`) : width,
          height,
          borderRadius,
          backgroundColor: growwColors.skeleton,
          opacity,
        },
        style,
      ]}
    />
  )
}

// Pre-built skeleton variants
export const SkeletonText = ({ lines = 1, width = '100%' }: { lines?: number; width?: number | string }) => (
  <View style={{ gap: 8 }}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        height={14} 
        width={i === lines - 1 && lines > 1 ? '70%' : width} 
      />
    ))}
  </View>
)

export const SkeletonAvatar = ({ size = 40 }: { size?: number }) => (
  <Skeleton width={size} height={size} borderRadius={size / 2} />
)

export const SkeletonCard = () => (
  <View
    style={{
      backgroundColor: growwColors.surface,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: growwColors.border,
      gap: 12,
    }}
  >
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <View style={{ flex: 1, gap: 8 }}>
        <Skeleton height={18} width="60%" />
        <Skeleton height={12} width="40%" />
      </View>
      <Skeleton height={24} width={80} borderRadius={6} />
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View style={{ gap: 4 }}>
        <Skeleton height={10} width={60} />
        <Skeleton height={16} width={100} />
      </View>
      <Skeleton height={36} width={70} borderRadius={8} />
    </View>
  </View>
)

export const SkeletonIPOList = ({ count = 3 }: { count?: number }) => (
  <View style={{ gap: 16 }}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </View>
)

export const SkeletonIndexCard = () => (
  <View
    style={{
      backgroundColor: growwColors.surface,
      borderColor: growwColors.border,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      height: 68,
      justifyContent: 'center',
    }}
  >
    <View style={{ gap: 3 }}>
      <Skeleton height={13} width={60} />
      <Skeleton height={13} width={100} />
    </View>
  </View>
)
