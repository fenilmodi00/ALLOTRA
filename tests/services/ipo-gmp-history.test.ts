import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}))

vi.mock('../../src/services/api', () => ({
  apiClient: { get: getMock },
}))

import { ipoService } from '../../src/services/ipoService'

describe('ipoService.getGMPHistory', () => {
  beforeEach(() => {
    getMock.mockReset()
  })

  it('calls endpoint and returns sorted latest 7 points', async () => {
    getMock.mockResolvedValue({
      data: {
        success: true,
        data: {
          stock_id: '2584',
          history: [
            { date: '2026-02-14', gmp_value: 1 },
            { date: '2026-02-15', gmp_value: 2 },
            { date: '2026-02-16', gmp_value: 3 },
            { date: '2026-02-17', gmp_value: 4 },
            { date: '2026-02-18', gmp_value: 5 },
            { date: '2026-02-19', gmp_value: 6 },
            { date: '2026-02-20', gmp_value: 7 },
            { date: '2026-02-21', gmp_value: 8 },
          ],
        },
      },
    })

    const result = await ipoService.getGMPHistory('2584')

    expect(getMock).toHaveBeenCalledWith('/gmp/history/2584')
    expect(result).toHaveLength(7)
    expect(result[0]?.date).toBe('2026-02-15')
    expect(result[6]?.gmpValue).toBe(8)
  })

  it('returns empty array when history is empty', async () => {
    getMock.mockResolvedValue({
      data: {
        success: true,
        data: {
          stock_id: '2584',
          history: [],
        },
      },
    })

    await expect(ipoService.getGMPHistory('2584')).resolves.toEqual([])
  })

  it('drops rows with invalid dates', async () => {
    getMock.mockResolvedValue({
      data: {
        success: true,
        data: {
          stock_id: '2584',
          history: [
            { date: 'bad-date', gmp_value: 8 },
            { date: '2026-02-20', gmp_value: 7 },
          ],
        },
      },
    })

    await expect(ipoService.getGMPHistory('2584')).resolves.toEqual([
      { date: '2026-02-20', gmpValue: 7 },
    ])
  })
})
