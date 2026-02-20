import React, { useRef, useCallback, useMemo, useEffect } from 'react'
import { Dimensions, NativeSyntheticEvent, NativeScrollEvent, ScrollView } from 'react-native'
import { Box } from '@/components/ui/box'
import { IPOFilterNav } from '../common/IPOFilterNav'
import { IPOSection } from '../ipo'
import { LoadingText } from '../ui'
import type { DisplayIPO } from '../../types'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface IPOFilterTabsProps {
  filters: string[]
  activeFilter: string
  onFilterChange: (filter: string) => void
  getIPOsForFilter: (filter: string) => DisplayIPO[]
  showMoreIPOs: { [key: string]: boolean }
  onToggleShowMore: (filter: string) => void
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

export const IPOFilterTabs = ({
  filters,
  activeFilter,
  onFilterChange,
  getIPOsForFilter,
  showMoreIPOs,
  onToggleShowMore,
  onIPOPress,
  onCheckStatus,
  loading
}: IPOFilterTabsProps) => {
  const scrollViewRef = useRef<any>(null)

  // Calculate estimated height for each filter based on content
  const calculateEstimatedHeight = useCallback((filter: string) => {
    const ipos = getIPOsForFilter(filter)
    const isExpanded = showMoreIPOs[filter] || false
    
    if (ipos.length === 0) {
      return 120 // Title + empty state box
    }
    
    const displayCount = isExpanded ? Math.min(ipos.length, 20) : Math.min(ipos.length, 10)
    const rows = Math.ceil(displayCount / 2) // 2 cards per row
    const cardHeight = 171 // IPO card height
    const gap = 12 // Gap between cards
    const titleHeight = 40 // Title height
    const showMoreButton = ipos.length > 10 ? 60 : 0 // Show more button
    
    return titleHeight + (rows * cardHeight) + ((rows - 1) * gap) + showMoreButton + 20 // padding
  }, [getIPOsForFilter, showMoreIPOs])

  // Get current active filter's estimated height
  const activeFilterHeight = useMemo(() => {
    return calculateEstimatedHeight(activeFilter)
  }, [activeFilter, calculateEstimatedHeight])

  // Sync ScrollView position with active filter
  useEffect(() => {
    const index = filters.indexOf(activeFilter)
    if (index !== -1 && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: false })
      }, 100)
    }
  }, [activeFilter, filters])

  const handleTabChange = useCallback((tab: string) => {
    onFilterChange(tab)
    const index = filters.indexOf(tab)
    if (index !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: index * SCREEN_WIDTH, animated: true })
    }
  }, [filters, onFilterChange])

  const onMomentumScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x
    const index = Math.round(contentOffsetX / SCREEN_WIDTH)
    const tab = filters[index]
    if (tab && tab !== activeFilter) {
      onFilterChange(tab)
    }
  }, [filters, activeFilter, onFilterChange])

  // Render all filter pages for swipe functionality
  const renderAllPages = useMemo(() => {
    return filters.map((filter) => {
      const ipos = getIPOsForFilter(filter)
      const title = `${FILTER_TITLES[filter]} (${ipos.length})`
      
      return (
        <Box 
          key={filter}
          style={{ 
            width: SCREEN_WIDTH, 
            paddingHorizontal: 20,
            minHeight: activeFilterHeight // Use dynamic height
          }}
        >
          <IPOSection
            title={title}
            ipos={ipos}
            showMore={showMoreIPOs[filter] || false}
            onToggleShowMore={() => onToggleShowMore(filter)}
            onIPOPress={onIPOPress}
            onCheckStatus={filter === 'allotted' ? onCheckStatus : undefined}
            showCheckButton={filter === 'allotted'}
            sectionKey={filter}
          />
        </Box>
      )
    })
  }, [filters, getIPOsForFilter, showMoreIPOs, onToggleShowMore, onIPOPress, onCheckStatus, activeFilterHeight])

  if (loading) {
    return <LoadingText message="Loading IPO data..." />
  }

  return (
    <Box>
      <IPOFilterNav
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={handleTabChange}
      />
      
      {/* Horizontal ScrollView with dynamic height */}
      <Box style={{ height: activeFilterHeight }}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          scrollEventThrottle={16}
          contentContainerStyle={{
            flexDirection: 'row'
          }}
          style={{
            flexGrow: 0
          }}
        >
          {renderAllPages}
        </ScrollView>
      </Box>
    </Box>
  )
}
