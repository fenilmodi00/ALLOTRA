import { useEffect, useState } from 'react'
import { devError } from '../utils/logger'

export const useAppInitialization = () => {
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Any future initialization logic goes here
        setInitialized(true)
      } catch (err) {
        devError('App initialization failed:', err)
        setError(err instanceof Error ? err.message : 'Initialization failed')
        // Don't block the app if initialization fails
        setInitialized(true)
      }
    }

    initializeApp()
  }, [])

  return {
    initialized,
    error
  }
}
