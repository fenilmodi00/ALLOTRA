import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { GestureResponderEvent } from 'react-native'
import { Animated, Easing, StyleSheet, View } from 'react-native'
import Svg, { Circle, Line, Path } from 'react-native-svg'

import { Text } from '@/components/ui/text'
import { growwColors } from '../../design-system/tokens/colors'
import type { ChartPoint } from '../../utils/gmpChartModel'
import { buildGMPChartModel, getNearestPointIndex, getTrendSummary } from '../../utils/gmpChartModel'
import type { GMPHistoryPoint } from '../../types'

interface GMPWeekInteractiveChartProps {
  history: GMPHistoryPoint[]
}

const CHART_HEIGHT = 220
const TOOLTIP_WIDTH = 132

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max)
}

const formatMainValue = (value: number): string => {
  if (value > 0) {
    return `+₹${value.toFixed(2)}`
  }

  if (value < 0) {
    return `-₹${Math.abs(value).toFixed(2)}`
  }

  return `₹0.00`
}

const formatSignedChange = (value: number): string => {
  const sign = value >= 0 ? '+' : '-'
  return `${sign}${Math.abs(value).toFixed(2)}`
}

const formatPercent = (value: number): string => {
  return `${Math.abs(value).toFixed(2)}%`
}

const formatPointValue = (value: number): string => {
  const sign = value >= 0 ? '+' : '-'
  return `${sign}₹${Math.abs(value).toFixed(2)}`
}

const getPointPercent = (point: ChartPoint | null): number | null => {
  if (!point) {
    return null
  }

  if (typeof point.listingPercent === 'number' && Number.isFinite(point.listingPercent)) {
    return point.listingPercent
  }

  if (typeof point.ipoPrice === 'number' && Number.isFinite(point.ipoPrice) && point.ipoPrice > 0) {
    return (point.gmpValue / point.ipoPrice) * 100
  }

  return null
}

export function GMPWeekInteractiveChart({ history }: GMPWeekInteractiveChartProps) {
  const [width, setWidth] = useState(0)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [hasTouched, setHasTouched] = useState(false)
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tooltipPosition = useRef(new Animated.ValueXY({ x: 8, y: 8 })).current

  const model = useMemo(() => buildGMPChartModel(history, width, CHART_HEIGHT), [history, width])
  const summary = useMemo(() => getTrendSummary(history), [history])
  const activePoint = activeIndex === null ? null : model.points[activeIndex] || null
  const activePercent = getPointPercent(activePoint)
  const lineColor = summary.latest >= 0 ? growwColors.success : growwColors.error
  const summaryColor = summary.latest >= 0 ? growwColors.success : growwColors.error
  const activePointColor = activePoint && activePoint.gmpValue >= 0 ? growwColors.success : growwColors.error

  useEffect(() => {
    if (!history.length) {
      setActiveIndex(null)
      setHasTouched(false)
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
        tooltipTimeoutRef.current = null
      }
      return
    }

    setActiveIndex(history.length - 1)
  }, [history])

  useEffect(() => {
    if (!activePoint || width <= 0 || !hasTouched) {
      return
    }

    const nextLeft = clamp(activePoint.x - TOOLTIP_WIDTH / 2, 8, Math.max(width - TOOLTIP_WIDTH - 8, 8))
    const nextTop = Math.max(activePoint.y - 72, 8)

    Animated.timing(tooltipPosition, {
      toValue: { x: nextLeft, y: nextTop },
      duration: 120,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }, [activePoint, hasTouched, tooltipPosition, width])

  const onTouchChart = useCallback(
    (event: GestureResponderEvent) => {
      if (!model.points.length) {
        return
      }

      const nextIndex = getNearestPointIndex(model.points, event.nativeEvent.locationX)

      if (nextIndex >= 0) {
        setActiveIndex(nextIndex)
        setHasTouched(true)
        if (tooltipTimeoutRef.current) {
          clearTimeout(tooltipTimeoutRef.current)
          tooltipTimeoutRef.current = null
        }
      }
    },
    [model.points]
  )

  const onTouchEnd = useCallback(() => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
    }

    tooltipTimeoutRef.current = setTimeout(() => {
      setHasTouched(false)
      tooltipTimeoutRef.current = null
    }, 5000)
  }, [])

  if (!history.length) {
    return null
  }

  return (
    <View style={styles.card}>
      <Text style={[styles.latestValue, { color: summaryColor }]}>{formatMainValue(summary.latest)}</Text>
      <View style={styles.subheaderRow}>
        <Text style={[styles.deltaValue, { color: summaryColor }]}>
          {formatSignedChange(summary.change)} ({formatPercent(summary.changePercent)})
        </Text>
        <Text style={styles.periodText}>1W</Text>
      </View>

      <View
        style={styles.chartArea}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={onTouchChart}
        onResponderMove={onTouchChart}
        onResponderRelease={onTouchEnd}
        onResponderTerminate={onTouchEnd}
      >
        {width > 0 && (
          <Svg width={width} height={CHART_HEIGHT}>
            <Path d={model.path} fill="none" stroke={lineColor} strokeWidth={3} />
            {activePoint && (
              <>
                <Line
                  x1={activePoint.x}
                  y1={8}
                  x2={activePoint.x}
                  y2={CHART_HEIGHT - 8}
                  stroke={growwColors.borderSubtle}
                  strokeDasharray="4 4"
                />
                <Circle cx={activePoint.x} cy={activePoint.y} r={5} fill={lineColor} stroke={growwColors.textInverse} strokeWidth={2} />
              </>
            )}
          </Svg>
        )}

        {activePoint && hasTouched && (
          <Animated.View style={[styles.tooltip, tooltipPosition.getLayout()]}> 
            <Text style={styles.tooltipDate}>
              {new Date(activePoint.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </Text>
            <Text style={[styles.tooltipValue, { color: activePointColor }]}>{formatPointValue(activePoint.gmpValue)}</Text>
            {activePercent !== null && <Text style={[styles.tooltipPercent, { color: activePointColor }]}>{formatPercent(activePercent)}</Text>}
          </Animated.View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F4F6F8',
    borderRadius: 14,
    padding: 16,
  },
  latestValue: {
    color: growwColors.text,
    fontSize: 42,
    fontWeight: '800',
    lineHeight: 46,
  },
  subheaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  deltaValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  periodText: {
    color: growwColors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  chartArea: {
    marginTop: 10,
    height: CHART_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E9ECEF',
  },
  tooltip: {
    position: 'absolute',
    width: TOOLTIP_WIDTH,
    backgroundColor: growwColors.textInverse,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tooltipDate: {
    color: growwColors.textSecondary,
    fontSize: 11,
  },
  tooltipValue: {
    color: growwColors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  tooltipPercent: {
    color: growwColors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
})
