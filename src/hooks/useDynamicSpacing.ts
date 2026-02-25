import { useMemo, useCallback } from 'react'
import type { DisplayIPO } from '../types'

interface SpacingConfig {
  empty: number
  few: number
  some: number
  many: number
  expanded: number
}

const DEFAULT_SPACING: SpacingConfig = {
  empty: 15,    // No IPOs - reduced from 10
  few: 18,      // 1-2 IPOs - reduced from 15
  some: 20,     // 3-6 IPOs - same
  many: 22,     // 7+ IPOs (collapsed) - reduced from 25
  expanded: 25  // 7+ IPOs (expanded) - reduced from 30
}

export const useDynamicSpacing = (
  getIPOsForFilter: (filter: string) => DisplayIPO[],
  activeFilter: string,
  showMoreIPOs: { [key: string]: boolean },
  customSpacing?: Partial<SpacingConfig>
) => {
  const spacing = useMemo(() => ({ ...DEFAULT_SPACING, ...customSpacing }), [customSpacing])

  const calculateSpacing = useCallback(() => {
    const currentIPOs = getIPOsForFilter(activeFilter)
    const isExpanded = showMoreIPOs[activeFilter] || false
    const ipoCount = currentIPOs.length

    // Spacing logic based on content
    if (ipoCount === 0) return spacing.empty
    if (ipoCount <= 2) return spacing.few
    if (ipoCount <= 6) return spacing.some
    if (isExpanded) return spacing.expanded
    return spacing.many
  }, [getIPOsForFilter, activeFilter, showMoreIPOs, spacing])

  const currentSpacing = calculateSpacing()

  return {
    currentSpacing,
    calculateSpacing,
    spacingConfig: spacing
  }
}