import { describe, expect, it } from 'vitest'
import { useIPOUIStore } from '../../src/store/useIPOUIStore'

describe('useIPOUIStore', () => {
  it('updates active filter without touching IPO data', () => {
    useIPOUIStore.getState().setActiveFilter('listed')
    expect(useIPOUIStore.getState().activeFilter).toBe('listed')
  })
})
