import { useState, useCallback } from 'react'
import type { SavedPAN, PANResult, AllotmentStatus } from '../types/allotment.types'

export const useAllotment = () => {
  const [savedPANs, setSavedPANs] = useState<SavedPAN[]>([])
  const [results, setResults] = useState<PANResult[]>([])
  const [checkingId, setCheckingId] = useState<string | null>(null)

  // In a real app, savedPANs would be persisted to AsyncStorage here

  const addPAN = useCallback((pan: string, nickname: string) => {
    const cleanPan = pan.toUpperCase()

    if (savedPANs.some((p) => p.pan === cleanPan)) {
      return { success: false, error: 'This PAN is already saved.' }
    }

    setSavedPANs((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        pan: cleanPan,
        nickname: nickname.trim(),
      },
    ])
    return { success: true }
  }, [savedPANs])

  const removePAN = useCallback((id: string) => {
    setSavedPANs((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const checkAllotment = useCallback(async (ipoId: string, ipoName: string) => {
    if (savedPANs.length === 0) return

    setCheckingId(ipoId)
    setResults([])

    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500))

    const statuses: AllotmentStatus[] = ['ALLOTTED', 'NOT_ALLOTTED', 'PENDING']
    const mockResults: PANResult[] = savedPANs.map((p) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      return {
        pan: p.pan,
        status,
        shares: status === 'ALLOTTED' ? Math.floor(Math.random() * 3 + 1) * 50 : 0,
        message:
          status === 'ALLOTTED'
            ? 'Congratulations! Shares allotted.'
            : status === 'PENDING'
            ? 'Allotment under process.'
            : 'Better luck next time.',
      }
    })

    setResults(mockResults)
    setCheckingId(null)
  }, [savedPANs])

  const clearResults = useCallback(() => {
    setResults([])
  }, [])

  return {
    savedPANs,
    results,
    checkingId,
    addPAN,
    removePAN,
    checkAllotment,
    clearResults
  }
}
