import { useCallback, useEffect, useState } from 'react'
import { stockService } from '../services/stockService'
import type { Stock } from '../types'

// Hook for fetching most traded stocks
export const useMostTradedStocks = (limit = 4, autoRefresh = true) => {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStocks = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await stockService.getMostTradedStocks(limit)
      setStocks(data)
      
      if (__DEV__) {
        console.log('📈 Fetched most traded stocks:', data.length, 'items')
      }
    } catch (err) {
      console.error('❌ Failed to fetch most traded stocks:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch stocks')
    } finally {
      setLoading(false)
    }
  }, [limit])

  const refresh = useCallback(() => fetchStocks(), [fetchStocks])

  // Initial load
  useEffect(() => {
    fetchStocks()
  }, [fetchStocks])

  // Auto refresh every 60 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchStocks, 60000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchStocks])

  return { stocks, loading, error, refresh }
}

// Hook for fetching gainers/losers
export const useGainersLosers = (category: 'large' | 'mid' | 'small' = 'large', limit = 10) => {
  const [gainers, setGainers] = useState<Stock[]>([])
  const [losers, setLosers] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [gainersData, losersData] = await Promise.all([
        stockService.getGainers(category, limit),
        stockService.getLosers(category, limit)
      ])
      
      setGainers(gainersData)
      setLosers(losersData)
      
      if (__DEV__) {
        console.log(`📈 Fetched ${category} cap gainers/losers:`, {
          gainers: gainersData.length,
          losers: losersData.length
        })
      }
    } catch (err) {
      console.error('❌ Failed to fetch gainers/losers:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [category, limit])

  const refresh = useCallback(() => fetchData(), [fetchData])

  // Initial load
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { gainers, losers, loading, error, refresh }
}

// Hook for stock search
export const useStockSearch = () => {
  const [results, setResults] = useState<Stock[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchStocks = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const data = await stockService.searchStocks(query)
      setResults(data)
    } catch (err) {
      console.error('❌ Failed to search stocks:', err)
      setError(err instanceof Error ? err.message : 'Search failed')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  return { results, loading, error, searchStocks, clearResults }
}

// Hook for single stock details
export const useStockDetails = (symbol: string) => {
  const [stock, setStock] = useState<Stock | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStock = useCallback(async () => {
    if (!symbol) return

    setLoading(true)
    setError(null)
    
    try {
      const data = await stockService.getStockBySymbol(symbol)
      setStock(data)
    } catch (err) {
      console.error('❌ Failed to fetch stock details:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch stock')
    } finally {
      setLoading(false)
    }
  }, [symbol])

  useEffect(() => {
    if (symbol) fetchStock()
  }, [symbol, fetchStock])

  return { stock, loading, error, refetch: fetchStock }
}