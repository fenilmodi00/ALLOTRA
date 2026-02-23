import { describe, expect, it, vi } from 'vitest'

vi.mock('../../src/services/ipoService', () => ({
  ipoService: {
    getFeedV2: vi.fn(async () => []),
    getIPOByIdWithGMP: vi.fn(async () => ({ id: '1' })),
    checkAllotmentV2: vi.fn(async () => ({ status: 'ALLOTTED' })),
  },
}))

import { ipoRepository } from '../../src/repositories/ipoRepository'

describe('ipoRepository', () => {
  it('returns display IPOs for feed', async () => {
    const result = await ipoRepository.getFeed()
    expect(Array.isArray(result)).toBe(true)
  })
})
