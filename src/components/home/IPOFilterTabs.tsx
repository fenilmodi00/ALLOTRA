import React, { useCallback, useMemo, useRef, useEffect } from 'react'
import { FlatList, useWindowDimensions, ViewToken } from 'react-native'
import Animated, { useAnimatedStyle, withTiming, useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated'
import { Box } from '@/components/ui/box'
import { IPOFilterNav } from '../common/IPOFilterNav'
import { IPOSection } from '../ipo'
import type { DisplayIPO } from '../../types'

interface IPOFilterTabsProps {
  filters: string[]
  activeFilter: string
  onFilterChange: (filter: string) => void
  getIPOsForFilter: (filter: string) => DisplayIPO[]
  onIPOPress: (ipo: DisplayIPO) => void
  onCheckStatus: (ipo: DisplayIPO) => void
  loading: boolean
}

const FILTER_TITLES: Record<string, string> = {
  ongoing: 'Live IPOs',
  upcoming: 'Upcoming IPOs',
  allotted: 'Closed IPOs',
  listed: 'Listed IPOs'
}

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)

export const IPOFilterTabs = ({
  filters,
  activeFilter,
  onFilterChange,
  getIPOsForFilter,
  onIPOPress,
  onCheckStatus,
  loading
}: IPOFilterTabsProps) => {
  const { width } = useWindowDimensions()
  const flatListRef = useRef<FlatList>(null)
  const isTabPress = useRef(false)
  const lastActiveFilter = useRef(activeFilter)

  const scrollX = useSharedValue(Math.max(0, filters.indexOf(activeFilter)) * width)

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x
    }
  })

  const calculateEstimatedHeight = useCallback((filter: string) => {
    const ipos = getIPOsForFilter(filter)

    // When loading and no data, we show 4 skeletons (2 rows)
    if (loading && ipos.length === 0) {
      const cardHeight = 160
      const gap = 12
      const titleHeight = 40
      return titleHeight + (3 * cardHeight) + gap + 40
    }

    if (ipos.length === 0) {
      return 120
    }

    const displayCount = ipos.length
    const rows = Math.ceil(displayCount / 2)
    // Allotted cards have a check button making them taller (195px) vs standard cards (160px)
    const cardHeight = filter === 'allotted' ? 195 : 160
    const gap = 12
    const titleHeight = 40

    // Total height calculation considering padding and gaps 
    // Increased bottom padding to 40 to avoid any overlap issues with the last card
    return titleHeight + (rows * cardHeight) + ((rows - 1) * gap) + 40
  }, [getIPOsForFilter, loading])

  const activeFilterHeight = useMemo(() => {
    return calculateEstimatedHeight(activeFilter)
  }, [activeFilter, calculateEstimatedHeight])

  const animatedHeightStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(activeFilterHeight, { duration: 300 })
    }
  }, [activeFilterHeight])

  // Sync external activeFilter changes to the FlatList (e.g., initial load or manual state change)
  useEffect(() => {
    if (!isTabPress.current && lastActiveFilter.current !== activeFilter) {
      const index = filters.indexOf(activeFilter)
      if (index !== -1 && flatListRef.current) {
        flatListRef.current.scrollToIndex({ index, animated: true })
      }
    }
    lastActiveFilter.current = activeFilter
  }, [activeFilter, filters])

  const handleTabChange = useCallback((tab: string) => {
    if (tab === activeFilter) return

    isTabPress.current = true
    onFilterChange(tab)
    lastActiveFilter.current = tab

    const index = filters.indexOf(tab)
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true })
    }

    // Re-enable viewability tracking after animation completes
    setTimeout(() => {
      isTabPress.current = false
    }, 500)
  }, [activeFilter, onFilterChange, filters])

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (!isTabPress.current && viewableItems.length > 0) {
      const newActiveFilter = viewableItems[0].item as string
      if (newActiveFilter !== lastActiveFilter.current) {
        lastActiveFilter.current = newActiveFilter
        onFilterChange(newActiveFilter)
      }
    }
  }).current

  const renderItem = useCallback(({ item: filter }: { item: string }) => {
    const activeIPOs = getIPOsForFilter(filter)
    const countLabel = !loading || activeIPOs.length > 0 ? ` (${activeIPOs.length})` : ''
    const title = `${FILTER_TITLES[filter] || 'IPOs'}${countLabel}`

    return (
      <Box style={{ width, paddingHorizontal: 20 }}>
        <IPOSection
          title={title}
          ipos={activeIPOs}
          onIPOPress={onIPOPress}
          onCheckStatus={filter === 'allotted' ? onCheckStatus : undefined}
          showCheckButton={filter === 'allotted'}
          sectionKey={filter}
          loading={loading}
        />
      </Box>
    )
  }, [width, getIPOsForFilter, loading, onIPOPress, onCheckStatus])

  return (
    <Box>
      <IPOFilterNav
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={handleTabChange}
        scrollX={scrollX}
      />

      <Animated.View style={[{ overflow: 'hidden' }, animatedHeightStyle]}>
        <AnimatedFlatList
          ref={flatListRef as any}
          data={filters}
          keyExtractor={(item: unknown) => item as string}
          renderItem={renderItem as any}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={scrollHandler}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          initialScrollIndex={Math.max(0, filters.indexOf(activeFilter))}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          // Disable clipping so shadows aren't cut off inside the item container
          removeClippedSubviews={false}
        />
      </Animated.View>
    </Box>
  )
}
