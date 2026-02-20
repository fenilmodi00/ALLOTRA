import { describe, expect, it } from 'vitest'
import { mapAllotmentStatus } from '../../src/services/mappers/allotmentMapper'

describe('mapAllotmentStatus', () => {
  it('maps known statuses safely', () => {
    expect(mapAllotmentStatus('ALLOTTED')).toBe('ALLOTTED')
    expect(mapAllotmentStatus('NOT_ALLOTTED')).toBe('NOT_ALLOTTED')
  })

  it('falls back unknown statuses to PENDING', () => {
    expect(mapAllotmentStatus('SOMETHING_NEW')).toBe('PENDING')
  })
})
