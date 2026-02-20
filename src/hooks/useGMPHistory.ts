import { useCallback, useEffect, useState } from 'react'

import { ipoService } from '../services/ipoService'
import type { GMPHistoryPoint } from '../types'

interface UseGMPHistoryResult {
  history: GMPHistoryPoint[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export const useGMPHistory = (stockId?: string): UseGMPHistoryResult => {
  const [history, setHistory] = useState<GMPHistoryPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    if (!stockId) {
      setHistory([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await ipoService.getGMPHistory(stockId)
      setHistory(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch GMP history')
      setHistory([])
    } finally {
      setLoading(false)
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
