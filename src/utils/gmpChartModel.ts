import type { GMPHistoryPoint } from '../types'

export interface ChartPoint {
  x: number
  y: number
  date: string
  gmpValue: number
}

export interface GMPChartModel {
  points: ChartPoint[]
  path: string
  rightTicks: number[]
  emptyLineY: number
}

const PAD_TOP = 16
const PAD_BOTTOM = 26
const PAD_LEFT = 12
const PAD_RIGHT = 44

export const buildGMPChartModel = (history: GMPHistoryPoint[], width: number, height: number): GMPChartModel => {
  const chartWidth = Math.max(width, 1)
  const chartHeight = Math.max(height, 1)
  const plotWidth = Math.max(chartWidth - PAD_LEFT - PAD_RIGHT, 1)
  const plotHeight = Math.max(chartHeight - PAD_TOP - PAD_BOTTOM, 1)

  if (!history.length) {
    return {
      points: [],
      path: '',
      rightTicks: [1, 0.5, 0, -0.5, -1],
      emptyLineY: Math.round(chartHeight / 2),
    }
  }

  const minRaw = Math.min(...history.map((item) => item.gmpValue))
  const maxRaw = Math.max(...history.map((item) => item.gmpValue))
  const spread = Math.max(maxRaw - minRaw, 1)
  const min = minRaw - spread * 0.15
  const max = maxRaw + spread * 0.15

  const points = history.map((item, index) => {
    const x = PAD_LEFT + (index / Math.max(history.length - 1, 1)) * plotWidth
    const y = PAD_TOP + ((max - item.gmpValue) / Math.max(max - min, 1)) * plotHeight

    return {
      x,
      y,
      date: item.date,
      gmpValue: item.gmpValue,
    }
  })

  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  const rightTicks = [0, 1, 2, 3, 4].map((index) => Number((max - ((max - min) * index) / 4).toFixed(2)))

  return {
    points,
    path,
    rightTicks,
    emptyLineY: Math.round(chartHeight / 2),
  }
}

export const getNearestPointIndex = (points: ChartPoint[], touchX: number): number => {
  if (!points.length) {
    return -1
  }

  let nearestIndex = 0
  let nearestDistance = Number.POSITIVE_INFINITY

  points.forEach((point, index) => {
    const distance = Math.abs(point.x - touchX)

    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestIndex = index
    }
  })

  return nearestIndex
}

export const formatGMPValue = (value: number): string => {
  const rounded = Math.round(Math.abs(value))

  if (value > 0) {
    return `+Rs${rounded}`
  }

  if (value < 0) {
    return `-Rs${rounded}`
  }

  return 'Rs0'
}

export const getTrendSummary = (history: GMPHistoryPoint[]) => {
  if (!history.length) {
    return {
      latest: 0,
      change: 0,
      changePercent: 0,
    }
  }

  const first = history[0].gmpValue
  const latest = history[history.length - 1].gmpValue
  const change = latest - first
  const changePercent = first === 0 ? 0 : (change / Math.abs(first)) * 100

  return {
    latest,
    change,
    changePercent,
  }
}
