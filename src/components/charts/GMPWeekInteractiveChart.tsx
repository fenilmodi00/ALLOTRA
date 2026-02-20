import React, { useCallback, useMemo, useState } from 'react'
import type { GestureResponderEvent } from 'react-native'
import { StyleSheet, View } from 'react-native'
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg'

import { Text } from '@/components/ui/text'
import { growwColors } from '../../design-system/tokens/colors'
import type { GMPHistoryPoint } from '../../types'
import {
  buildGMPChartModel,
  formatGMPValue,
  getNearestPointIndex,
  getTrendSummary,
} from '../../utils/gmpChartModel'

interface GMPWeekInteractiveChartProps {
  history: GMPHistoryPoint[]
  loading?: boolean
  disabledLabel?: string
}

const CHART_HEIGHT = 220
const RIGHT_AXIS_WIDTH = 44

export function GMPWeekInteractiveChart({
  history,
  loading = false,
  disabledLabel = 'GMP not active',
}: GMPWeekInteractiveChartProps) {
  const [width, setWidth] = useState(0)
  const [activeIndex, setActiveIndex] = useState<number | null>(history.length ? history.length - 1 : null)

  const model = useMemo(() => buildGMPChartModel(history, width, CHART_HEIGHT), [history, width])
  const summary = useMemo(() => getTrendSummary(history), [history])
  const trendColor = summary.latest >= 0 ? growwColors.success : growwColors.error
  const activePoint = activeIndex === null ? null : model.points[activeIndex] || null

  const updateByTouch = useCallback(
    (event: GestureResponderEvent) => {
      if (!model.points.length) {
        return
      }

      const nearestIndex = getNearestPointIndex(model.points, event.nativeEvent.locationX)

      if (nearestIndex >= 0) {
        setActiveIndex(nearestIndex)
      }
    },
    [model.points]
  )

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.latestValue}>{formatGMPValue(summary.latest)}</Text>
          <Text style={[styles.deltaValue, { color: summary.change >= 0 ? growwColors.success : growwColors.error }]}>
            {formatGMPValue(summary.change)} ({summary.changePercent.toFixed(1)}%)
          </Text>
        </View>
        <View style={styles.rangeRow}>
          <Text style={styles.rangeActive}>7D</Text>
          <Text style={styles.rangeMuted}>1M</Text>
          <Text style={styles.rangeMuted}>ALL</Text>
        </View>
      </View>

      <View
        style={styles.touchLayer}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={updateByTouch}
        onResponderMove={updateByTouch}
      >
        <Svg width={width} height={CHART_HEIGHT}>
          {!loading && history.length > 0 && (
            <>
              <Path d={model.path} fill="none" stroke={trendColor} strokeWidth={2.5} />

              {activePoint && (
                <>
                  <Line
                    x1={activePoint.x}
                    y1={12}
                    x2={activePoint.x}
                    y2={CHART_HEIGHT - 26}
                    stroke={growwColors.borderSubtle}
                    strokeDasharray="4 4"
                  />
                  <Line
                    x1={12}
                    y1={activePoint.y}
                    x2={Math.max(width - RIGHT_AXIS_WIDTH, 12)}
                    y2={activePoint.y}
                    stroke={growwColors.borderSubtle}
                    strokeDasharray="4 4"
                  />
                  <Rect
                    x={Math.max(width - RIGHT_AXIS_WIDTH + 2, 0)}
                    y={activePoint.y - 10}
                    width={RIGHT_AXIS_WIDTH - 4}
                    height={20}
                    rx={4}
                    fill={trendColor}
                  />
                  <SvgText
                    x={Math.max(width - RIGHT_AXIS_WIDTH / 2, 0)}
                    y={activePoint.y + 4}
                    fontSize={10}
                    fill={growwColors.textInverse}
                    textAnchor="middle"
                  >
                    {formatGMPValue(activePoint.gmpValue)}
                  </SvgText>
                </>
              )}

              {model.points.map((point, index) => (
                <Circle
                  key={`${point.date}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r={activeIndex === index ? 4 : 3}
                  fill={point.gmpValue >= 0 ? growwColors.success : growwColors.error}
                />
              ))}

              {model.rightTicks.map((tickValue, index) => (
                <SvgText
                  key={`tick-${index}`}
                  x={Math.max(width - RIGHT_AXIS_WIDTH + 2, 0)}
                  y={20 + index * ((CHART_HEIGHT - 46) / 4)}
                  fontSize={10}
                  fill="#C6CAD2"
                >
                  {formatGMPValue(tickValue)}
                </SvgText>
              ))}
            </>
          )}

          {!loading && history.length === 0 && (
            <>
              <Line
                x1={12}
                y1={model.emptyLineY}
                x2={Math.max(width - RIGHT_AXIS_WIDTH, 12)}
                y2={model.emptyLineY}
                stroke={growwColors.borderSubtle}
                strokeDasharray="6 6"
              />
              <SvgText
                x={Math.max((width - RIGHT_AXIS_WIDTH) / 2, 16)}
                y={model.emptyLineY - 8}
                fontSize={11}
                fill="#C6CAD2"
                textAnchor="middle"
              >
                {disabledLabel}
              </SvgText>
            </>
          )}
        </Svg>

        {!loading && activePoint && history.length > 0 && (
          <View style={[styles.tooltip, { left: Math.max(activePoint.x - 62, 8), top: Math.max(activePoint.y - 64, 8) }]}>
            <Text style={styles.tooltipDate}>
              {new Date(activePoint.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: '2-digit' })}
            </Text>
            <Text style={styles.tooltipValue}>{formatGMPValue(activePoint.gmpValue)}</Text>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: growwColors.darkSurface,
    borderRadius: 12,
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  latestValue: {
    color: growwColors.textInverse,
    fontSize: 28,
    fontWeight: '800',
  },
  deltaValue: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '600',
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  rangeActive: {
    color: '#111827',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    fontWeight: '700',
  },
  rangeMuted: {
    color: '#E5E7EB',
    opacity: 0.8,
    fontWeight: '700',
    paddingVertical: 6,
  },
  touchLayer: {
    position: 'relative',
    height: CHART_HEIGHT,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#ECEFF3',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  tooltipDate: {
    color: '#111827',
    fontSize: 11,
  },
  tooltipValue: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
})
