import React, { memo, useEffect, useMemo, useRef } from 'react'
import { StyleSheet } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { growwColors } from '../../design-system/tokens/colors'
import { formatPercentage } from '../../utils/formatters'

interface IndexCardProps {
  indexName: string
  value: number
  change: number
  changePercent: number
  isPositive: boolean
}

/**
 * Split two formatted strings into a common stable prefix and changed suffix.
 * e.g. "21,453.95" vs "21,457.30" → prefix "21,45", suffix "3.95" / "7.30"
 */
function splitAtChange(prev: string, next: string): { prefix: string; suffix: string } {
  let i = 0
  const minLen = Math.min(prev.length, next.length)
  while (i < minLen && prev[i] === next[i]) {
    i++
  }
  // Walk back to not split mid-digit-group for readability
  while (i > 0 && /[0-9]/.test(next[i - 1] ?? '')) {
    i--
  }
  return { prefix: next.slice(0, i), suffix: next.slice(i) }
}

// Internal animated suffix — only this re-renders and animates on price change
const AnimatedSuffix = memo(function AnimatedSuffix({
  suffix,
  isPositive,
  style,
}: {
  suffix: string
  isPositive: boolean
  style: object
}) {
  const translateY = useSharedValue(0)
  const opacity = useSharedValue(1)
  const prevSuffix = useRef(suffix)

  useEffect(() => {
    if (suffix === prevSuffix.current) return
    prevSuffix.current = suffix

    translateY.value = withSequence(
      withTiming(isPositive ? -5 : 5, { duration: 80 }),
      withTiming(0, { duration: 200, easing: Easing.out(Easing.cubic) })
    )
    opacity.value = withSequence(
      withTiming(0.5, { duration: 80 }),
      withTiming(1, { duration: 200 })
    )
  }, [suffix, isPositive, translateY, opacity])

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <Animated.Text style={[style, animStyle]}>
      {suffix}
    </Animated.Text>
  )
})

export const IndexCard = memo(function IndexCard({
  indexName,
  value,
  change,
  changePercent,
  isPositive,
}: IndexCardProps) {
  const prevFormattedRef = useRef<string | null>(null)

  const formattedValue = useMemo(
    () => value.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
    [value]
  )

  const { prefix, suffix } = useMemo(() => {
    const prev = prevFormattedRef.current ?? formattedValue
    const result = splitAtChange(prev, formattedValue)
    prevFormattedRef.current = formattedValue
    return result
  }, [formattedValue])

  const formattedChange = useMemo(() => {
    const sign = isPositive ? '+' : ''
    return `${sign}${Math.abs(change).toFixed(2)}`
  }, [change, isPositive])

  const formattedPercent = useMemo(
    () => `(${isPositive ? '+' : ''}${Math.abs(changePercent).toFixed(2)}%)`,
    [changePercent, isPositive]
  )

  const changeColor = isPositive ? growwColors.success : growwColors.error

  return (
    <Box
      style={styles.card}
      accessibilityRole="text"
      accessibilityLabel={`${indexName}, ${formattedValue}, ${isPositive ? 'up' : 'down'} ${formatPercentage(changePercent)}`}
    >
      <VStack style={styles.content}>
        {/* Index name — never changes, zero re-render cost */}
        <Text style={styles.indexName} numberOfLines={1}>
          {indexName}
        </Text>

        {/* Value row: stable prefix + animated suffix side by side */}
        <Box style={styles.valueRow}>
          {/* Stable prefix characters — not animated */}
          <Text style={styles.indexValue} numberOfLines={1}>
            {prefix}
            <AnimatedSuffix
              suffix={suffix}
              isPositive={isPositive}
              style={styles.indexValue}
            />
          </Text>

          {/* Change and percent — animate together as one unit */}
          <AnimatedSuffix
            suffix={`  ${formattedChange} ${formattedPercent}`}
            isPositive={isPositive}
            style={[styles.changeValue, { color: changeColor }]}
          />
        </Box>
      </VStack>
    </Box>
  )
})

const styles = StyleSheet.create({
  card: {
    backgroundColor: growwColors.surface,
    borderColor: growwColors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flex: 1,
    height: 68,
    justifyContent: 'center',
  },
  content: {
    gap: 3,
  },
  indexName: {
    fontSize: 13,
    fontWeight: '500',
    color: growwColors.text,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  indexValue: {
    fontSize: 13,
    fontWeight: '400',
    color: growwColors.text,
  },
  changeValue: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
})
