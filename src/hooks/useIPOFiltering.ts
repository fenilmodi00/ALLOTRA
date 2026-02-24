import { useMemo, useCallback } from 'react'
import type { DisplayIPO } from '../types'

export const useIPOFiltering = (allIPOs: DisplayIPO[]) => {
  const now = useMemo(() => new Date(), [])

  const openDateFor = (ipo: DisplayIPO) => (ipo.dates.open ? new Date(ipo.dates.open) : null)
  const closeDateFor = (ipo: DisplayIPO) => (ipo.dates.close ? new Date(ipo.dates.close) : null)
  const allotDateFor = (ipo: DisplayIPO) => (ipo.dates.allotment ? new Date(ipo.dates.allotment) : null)

  // Ongoing: currently live or within open..close window or allotment not yet reached
  const ongoingIPOs = useMemo(() => {
    return allIPOs.filter((ipo) => {
      if (ipo.status === 'LIVE') return true
      const openDate = openDateFor(ipo)
      const closeDate = closeDateFor(ipo)
      const allotDate = allotDateFor(ipo)

      if (openDate && closeDate) {
        if (now >= openDate && now <= closeDate) return true
      }
      if (allotDate && now < allotDate) return true
      if (closeDate && now <= closeDate) return true
      return false
    })
  }, [allIPOs, now])

  const upcomingIPOs = useMemo(() => {
    return allIPOs.filter((ipo) => {
      if (ipo.status === 'UPCOMING') return true
      const openDate = openDateFor(ipo)
      if (openDate && now < openDate) return true
      return false
    })
  }, [allIPOs, now])

  // Allotted: allotment date has passed (moved from 'closed' to 'allotted')
  const allottedIPOs = useMemo(() => {
    return allIPOs.filter((ipo) => {
      const allotDate = allotDateFor(ipo)
      return !!allotDate && now >= allotDate
    })
  }, [allIPOs, now])

  // Listed: listing date in the past or status LISTED
  const listedIPOs = useMemo(() => {
    return allIPOs.filter((ipo) => {
      const listingDate = ipo.dates.listing ? new Date(ipo.dates.listing) : null
      if (ipo.status === 'LISTED') return true
      if (listingDate) return now >= listingDate
      return false
    })
  }, [allIPOs, now])

  const getIPOsForFilter = useCallback((filter: string): DisplayIPO[] => {
    switch (filter) {
      case 'ongoing': return ongoingIPOs
      case 'upcoming': return upcomingIPOs
      case 'allotted': return allottedIPOs
      case 'listed': return listedIPOs
      default: return ongoingIPOs
    }
  }, [ongoingIPOs, upcomingIPOs, allottedIPOs, listedIPOs])

  return {
    ongoingIPOs,
    upcomingIPOs,
    allottedIPOs,
    listedIPOs,
    getIPOsForFilter
  }
}
