import React, { useCallback, useState } from 'react'
import { Pressable, StyleSheet, View, LayoutChangeEvent, Text as RNText, useWindowDimensions } from 'react-native'
import Animated, {
  useAnimatedStyle,
  withTiming,
  SharedValue,
  interpolate,
  Extrapolation,
  useAnimatedRef,
  useAnimatedReaction,
  scrollTo
} from 'react-native-reanimated'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { colors } from '../../design-system/tokens';

interface IPOFilterNavProps {
  filters: string[]
  activeFilter: string
  onFilterChange: (filter: string) => void
  scrollX: SharedValue<number>
}

const filterLabels: Record<string, string> = {
  ongoing: 'Ongoing',
  upcoming: 'Upcoming',
  allotted: 'Allotted',
  listed: 'Listed',
}

interface TabLayout {
  x: number
  width: number
}

const AnimatedText = Animated.createAnimatedComponent(RNText)

const TabLabel = ({ index, scrollX, width, text }: { index: number; scrollX: SharedValue<number>; width: number; text: string }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(scrollX.value - (index * width))
    const isActive = distance < width / 2

    // We animate both color and fontWeight to make the active tab text bold
    return {
      color: withTiming(isActive ? colors.backgroundPrimary : colors.contentSecondary, { duration: 150 }),
      fontWeight: isActive ? '700' : '500' // fontWeight isn't truly animatable in RN, but it switches instantly here perfectly
    } as any // cast needed because reanimated types for fontWeight are strict
  }, [index, width])

  return (
    <AnimatedText style={[styles.tabText, animatedStyle]}>
      {text}
    </AnimatedText>
  )
}

export const IPOFilterNav = ({ filters, activeFilter, onFilterChange, scrollX }: IPOFilterNavProps) => {
  const [tabLayouts, setTabLayouts] = useState<Record<string, TabLayout>>({})
  const [contentWidth, setContentWidth] = useState(0)
  const { width: screenWidth } = useWindowDimensions()
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>()

  const handlePress = useCallback((filter: string) => {
    onFilterChange(filter)
  }, [onFilterChange])

  const handleTabLayout = useCallback((filter: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout
    setTabLayouts((prev) => {
      if (prev[filter]?.x === x && prev[filter]?.width === width) {
        return prev
      }
      return {
        ...prev,
        [filter]: { x, width }
      }
    })
  }, [])

  // Continuously sync the top TabBar scroll position based on the bottom FlatList's swipe position
  useAnimatedReaction(
    () => {
      const hasAllLayouts = filters.every(f => tabLayouts[f] !== undefined)
      if (!hasAllLayouts || contentWidth === 0 || filters.length === 0) return -1

      // How far the top tab bar is allowed to scroll in total
      const maxScroll = Math.max(0, contentWidth - screenWidth)

      // If content isn't wide enough to scroll, don't scroll
      if (maxScroll <= 0) return 0

      // The 0..width..2width values from FlatList
      const inputRange = filters.map((_, i) => i * screenWidth)

      // Map them to ideal centered positions in the TabBar
      const outputRange = filters.map(f => {
        const layout = tabLayouts[f]
        // In the updated layout, the first tab is at x=0 (padding is on container). 
        // We still want to center it against screenWidth/2.
        const absoluteX = layout.x + 20
        // Find the center of the tab and center it on screen
        const idealX = absoluteX + layout.width / 2 - screenWidth / 2
        // Ensure it doesn't bounce past edges
        return Math.max(0, Math.min(idealX, maxScroll))
      })

      return interpolate(
        scrollX.value,
        inputRange,
        outputRange,
        Extrapolation.CLAMP
      )
    },
    (targetOffset) => {
      if (targetOffset !== -1 && scrollViewRef.current) {
        // Synchronously scroll on the UI thread without animation 
        // because the interpolated value is already animating 1:1 with user swipe
        scrollTo(scrollViewRef, targetOffset, 0, false)
      }
    },
    [tabLayouts, contentWidth, screenWidth, filters]
  )

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const hasAllLayouts = filters.every(f => tabLayouts[f] !== undefined)

    if (!hasAllLayouts || filters.length === 0) {
      return { opacity: 0 }
    }

    const inputRange = filters.map((_, i) => i * screenWidth)
    const extInputRange = [-screenWidth, ...inputRange, inputRange[inputRange.length - 1] + screenWidth]

    const outputRangeWidths = filters.map(f => tabLayouts[f].width)
    const extOutputRangeWidths = [outputRangeWidths[0], ...outputRangeWidths, outputRangeWidths[outputRangeWidths.length - 1]]

    const outputRangeXs = filters.map(f => tabLayouts[f].x)
    const extOutputRangeXs = [
      outputRangeXs[0] - screenWidth * 0.1,
      ...outputRangeXs,
      outputRangeXs[outputRangeXs.length - 1] + screenWidth * 0.1
    ]

    const width = interpolate(
      scrollX.value,
      extInputRange,
      extOutputRangeWidths,
      Extrapolation.CLAMP
    )

    const translateX = interpolate(
      scrollX.value,
      extInputRange,
      extOutputRangeXs,
      Extrapolation.EXTEND
    )

    return {
      opacity: 1,
      width,
      transform: [{ translateX }],
    }
  }, [tabLayouts, screenWidth, filters])

  return (
    <Box style={{ marginBottom: 16, height: 44, justifyContent: 'center' }}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onContentSizeChange={(w) => setContentWidth(w)}
      >
        <View style={styles.container}>
          {/* Layer 1: Inactive Backgrounds + Layout Measurement */}
          {filters.map((filter) => (
            <View
              key={`bg-${filter}`}
              onLayout={(e) => handleTabLayout(filter, e)}
              style={styles.inactiveBg}
            >
              {/* Render with bold weight to ensure the container is wide enough for the bold text later */}
              <RNText style={[styles.tabText, { fontWeight: '700', opacity: 0 }]}>
                {filterLabels[filter] || filter.charAt(0).toUpperCase() + filter.slice(1)}
              </RNText>
            </View>
          ))}

          {/* Layer 2: Sliding Active Background */}
          <Animated.View style={[styles.activeIndicator, animatedIndicatorStyle]} />

          {/* Layer 3: Touch targets and text */}
          <View style={[StyleSheet.absoluteFill, { flexDirection: 'row', gap: 10 }]}>
            {filters.map((filter, index) => {
              const label = filterLabels[filter] || filter.charAt(0).toUpperCase() + filter.slice(1)
              return (
                <Pressable
                  key={`btn-${filter}`}
                  onPress={() => handlePress(filter)}
                  style={styles.pressableTab}
                >
                  <TabLabel
                    index={index}
                    scrollX={scrollX}
                    width={screenWidth}
                    text={label}
                  />
                </Pressable>
              )
            })}
          </View>
        </View>
      </Animated.ScrollView>
    </Box>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  container: {
    flexDirection: 'row',
    height: 40,
    gap: 10,
    position: 'relative',
  },
  inactiveBg: {
    height: 40,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 85,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
  },
  activeIndicator: {
    position: 'absolute',
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.contentLink,
    top: 0,
    left: 0,
  },
  pressableTab: {
    height: 40,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 85,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  tabText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.contentSecondary,
    textAlign: 'center',
    includeFontPadding: false,
  },
  activeTabText: {
    fontWeight: '700',
    color: colors.backgroundPrimary,
  },
})
