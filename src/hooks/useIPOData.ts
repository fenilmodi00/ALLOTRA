import { useCallback, useEffect, useRef, useState } from 'react'
import { useIPOStore } from '../store/useIPOStore'
import { ipoService } from '../services/ipoService'
import type { DisplayIPO, AllotmentResult, IPOStatus, MarketIndex } from '../types'
import { devError, devLog } from '../utils/logger'
import { ipoRepository } from '../repositories/ipoRepository'
import { cacheWrite, cacheReadStale, CACHE_KEYS } from '../utils/asyncStorageCache'

// Derive the cache key that corresponds to a given status + includeGMP combo
function ipoListCacheKey(status: IPOStatus | 'all', includeGMP: boolean): string {
  if ((status === 'all' || status === 'LIVE') && includeGMP) return CACHE_KEYS.IPO_ACTIVE_FEED
  if (status === 'UPCOMING') return CACHE_KEYS.IPO_UPCOMING
  if (status === 'CLOSED') return CACHE_KEYS.IPO_CLOSED
  if (status === 'LISTED') return CACHE_KEYS.IPO_LISTED
  return CACHE_KEYS.IPO_ACTIVE_FEED
}

// Hook for fetching and managing IPO list with enhanced features
export const useIPOList = (status: IPOStatus | 'all' = 'all', includeGMP = true) => {
  const { ipos, loading, error, setIPOs, setLoading, setError, clearError } = useIPOStore()
  const [refreshing, setRefreshing] = useState(false)
  const seededFromCache = useRef(false)

  // Seed from cache on first mount so the UI has something to show instantly
  useEffect(() => {
    if (seededFromCache.current) return
    seededFromCache.current = true

    const cached = cacheReadStale<DisplayIPO[]>(ipoListCacheKey(status, includeGMP))
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

      // V2: Use optimized feed endpoint for all cases
      if (status === 'all' || status === 'LIVE') {
        data = await ipoRepository.getFeed(status === 'all' ? 'all' : 'live')
      } else if (status === 'UPCOMING' || status === 'CLOSED' || status === 'LISTED') {
        data = await ipoRepository.getFeed(status.toLowerCase())
      } else {
        data = await ipoRepository.getFeed()
      }

      if (__DEV__ && data.length > 0) {
        devLog('📊 Sample IPO data (V2):', {
          name: data[0].name,
          status: data[0].status,
          dates: data[0].dates,
          hasGMP: !!data[0].gmp
        })
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
      // V2: Use optimized endpoint
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

// Hook for performance monitoring (optional)
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchMetrics = useCallback(async () => {
    setLoading(true)
    try {
      const response = await ipoService.getPerformanceMetrics()
      setMetrics(response.data)
    } catch (err) {
      console.warn('Performance metrics not available:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  return { metrics, loading, fetchMetrics }
}

// Hook for cache warmup (call on app startup)
export const useCacheWarmup = () => {
  const [warming, setWarming] = useState(false)

  const warmupCache = useCallback(async () => {
    setWarming(true)
    try {
      await ipoService.warmupCache()
    } catch (err) {
      console.warn('Cache warmup failed:', err)
    } finally {
      setWarming(false)
    }
  }, [])

  return { warming, warmupCache }
}
