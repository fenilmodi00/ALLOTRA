import { describe, expect, it } from 'vitest'

import {
  buildGMPChartModel,
  formatGMPValue,
  getNearestPointIndex,
  getTrendSummary,
} from '../../src/utils/gmpChartModel'

const history = [
  { date: '2026-02-15', gmpValue: 1 },
  { date: '2026-02-16', gmpValue: 2 },
  { date: '2026-02-17', gmpValue: 5 },
  { date: '2026-02-18', gmpValue: 4 },
  { date: '2026-02-19', gmpValue: -2 },
  { date: '2026-02-20', gmpValue: -1 },
  { date: '2026-02-21', gmpValue: 3 },
]

describe('gmpChartModel', () => {
  it('creates straight path with 6 line segments for 7 points', () => {
    const model = buildGMPChartModel(history, 320, 200)
    expect(model.path.startsWith('M ')).toBe(true)
    expect((model.path.match(/ L /g) || []).length).toBe(6)
  })

  it('returns nearest index for touch x', () => {
    const model = buildGMPChartModel(history, 320, 200)
    expect(getNearestPointIndex(model.points, model.points[3].x + 1)).toBe(3)
  })

  it('formats signed GMP value', () => {
    expect(formatGMPValue(5)).toBe('+Rs5')
    expect(formatGMPValue(-5)).toBe('-Rs5')
  })

  it('provides dotted empty baseline in no-data model', () => {
    const model = buildGMPChartModel([], 320, 200)
    expect(model.points).toHaveLength(0)
    expect(model.emptyLineY).toBe(100)
  })

  it('computes summary change from first to last', () => {
    const summary = getTrendSummary(history)
    expect(summary.latest).toBe(3)
    expect(summary.change).toBe(2)
  })

  it('returns zero percent change when baseline is zero', () => {
    const summary = getTrendSummary([
      { date: '2026-02-20', gmpValue: 0 },
      { date: '2026-02-21', gmpValue: 5 },
    ])

    expect(summary.change).toBe(5)
    expect(summary.changePercent).toBe(0)
  })
})
