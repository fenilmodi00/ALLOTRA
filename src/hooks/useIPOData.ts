import { useCallback, useEffect, useState } from 'react'
import { useIPOStore } from '../store/useIPOStore'
import { ipoService } from '../services/ipoService'
import type { DisplayIPO, AllotmentResult, IPOStatus } from '../types'
import { devError, devLog } from '../utils/logger'
import { ipoRepository } from '../repositories/ipoRepository'

// Hook for fetching and managing IPO list with enhanced features
export const useIPOList = (status: IPOStatus | 'all' = 'all', includeGMP = true) => {
  const { ipos, loading, error, setIPOs, setLoading, setError, clearError } = useIPOStore()
  const [refreshing, setRefreshing] = useState(false)

  const fetchIPOs = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    clearError()
    
    try {
      let data: DisplayIPO[]

      // Use the most appropriate endpoint
      if (status === 'all' && includeGMP) {
        data = await ipoRepository.getActiveFeed()
        devLog('📊 Fetched active IPOs with GMP:', { count: data.length })
      } else if (status === 'LIVE') {
        data = includeGMP 
          ? await ipoRepository.getActiveFeed()
          : await ipoService.getActiveIPOs()
        devLog('📊 Fetched live IPOs:', { count: data.length })
      } else if (status === 'UPCOMING') {
        data = await ipoService.getUpcomingIPOs()
        devLog('📊 Fetched upcoming IPOs:', { count: data.length })
      } else if (status === 'CLOSED') {
        data = await ipoService.getClosedIPOs()
        devLog('📊 Fetched closed IPOs:', { count: data.length })
      } else if (status === 'LISTED') {
        data = await ipoService.getListedIPOs()
        devLog('📊 Fetched listed IPOs:', { count: data.length })
      } else {
        // For any other status or 'all', use the general endpoint
        data = await ipoService.getIPOs({ status: status === 'all' ? undefined : status })
        devLog('📊 Fetched general IPOs:', { count: data.length })
      }

      // Log sample data for debugging (only in dev)
      if (__DEV__ && data.length > 0) {
        devLog('📊 Sample IPO data:', {
          name: data[0].name,
          status: data[0].status,
          dates: data[0].dates,
          hasGMP: !!data[0].gmp
        })
      }

      setIPOs(data)
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
      const data = await ipoService.checkAllotment(ipoId, pan)
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchIndices = useCallback(async () => {
    setLoading(true)
    
    try {
      const data = await ipoService.getMarketIndices()
      setIndices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch indices')
    } finally {
      setLoading(false)
    }
  }, [setIndices])

  useEffect(() => {
    fetchIndices()
  }, [fetchIndices])

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchIndices, 30000)
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
