import { create } from 'zustand'
import type { DisplayIPO, MarketIndex, AllotmentResult } from '../types'

interface IPOState {
  // Data
  ipos: DisplayIPO[]
  indices: MarketIndex[]
  recentChecks: AllotmentResult[]
  
  // UI State
  loading: boolean
  error: string | null
  activeFilter: string
  
  // Actions
  setIPOs: (ipos: DisplayIPO[]) => void
  setIndices: (indices: MarketIndex[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setActiveFilter: (filter: string) => void
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
  activeFilter: 'ongoing',
  
  // Actions
  setIPOs: (ipos) => set({ ipos }),
  setIndices: (indices) => set({ indices }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setActiveFilter: (activeFilter) => set({ activeFilter }),
  
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
export const useActiveFilter = () => useIPOStore((state) => state.activeFilter)
