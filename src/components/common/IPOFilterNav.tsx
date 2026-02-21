import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Pressable, ScrollView, Animated, Dimensions, View, StyleSheet, LayoutChangeEvent } from 'react-native'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'

interface IPOFilterNavProps {
  filters: string[]
  activeFilter: string
  onFilterChange: (filter: string) => void
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const filterLabels: Record<string, string> = {
  ongoing: 'Ongoing',
  upcoming: 'Upcoming',
  allotted: 'Allotted',
  listed: 'Listed',
}

export const IPOFilterNav = ({ filters, activeFilter, onFilterChange }: IPOFilterNavProps) => {
  const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>([])
  const scrollViewRef = useRef<ScrollView>(null)
  
  const indicatorTranslateX = useRef(new Animated.Value(0)).current
  const indicatorScaleX = useRef(new Animated.Value(1)).current
  const baseWidth = 90

  const activeIndex = filters.indexOf(activeFilter)

  useEffect(() => {
    const layout = tabLayouts[activeIndex]
    if (!layout) return

    const scaleX = layout.width / baseWidth
    const translateX = layout.x + (layout.width - baseWidth) / 2

    Animated.parallel([
      Animated.spring(indicatorTranslateX, {
        toValue: translateX,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
      }),
      Animated.spring(indicatorScaleX, {
        toValue: scaleX,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
      }),
    ]).start()

    const scrollViewWidth = SCREEN_WIDTH - 40
    const centerX = layout.x + layout.width / 2
    const targetScroll = Math.max(0, centerX - scrollViewWidth / 2)
    scrollViewRef.current?.scrollTo({ x: targetScroll, animated: true })
  }, [activeIndex, tabLayouts, indicatorTranslateX, indicatorScaleX])

  const handleTabLayout = useCallback((index: number, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout
    setTabLayouts(prev => {
      const newLayouts = [...prev]
      newLayouts[index] = { x, width }
      return newLayouts
    })
  }, [])

  const handlePress = useCallback((filter: string) => {
    onFilterChange(filter)
  }, [onFilterChange])

  return (
    <Box style={{ marginBottom: 16, height: 44, justifyContent: 'center' }}>
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
      >
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.indicator,
              {
                width: baseWidth,
                transform: [
                  { translateX: indicatorTranslateX },
                  { scaleX: indicatorScaleX },
                ],
              },
            ]}
          />
          {filters.map((filter, index) => {
            const isActive = activeFilter === filter
            return (
              <Pressable
                key={filter}
                onPress={() => handlePress(filter)}
                onLayout={(e) => handleTabLayout(index, e)}
                style={styles.tab}
              >
                <Text
                  style={[
                    styles.tabText,
                    isActive && styles.activeTabText,
                  ]}
                >
                  {filterLabels[filter] || filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </ScrollView>
    </Box>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'relative',
    height: 40,
    gap: 10,
  },
  indicator: {
    position: 'absolute',
    height: 40,
    backgroundColor: '#4e5acc',
    borderRadius: 20,
    top: 0,
    left: 0,
  },
  tab: {
    height: 40,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 85,
    zIndex: 1,
  },
  tabText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    includeFontPadding: false,
  },
  activeTabText: {
    fontWeight: '700',
    color: '#ffffff',
  },
})
