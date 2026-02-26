import { useMemo } from 'react'
import type { DisplayIPO } from '../types'
import { growwColors } from '../design-system/tokens/colors'

export interface IPOStatusConfig {
  label: string
  hasDot: boolean
  dotColor: string
  isBlinking: boolean
  bgColor: string
  textColor: string
}

export const useIPOStatus = (ipo: DisplayIPO) => {
  const priceRange = useMemo(() => {
    if (ipo.priceRange.min && ipo.priceRange.max) {
      if (ipo.priceRange.min === ipo.priceRange.max) {
        return `₹${ipo.priceRange.min}`
      }
      return `₹${ipo.priceRange.min}-${ipo.priceRange.max}`
    }
    return 'Price TBA'
  }, [ipo.priceRange])

  const gmpDisplay = useMemo(() => {
    if (ipo.gmp && ipo.gmp.value !== undefined) {
      const isPositive = ipo.gmp.value >= 0
      const gainPercent = ipo.gmp.gainPercent || 0
      const sign = isPositive ? '+' : '-'
      return {
        text: `${sign}₹${Math.abs(ipo.gmp.value)} (${Math.abs(gainPercent).toFixed(1)}%)`,
        isPositive
      }
    }
    return null
  }, [ipo.gmp])

  const getDaysUntilClose = (): string | null => {
    if (!ipo.dates.close) return null
    const closeDate = new Date(ipo.dates.close)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    closeDate.setHours(0, 0, 0, 0)
    const diffTime = closeDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return null
    if (diffDays === 0) return 'Closes today'
    if (diffDays === 1) return 'Closes tomorrow'
    return `Closes in ${diffDays} days`
  }

  const getDaysUntilOpen = (): string | null => {
    if (!ipo.dates.open) return null
    const openDate = new Date(ipo.dates.open)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    openDate.setHours(0, 0, 0, 0)
    const diffTime = openDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays <= 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays <= 7) return `In ${diffDays} days`
    return `In ${Math.ceil(diffDays / 7)} weeks`
  }

  const liveStatusMeta = useMemo(() => {
    if (ipo.status.toUpperCase() !== 'LIVE') {
      return {
        isEffectivelyClosed: false,
        label: null as string | null,
        dotColor: '#22c55e',
        isBlinking: true,
      }
    }

    const now = new Date()
    const closeLabel = getDaysUntilClose()

    if (!ipo.dates.close) {
      return {
        isEffectivelyClosed: false,
        label: closeLabel,
        dotColor: '#22c55e',
        isBlinking: true,
      }
    }

    const closeDate = new Date(ipo.dates.close)
    closeDate.setHours(16, 0, 0, 0)

    const allotmentDate = ipo.dates.allotment ? new Date(ipo.dates.allotment) : null
    if (allotmentDate) {
      allotmentDate.setHours(0, 0, 0, 0)
    }

    const beforeAllotment = !allotmentDate || now < allotmentDate
    const isAfterCloseCutoff = now >= closeDate
    const isEffectivelyClosed = isAfterCloseCutoff && beforeAllotment

    if (isEffectivelyClosed) {
      return {
        isEffectivelyClosed: true,
        label: 'Closed',
        dotColor: '#dc2626',
        isBlinking: false,
      }
    }

    return {
      isEffectivelyClosed: false,
      label: closeLabel,
      dotColor: '#22c55e',
      isBlinking: true,
    }
  }, [ipo.status, ipo.dates])

  const statusConfig = useMemo((): IPOStatusConfig => {
    const hasTimelineDates = !!ipo.dates.open || !!ipo.dates.close || !!ipo.dates.allotment || !!ipo.dates.listing

    switch (ipo.status.toUpperCase()) {
      case 'LIVE': {
        const closeLabel = liveStatusMeta.label
        return {
          label: closeLabel || 'LIVE',
          hasDot: true,
          dotColor: liveStatusMeta.dotColor,
          isBlinking: liveStatusMeta.isBlinking,
          bgColor: '#dcfce7',
          textColor: '#16a34a',
        }
      }
      case 'UPCOMING': {
        if (!ipo.dates.open) {
          return {
            label: 'TBA',
            hasDot: true,
            dotColor: '#94a3b8',
            isBlinking: false,
            bgColor: '#e2e8f0',
            textColor: '#334155',
          }
        }

        const daysUntil = getDaysUntilOpen()
        return { label: daysUntil || 'UPCOMING', hasDot: true, dotColor: '#eab308', isBlinking: false, bgColor: '#fef9c3', textColor: '#a16207' }
      }
      case 'CLOSED':
        return { label: 'CLOSED', hasDot: true, dotColor: '#ea580c', isBlinking: false, bgColor: '#fee2e2', textColor: '#dc2626' }
      case 'LISTED':
        return { label: 'LISTED', hasDot: true, dotColor: '#3b82f6', isBlinking: false, bgColor: '#dbeafe', textColor: '#2563eb' }
      case 'UNKNOWN':
        if (!hasTimelineDates) {
          return { label: 'TBA', hasDot: true, dotColor: '#94a3b8', isBlinking: false, bgColor: '#e2e8f0', textColor: '#334155' }
        }
        return { label: 'UPCOMING', hasDot: true, dotColor: '#eab308', isBlinking: false, bgColor: '#fef9c3', textColor: '#a16207' }
      default:
        return { label: ipo.status, hasDot: false, dotColor: '#6b7280', isBlinking: false, bgColor: '#f3f4f6', textColor: '#6b7280' }
    }
  }, [ipo.status, ipo.dates, liveStatusMeta])

  return {
    priceRange,
    gmpDisplay,
    statusConfig,
    liveStatusMeta,
    isLiveIPO: ipo.status.toUpperCase() === 'LIVE'
  }
}
