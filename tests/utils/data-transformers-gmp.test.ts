import { describe, expect, it } from 'vitest'

import { transformIPOData } from '../../src/utils/dataTransformers'
import type { IPOWithGMP } from '../../src/types'

describe('transformIPOData for GMP chart', () => {
  it('maps backend stock_id to display stockId', () => {
    const input: IPOWithGMP = {
      id: 'ipo-1',
      stock_id: '2584',
      name: 'Demo IPO',
      company_code: 'DEMO',
      registrar: 'KFin',
      status: 'LIVE',
      strengths: [],
      risks: [],
      created_at: '2026-02-21T00:00:00.000Z',
      updated_at: '2026-02-21T00:00:00.000Z',
      gmp_value: 5,
    }

    const result = transformIPOData(input)
    expect(result.stockId).toBe('2584')
  })
})
