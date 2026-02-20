import { describe, expect, it, vi } from 'vitest'

vi.mock('../../src/services/ipoService', () => ({
  ipoService: {
    getActiveIPOsWithGMP: vi.fn(async () => []),
    getIPOByIdWithGMP: vi.fn(async () => ({ id: '1' })),
  },
}))

import { ipoRepository } from '../../src/repositories/ipoRepository'

describe('ipoRepository', () => {
  it('returns display IPOs for active feed', async () => {
    const result = await ipoRepository.getActiveFeed()
    expect(Array.isArray(result)).toBe(true)
  })
})
