import { useCallback, useEffect, useRef, useState } from 'react'
import { useIPOStore } from '../store/useIPOStore'
import { ipoService } from '../services/ipoService'
import type { DisplayIPO, AllotmentResult, IPOStatus, MarketIndex } from '../types'
import { devError, devLog } from '../utils/logger'
import { ipoRepository } from '../repositories/ipoRepository'
import { cacheWrite, cacheReadStale, CACHE_KEYS } from '../utils/asyncStorageCache'

const STARTUP_STATUS_QUEUE: Array<{ key: string; status: string; cacheKey: string }> = [
  { key: 'ACTIVE', status: 'ACTIVE', cacheKey: CACHE_KEYS.IPO_ACTIVE_FEED },
  { key: 'CLOSED', status: 'CLOSED', cacheKey: CACHE_KEYS.IPO_CLOSED },
  { key: 'LISTED', status: 'LISTED', cacheKey: CACHE_KEYS.IPO_LISTED },
  { key: 'UPCOMING', status: 'UPCOMING', cacheKey: CACHE_KEYS.IPO_UPCOMING },
  // Final pass to include UNKNOWN/TBA and any records not in status-specific feeds.
  { key: 'ALL', status: 'all', cacheKey: CACHE_KEYS.IPO_ALL_FEED },
]

const mergeUniqueIPOs = (base: DisplayIPO[], incoming: DisplayIPO[], overwriteExisting = true): DisplayIPO[] => {
  if (incoming.length === 0) return base

  const map = new Map<string, DisplayIPO>()
  const order: string[] = []

  for (const ipo of base) {
    const id = ipo.id || ipo.name
    if (!id) continue
    map.set(id, ipo)
    order.push(id)
  }

  for (const ipo of incoming) {
    const id = ipo.id || ipo.name
    if (!id) continue

    if (!map.has(id)) {
      order.push(id)
      map.set(id, ipo)
      continue
    }

    if (overwriteExisting) {
      map.set(id, ipo)
    }
  }

  return order.map((id) => map.get(id)).filter((ipo): ipo is DisplayIPO => !!ipo)
}

const seedAllStatusCache = (): DisplayIPO[] => {
  let seeded: DisplayIPO[] = []

  for (const item of STARTUP_STATUS_QUEUE) {
    const cached = cacheReadStale<DisplayIPO[]>(item.cacheKey)
    if (cached && cached.length > 0) {
      seeded = mergeUniqueIPOs(seeded, cached)
    }
  }

  return seeded
}

// Derive the cache key that corresponds to a given status + includeGMP combo
function ipoListCacheKey(status: IPOStatus | 'all', includeGMP: boolean): string {
  if (status === 'all') return CACHE_KEYS.IPO_ALL_FEED
  if (status === 'LIVE' && includeGMP) return CACHE_KEYS.IPO_ACTIVE_FEED
  if (status === 'UPCOMING') return CACHE_KEYS.IPO_UPCOMING
  if (status === 'CLOSED') return CACHE_KEYS.IPO_CLOSED
  if (status === 'LISTED') return CACHE_KEYS.IPO_LISTED
  return CACHE_KEYS.IPO_ALL_FEED
}

// Hook for fetching and managing IPO list with enhanced features
export const useIPOList = (status: IPOStatus | 'all' = 'all', includeGMP = true) => {
  const { ipos, loading, error, setIPOs, setLoading, setError, clearError } = useIPOStore()
  const [refreshing, setRefreshing] = useState(false)
  const seededFromCache = useRef(false)
  const inFlightRef = useRef(false)

  // Seed from cache on first mount so the UI has something to show instantly
  useEffect(() => {
    if (seededFromCache.current) return
    seededFromCache.current = true

    const cached = status === 'all'
      ? seedAllStatusCache()
      : cacheReadStale<DisplayIPO[]>(ipoListCacheKey(status, includeGMP))

    if (cached && cached.length > 0) {
      // Only seed when the store is still empty to avoid overwriting a
      // completed fresh fetch that may have beaten the cache read.
      if (useIPOStore.getState().ipos.length === 0) {
        devLog('📦 Seeding IPO list from cache:', { count: cached.length })
        setIPOs(cached)
      }
    }
  // Run once on mount — intentionally no deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchIPOs = useCallback(async (isRefresh = false) => {
    if (inFlightRef.current) {
      return
    }
    inFlightRef.current = true

    if (isRefresh) {
      setRefreshing(true)
    } else {
      // Only show the loading spinner when we have no data at all
      if (useIPOStore.getState().ipos.length === 0) {
        setLoading(true)
      }
    }
    clearError()
    
    try {
      let data: DisplayIPO[]

      // Startup priority queue for Home first paint.
      if (status === 'all') {
        let merged: DisplayIPO[] = []
        let hadAnySuccess = false

        for (const queueItem of STARTUP_STATUS_QUEUE) {
          try {
            const chunk = await ipoRepository.getFeed(queueItem.status)
            hadAnySuccess = true
            cacheWrite(queueItem.cacheKey, chunk)

            const shouldOverwriteExisting = queueItem.key !== 'ALL'
            merged = mergeUniqueIPOs(merged, chunk, shouldOverwriteExisting)

            // Progressive updates: ACTIVE appears first, then others stream in.
            setIPOs(merged)
          } catch (queueError) {
            devError(`❌ Failed IPO queue stage ${queueItem.key}:`, queueError)

            const fallbackChunk = cacheReadStale<DisplayIPO[]>(queueItem.cacheKey)
            if (fallbackChunk && fallbackChunk.length > 0) {
              merged = mergeUniqueIPOs(merged, fallbackChunk)
              setIPOs(merged)
            }
          }
        }

        if (!hadAnySuccess && merged.length === 0) {
          throw new Error('Failed to fetch IPO queue and no cache fallback available')
        }

        data = merged
      } else if (status === 'LIVE') {
        data = await ipoRepository.getFeed('ACTIVE')
      } else if (status === 'UPCOMING' || status === 'CLOSED' || status === 'LISTED') {
        const statusMap: Record<'UPCOMING' | 'CLOSED' | 'LISTED', string> = {
          UPCOMING: 'UPCOMING',
          CLOSED: 'CLOSED',
          LISTED: 'LISTED',
        }
        data = await ipoRepository.getFeed(statusMap[status])
      } else {
        data = await ipoRepository.getFeed()
      }

      setIPOs(data)
      // Persist fresh data for the next session / component re-mount
      cacheWrite(ipoListCacheKey(status, includeGMP), data)
    } catch (err) {
      devError('❌ Failed to fetch IPOs:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch IPOs')
      
      // Fallback to mock data in development
      if (__DEV__) {
        devLog('🔄 Using mock data as fallback...')
        // Dynamically import mock data to avoid including it in production
        const { getMockIPOData } = await import('../debug/testIPOData')
        const mockData = getMockIPOData()
        setIPOs(mockData)
      }
    } finally {
      inFlightRef.current = false
      setLoading(false)
      setRefreshing(false)
    }
  }, [status, includeGMP, setIPOs, setLoading, setError, clearError])

  const refresh = useCallback(() => fetchIPOs(true), [fetchIPOs])

  // Initial load
  useEffect(() => {
    fetchIPOs()
  }, [fetchIPOs])

  return { ipos, loading, error, refreshing, fetchIPOs, refresh }
}

// Hook for single IPO details with GMP
export const useIPODetails = (ipoId: string, includeGMP = true) => {
  const [ipo, setIPO] = useState<DisplayIPO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchIPO = useCallback(async () => {
    if (!ipoId) return

    setLoading(true)
    setError(null)
    
    try {
      const data = await ipoRepository.getById(ipoId, includeGMP)
      
      setIPO(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch IPO details')
    } finally {
      setLoading(false)
    }
  }, [ipoId, includeGMP])

  useEffect(() => {
    if (ipoId) fetchIPO()
  }, [ipoId, fetchIPO])

  return { ipo, loading, error, refetch: fetchIPO }
}

// Hook for allotment check
export const useAllotmentCheck = () => {
  const [result, setResult] = useState<AllotmentResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addRecentCheck } = useIPOStore()

  const checkAllotment = useCallback(async (ipoId: string, pan: string) => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      const data = await ipoRepository.checkAllotment(ipoId, pan)
      setResult(data)
      addRecentCheck(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check allotment')
    } finally {
      setLoading(false)
    }
  }, [addRecentCheck])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { result, loading, error, checkAllotment, reset }
}

// Hook for market indices with auto-refresh
export const useMarketIndices = (autoRefresh = true) => {
  const { indices, setIndices } = useIPOStore()
  const seededFromCache = useRef(false)
  const [loading, setLoading] = useState(indices.length === 0)
  const [error, setError] = useState<string | null>(null)

  // Seed from cache synchronously on first mount
  useEffect(() => {
    if (seededFromCache.current) return
    seededFromCache.current = true

    if (useIPOStore.getState().indices.length === 0) {
      const cached = cacheReadStale<MarketIndex[]>(CACHE_KEYS.MARKET_INDICES)
      if (cached && cached.length > 0) {
        devLog('📦 Seeding market indices from cache:', { count: cached.length })
        setIndices(cached)
        // We have stale data — no need to show the loading skeleton
        setLoading(false)
      }
    }
  // Run once on mount — intentionally no deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchIndices = useCallback(async (isBackgroundRefresh = false) => {
    const shouldShowInitialLoader = !isBackgroundRefresh && useIPOStore.getState().indices.length === 0

    if (shouldShowInitialLoader) {
      setLoading(true)
    }
    
    try {
      const data = await ipoService.getMarketIndices()
      setIndices(data)
      cacheWrite(CACHE_KEYS.MARKET_INDICES, data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch indices')
    } finally {
      if (shouldShowInitialLoader) {
        setLoading(false)
      }
    }
  }, [setIndices])

  useEffect(() => {
    void fetchIndices()
  }, [fetchIndices])

  // Auto refresh every minute without toggling loading skeletons
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      void fetchIndices(true)
    }, 60000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchIndices])

  return { indices, loading, error, refresh: fetchIndices }
}

// Hook for cache warmup (call on app startup)
export const useCacheWarmup = () => {
  const [warming, setWarming] = useState(false)

  const warmupCache = useCallback(async () => {
    setWarming(true)
    try {
      await ipoService.warmupCache()
    } catch (err) {
      devError('Cache warmup failed:', err)
    } finally {
      setWarming(false)
    }
  }, [])

  return { warming, warmupCache }
}
