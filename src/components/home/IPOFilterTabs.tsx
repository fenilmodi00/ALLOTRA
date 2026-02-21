import React, { useRef, useCallback, useMemo, useEffect } from 'react'
import { Dimensions, NativeSyntheticEvent, NativeScrollEvent, Animated } from 'react-native'
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
  const scrollX = useRef(new Animated.Value(0)).current
  const isProgrammaticScroll = useRef(false)

  const calculateEstimatedHeight = useCallback((filter: string) => {
    const ipos = getIPOsForFilter(filter)
    const isExpanded = showMoreIPOs[filter] || false
    
    if (ipos.length === 0) {
      return 120
    }
    
    const displayCount = isExpanded ? Math.min(ipos.length, 20) : Math.min(ipos.length, 10)
    const rows = Math.ceil(displayCount / 2)
    const cardHeight = 171
    const gap = 12
    const titleHeight = 40
    const showMoreButton = ipos.length > 10 ? 60 : 0
    
    return titleHeight + (rows * cardHeight) + ((rows - 1) * gap) + showMoreButton + 20
  }, [getIPOsForFilter, showMoreIPOs])

  const activeFilterHeight = useMemo(() => {
    return calculateEstimatedHeight(activeFilter)
  }, [activeFilter, calculateEstimatedHeight])

  useEffect(() => {
    const index = filters.indexOf(activeFilter)
    if (index !== -1) {
      isProgrammaticScroll.current = true
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ 
          x: index * SCREEN_WIDTH, 
          animated: true 
        })
      }
      setTimeout(() => {
        isProgrammaticScroll.current = false
      }, 400)
    }
  }, [activeFilter, filters])

  const handleTabChange = useCallback((tab: string) => {
    onFilterChange(tab)
  }, [onFilterChange])

  const handleMomentumScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isProgrammaticScroll.current) return
    
    const contentOffsetX = e.nativeEvent.contentOffset.x
    const index = Math.round(contentOffsetX / SCREEN_WIDTH)
    const tab = filters[index]
    if (tab && tab !== activeFilter) {
      onFilterChange(tab)
    }
  }, [filters, activeFilter, onFilterChange])

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
            minHeight: activeFilterHeight
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
      
      <Box style={{ height: activeFilterHeight }}>
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          contentContainerStyle={{
            flexDirection: 'row'
          }}
          style={{
            flexGrow: 0
          }}
        >
          {renderAllPages}
        </Animated.ScrollView>
      </Box>
    </Box>
  )
}
