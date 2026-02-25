import { useMemo, useCallback } from 'react'
import type { DisplayIPO } from '../types'

type IPOStage = 'upcoming' | 'ongoing' | 'allotted' | 'listed'
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000

const normalizeStatus = (value?: string): string => {
  const status = (value || '').toUpperCase()
  if (status === 'ACTIVE' || status === 'ONGOING') return 'LIVE'
  return status
}

const extractDateKey = (value?: string): string | null => {
  if (!value) return null
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return null
  return `${match[1]}-${match[2]}-${match[3]}`
}

const toMarketUtcMs = (dateKey: string, hour = 0, minute = 0): number | null => {
  const match = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null

  const utcAsIfLocal = Date.UTC(year, month - 1, day, hour, minute, 0, 0)
  return utcAsIfLocal - IST_OFFSET_MS
}

const toValidDate = (value?: string): Date | null => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const startOfDay = (date: Date): Date => {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

const endOfDay = (date: Date): Date => {
  const value = new Date(date)
  value.setHours(23, 59, 59, 999)
  return value
}

const sortUpcomingWithTBAAtBottom = (ipos: DisplayIPO[]): DisplayIPO[] => {
  return [...ipos].sort((a, b) => {
    const aOpen = toValidDate(a.dates.open)
    const bOpen = toValidDate(b.dates.open)

    const aHasDate = !!aOpen
    const bHasDate = !!bOpen

    if (aHasDate && bHasDate) {
      return aOpen!.getTime() - bOpen!.getTime()
    }

    if (aHasDate && !bHasDate) return -1
    if (!aHasDate && bHasDate) return 1

    if (!a.name) return -1;
      if (!b.name) return 1;
      return a.name.localeCompare(b.name)
  })
}

const resolveIPOStage = (ipo: DisplayIPO, now: Date): IPOStage => {
  const openDateKey = extractDateKey(ipo.dates.open)
  const closeDateKey = extractDateKey(ipo.dates.close)
  const allotmentDateKey = extractDateKey(ipo.dates.allotment)
  const listingDateKey = extractDateKey(ipo.dates.listing)

  const openStartMs = openDateKey ? toMarketUtcMs(openDateKey, 0, 0) : null
  const closeCutoffMs = closeDateKey ? toMarketUtcMs(closeDateKey, 16, 0) : null
  const allotmentStartMs = allotmentDateKey ? toMarketUtcMs(allotmentDateKey, 0, 0) : null
  const listingStartMs = listingDateKey ? toMarketUtcMs(listingDateKey, 0, 0) : null

  const status = normalizeStatus(ipo.status)
  const nowMs = now.getTime()

  if (listingStartMs !== null && nowMs >= listingStartMs) {
    return 'listed'
  }

  if (status === 'LISTED') {
    return 'listed'
  }

  // User rule: UNKNOWN/TBA should be visible in Upcoming.
  if (status === 'UPCOMING' || status === 'UNKNOWN') {
    return 'upcoming'
  }

  if (allotmentStartMs !== null && nowMs >= allotmentStartMs) {
    return 'allotted'
  }

  // Upcoming should not leak into ongoing.
  if (openStartMs !== null && nowMs < openStartMs) {
    return 'upcoming'
  }

  // Ongoing should include close-day until 4 PM IST and closed-before-allotment.
  if (closeCutoffMs !== null) {
    if (nowMs <= closeCutoffMs) {
      return 'ongoing'
    }

    if (allotmentStartMs !== null && nowMs < allotmentStartMs) {
      return 'ongoing'
    }
  }

  if (status === 'LIVE' || status === 'CLOSED') {
    return 'ongoing'
  }

  return 'upcoming'
}

export const useIPOFiltering = (allIPOs: DisplayIPO[]) => {
  const ongoingIPOs = useMemo(() => {
    const now = new Date()
    return allIPOs.filter((ipo) => resolveIPOStage(ipo, now) === 'ongoing')
  }, [allIPOs])

  const upcomingIPOs = useMemo(() => {
    const now = new Date()
    const upcoming = allIPOs.filter((ipo) => resolveIPOStage(ipo, now) === 'upcoming')
    return sortUpcomingWithTBAAtBottom(upcoming)
  }, [allIPOs])

  const allottedIPOs = useMemo(() => {
    const now = new Date()
    return allIPOs.filter((ipo) => resolveIPOStage(ipo, now) === 'allotted')
  }, [allIPOs])

  const listedIPOs = useMemo(() => {
    const now = new Date()
    return allIPOs.filter((ipo) => resolveIPOStage(ipo, now) === 'listed')
  }, [allIPOs])

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
    getIPOsForFilter,
  }
}
