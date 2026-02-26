import { useEffect, useState } from 'react'
import { useCacheWarmup } from './useIPOData'
import { devError } from '../utils/logger'

export const useAppInitialization = () => {
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { warmupCache, warming } = useCacheWarmup()

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Warm up the cache on app startup
        await warmupCache()

        setInitialized(true)
      } catch (err) {
        devError('App initialization failed:', err)
        setError(err instanceof Error ? err.message : 'Initialization failed')
        // Don't block the app if initialization fails
        setInitialized(true)
      }
    }

    initializeApp()
  }, [warmupCache])

  return {
    initialized,
    warming,
    error
  }
}
