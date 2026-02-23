import { create } from 'zustand'
import type { DisplayIPO, MarketIndex, AllotmentResult } from '../types'

const hasIndexValueChanged = (current: MarketIndex, next: MarketIndex) => {
  return (
    current.name !== next.name ||
    current.value !== next.value ||
    current.change !== next.change ||
    current.change_percent !== next.change_percent ||
    current.is_positive !== next.is_positive
  )
}

interface IPOState {
  // Data
  ipos: DisplayIPO[]
  indices: MarketIndex[]
  recentChecks: AllotmentResult[]
  
  // UI State
  loading: boolean
  error: string | null
  
  // Actions
  setIPOs: (ipos: DisplayIPO[]) => void
  setIndices: (indices: MarketIndex[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addRecentCheck: (result: AllotmentResult) => void
  clearError: () => void
  
  // Selectors
  getIPOById: (id: string) => DisplayIPO | undefined
  getIPOsByStatus: (status: DisplayIPO['status']) => DisplayIPO[]
}

export const useIPOStore = create<IPOState>((set, get) => ({
  // Initial State
  ipos: [],
  indices: [],
  recentChecks: [],
  loading: false,
  error: null,
  
  // Actions
  setIPOs: (ipos) => set({ ipos }),
  setIndices: (indices) => set((state) => {
    if (state.indices.length === 0) {
      return { indices }
    }

    const previousById = new Map(state.indices.map((index) => [index.id, index]))

    let hasAnyChanges = state.indices.length !== indices.length

    const mergedIndices = indices.map((nextIndex) => {
      const previousIndex = previousById.get(nextIndex.id)

      if (!previousIndex) {
        hasAnyChanges = true
        return nextIndex
      }

      if (hasIndexValueChanged(previousIndex, nextIndex)) {
        hasAnyChanges = true
        return nextIndex
      }

      return previousIndex
    })

    if (!hasAnyChanges) {
      const hasOrderChanged = mergedIndices.some((index, idx) => index !== state.indices[idx])
      if (!hasOrderChanged) {
        return state
      }
    }

    return { indices: mergedIndices }
  }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  addRecentCheck: (result) => set((state) => ({
    recentChecks: [result, ...state.recentChecks.slice(0, 9)] // Keep last 10
  })),
  
  clearError: () => set({ error: null }),
  
  // Selectors
  getIPOById: (id) => get().ipos.find(ipo => ipo.id === id),
  
  getIPOsByStatus: (status) => get().ipos.filter(ipo => ipo.status === status),
}))

// Selector hooks for optimized re-renders
export const useIPOs = () => useIPOStore((state) => state.ipos)
export const useIndices = () => useIPOStore((state) => state.indices)
export const useIPOLoading = () => useIPOStore((state) => state.loading)
export const useIPOError = () => useIPOStore((state) => state.error)
