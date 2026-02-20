import { useMemo, useCallback } from 'react'
import type { DisplayIPO } from '../types'

export const useIPOFiltering = (allIPOs: DisplayIPO[]) => {
  const now = useMemo(() => new Date(), [])
  
  const ongoingIPOs = useMemo(() => {
    return allIPOs.filter(ipo => {
      const openDate = ipo.dates.open ? new Date(ipo.dates.open) : null
      const closeDate = ipo.dates.close ? new Date(ipo.dates.close) : null
      
      // IPO is ongoing if:
      // 1. Status is LIVE, OR
      // 2. Open date is in past and close date is in future, OR
      // 3. Status is CLOSED but close date is today or in future
      if (ipo.status === 'LIVE') return true
      
      if (openDate && closeDate) {
        return now >= openDate && now <= closeDate
      }
      
      // Fallback: if dates are not clear, use status
      return ipo.status === 'CLOSED' && (!closeDate || closeDate >= now)
    })
  }, [allIPOs, now])
  
  const upcomingIPOs = useMemo(() => {
    return allIPOs.filter(ipo => {
      const openDate = ipo.dates.open ? new Date(ipo.dates.open) : null
      
      // IPO is upcoming if:
      // 1. Status is UPCOMING, OR
      // 2. Open date is in future
      if (ipo.status === 'UPCOMING') return true
      
      if (openDate) {
        return now < openDate
      }
      
      return false
    })
  }, [allIPOs, now])
  
  const closedIPOs = useMemo(() => {
    return allIPOs.filter(ipo => {
      const closeDate = ipo.dates.close ? new Date(ipo.dates.close) : null
      const listingDate = ipo.dates.listing ? new Date(ipo.dates.listing) : null
      
      // IPO is closed/allotted if:
      // 1. Close date is in past but listing date is in future, OR
      // 2. Status is CLOSED and close date is in past, OR
      // 3. Close date is in past and no listing date yet
      if (closeDate && listingDate) {
        return now > closeDate && now < listingDate
      }
      
      if (closeDate && now > closeDate) {
        return ipo.status === 'CLOSED' || !listingDate
      }
      
      return ipo.status === 'CLOSED' && closeDate && now > closeDate
    })
  }, [allIPOs, now])
  
  const listedIPOs = useMemo(() => {
    return allIPOs.filter(ipo => {
      const listingDate = ipo.dates.listing ? new Date(ipo.dates.listing) : null
      
      // IPO is listed if:
      // 1. Status is LISTED, OR
      // 2. Listing date is in past
      if (ipo.status === 'LISTED') return true
      
      if (listingDate) {
        return now >= listingDate
      }
      
      return false
    })
  }, [allIPOs, now])

  const getIPOsForFilter = useCallback((filter: string): DisplayIPO[] => {
    switch (filter) {
      case 'ongoing': return ongoingIPOs
      case 'upcoming': return upcomingIPOs
      case 'allotted': return closedIPOs
      case 'listed': return listedIPOs
      default: return ongoingIPOs
    }
  }, [ongoingIPOs, upcomingIPOs, closedIPOs, listedIPOs])

  return {
    ongoingIPOs,
    upcomingIPOs,
    closedIPOs,
    listedIPOs,
    getIPOsForFilter
  }
}