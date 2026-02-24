import React, { useCallback, useMemo } from 'react'
import { Box } from '@/components/ui/box'
import { IPOFilterNav } from '../common/IPOFilterNav'
import { IPOSection } from '../ipo'
import type { DisplayIPO } from '../../types'

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

  const handleTabChange = useCallback((tab: string) => {
    onFilterChange(tab)
  }, [onFilterChange])

  const activeIPOs = getIPOsForFilter(activeFilter)
  const countLabel = !loading || activeIPOs.length > 0 ? ` (${activeIPOs.length})` : ''
  const title = `${FILTER_TITLES[activeFilter] || 'IPOs'}${countLabel}`

  return (
    <Box>
      <IPOFilterNav
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={handleTabChange}
      />
      
      <Box style={{ minHeight: activeFilterHeight, paddingHorizontal: 20 }}>
        <IPOSection
          title={title}
          ipos={activeIPOs}
          showMore={showMoreIPOs[activeFilter] || false}
          onToggleShowMore={() => onToggleShowMore(activeFilter)}
          onIPOPress={onIPOPress}
          onCheckStatus={activeFilter === 'allotted' ? onCheckStatus : undefined}
          showCheckButton={activeFilter === 'allotted'}
          sectionKey={activeFilter}
          loading={loading}
        />
      </Box>
    </Box>
  )
}
