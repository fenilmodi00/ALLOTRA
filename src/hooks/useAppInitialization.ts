import { useEffect, useState } from 'react'
import { useCacheWarmup } from './useIPOData'
import { ipoService } from '../services/ipoService'

export const useAppInitialization = () => {
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { warmupCache, warming } = useCacheWarmup()

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Run backend test in development
        if (__DEV__) {
          // Dynamically import debug utilities to avoid including them in production
          const { runBackendTest } = await import('../debug/testBackend')
          runBackendTest()
        }
        
        // Warm up the cache on app startup
        await warmupCache()
        
        // You can add other initialization tasks here
        // e.g., check app version, sync user preferences, etc.
        
        setInitialized(true)
      } catch (err) {
        console.warn('App initialization failed:', err)
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