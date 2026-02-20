import { create } from 'zustand'

interface IPOUIState {
  activeFilter: string
  setActiveFilter: (filter: string) => void
}

export const useIPOUIStore = create<IPOUIState>((set) => ({
  activeFilter: 'ongoing',
  setActiveFilter: (activeFilter) => set({ activeFilter }),
}))
