import { useCallback, useEffect, useState, useRef } from 'react'
import { ipoService } from '../services/ipoService'
import type { GMPHistoryPoint } from '../types'
import { devLog } from '../utils/logger'
import { cacheReadStale, cacheWrite } from '../utils/asyncStorageCache'

interface UseGMPHistoryResult {
  history: GMPHistoryPoint[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export const useGMPHistory = (stockId?: string): UseGMPHistoryResult => {
  const [history, setHistory] = useState<GMPHistoryPoint[]>([])
  const seededFromCache = useRef(false)
  const isMounted = useRef(true)

  const [loading, setLoading] = useState(() => {
    if (!stockId) return false;
    const cacheKey = `GMP_HISTORY_${stockId}`
    const cachedData = cacheReadStale<GMPHistoryPoint[]>(cacheKey)
    return !cachedData || cachedData.length === 0;
  })

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!stockId) {
      if (isMounted.current) setHistory([])
      return
    }

    const cacheKey = `GMP_HISTORY_${stockId}`

    if (!seededFromCache.current) {
      seededFromCache.current = true
      // Synchronously grab cache (Stale-While-Revalidate)
      const cached = cacheReadStale<GMPHistoryPoint[]>(cacheKey)
      if (cached && cached.length > 0) {
        devLog(`📦 Seeding GMP history from cache for ${stockId}`)
        if (isMounted.current) setHistory(cached)
      } else {
        if (isMounted.current) setLoading(true)
      }
    }

    if (isMounted.current) setError(null)

    try {
      devLog(`🌐 Fetching fresh GMP history for ${stockId} in background`)
      const data = await ipoService.getGMPHistory(stockId)
      
      if (isMounted.current) {
        setHistory(data)
        // Set new cache seamlessly behind the scenes
        cacheWrite(cacheKey, data)
      }
    } catch (err) {
      if (isMounted.current) {
        setHistory((currentHistory) => {
          // If we had a cache populated, hide the new network error from the user to provide a stable UI.
          if (currentHistory.length === 0) {
            setError(err instanceof Error ? err.message : 'Failed to fetch GMP history')
          } else {
            devLog(`⚠️ Background refresh failed for GMP ${stockId}, keeping stale data`)
          }
          return currentHistory;
        });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }, [stockId])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return {
    history,
    loading,
    error,
    refetch: fetchHistory,
  }
}
