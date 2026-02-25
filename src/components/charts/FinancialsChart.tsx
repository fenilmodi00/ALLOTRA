import React, { useState } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg'
import { Text } from '@/components/ui/text'
import { HStack } from '@/components/ui/hstack'
import { Pressable } from '@/components/ui/pressable'
import { growwColors } from '../../design-system/tokens/colors'
import type { IPOFinancial } from '../../types/ipo.types'

interface FinancialsChartProps {
    financials: IPOFinancial[]
}

type TabType = 'Revenue' | 'Profit' | 'Total Assets'
const TABS: TabType[] = ['Revenue', 'Profit', 'Total Assets']

const CHART_HEIGHT = 200
const BAR_WIDTH = 24
const CHART_PADDING_TOP = 40
const CHART_PADDING_BOTTOM = 30
const CHART_PADDING_HORIZONTAL = 20

// Overall screen width approximation, accounting for screen padding
const screenWidth = Dimensions.get('window').width - 32

export function FinancialsChart({ financials }: FinancialsChartProps) {
    const [activeTab, setActiveTab] = useState<TabType>('Revenue')

    // Filter valid data
    const validData = financials.filter(item => {
        switch (activeTab) {
            case 'Revenue': return item.revenue != null
            case 'Profit': return item.profit != null
            case 'Total Assets': return item.totalAssets != null
            default: return false
        }
    })

    // Map to numeric values and sort ascending by year
    const chartData = validData.map(item => {
        let value = 0
        switch (activeTab) {
            case 'Revenue': value = Number(item.revenue) || 0; break
            case 'Profit': value = Number(item.profit) || 0; break
            case 'Total Assets': value = Number(item.totalAssets) || 0; break
        }
        return {
            year: item.year,
            value: value,
        }
    }).sort((a, b) => a.year.localeCompare(b.year))

    // Reduce width to account for the border/padding we add
    const containerPadding = 16
    const width = screenWidth - (containerPadding * 2)

    // Calculate scales
    const maxValueRaw = Math.max(...chartData.map(d => d.value), 0)
    const minValueRaw = Math.min(...chartData.map(d => d.value), 0)

    const maxValue = maxValueRaw === 0 && minValueRaw === 0 ? 1 : maxValueRaw * 1.15
    const minValue = minValueRaw < 0 ? minValueRaw * 1.25 : 0

    const range = maxValue - minValue || 1
    const plotHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM
    const plotWidth = width - CHART_PADDING_HORIZONTAL * 2

    const zeroY = CHART_HEIGHT - CHART_PADDING_BOTTOM - ((0 - minValue) / range) * plotHeight

    const getBarHeight = (val: number) => {
        return (Math.abs(val) / range) * plotHeight
    }

    const getBarX = (index: number, total: number) => {
        if (total === 1) return width / 2 - BAR_WIDTH / 2
        const spacing = plotWidth / Math.max(total - 1, 1) // prevent div by 0
        return CHART_PADDING_HORIZONTAL + (index * spacing) - (BAR_WIDTH / 2)
    }

    if (financials.length === 0) {
        return null
    }

    return (
        <View style={styles.container} className="border border-outline-100 rounded-xl p-4 my-2">
            {/* Tabs */}
            <HStack className="mb-4 justify-between w-full">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab
                    return (
                        <Pressable
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            className={`px-2 py-1.5 rounded-full border ${isActive ? 'bg-white border-typography-900 border-[1.5px]' : 'bg-white border-outline-200'} items-center justify-center flex-1 mx-1`}
                        >
                            <Text className={`text-[12px] font-medium text-center flex-shrink-0 ${isActive ? 'text-typography-900' : 'text-typography-500'}`} numberOfLines={1}>
                                {tab}
                            </Text>
                        </Pressable>
                    )
                })}
            </HStack>

            <Text className="text-typography-500 text-xs mb-4 ml-1">All values are in Cr</Text>

            {/* Chart Area */}
            <View style={{ height: CHART_HEIGHT, width: '100%' }}>
                {chartData.length > 0 && (
                    <Svg width={width} height={CHART_HEIGHT}>
                        {/* Base line */}
                        <Line
                            x1={CHART_PADDING_HORIZONTAL - 10}
                            y1={zeroY}
                            x2={width - CHART_PADDING_HORIZONTAL + 10}
                            y2={zeroY}
                            stroke={growwColors.border}
                            strokeWidth={1}
                        />

                        {/* Bars and Labels */}
                        {chartData.map((data, index) => {
                            const barHeight = getBarHeight(data.value)
                            const x = getBarX(index, chartData.length)
                            const isPositive = data.value >= 0
                            const y = isPositive ? zeroY - barHeight : zeroY

                            const labelY = isPositive ? (y - 8) : (y + barHeight + 12)

                            return (
                                <React.Fragment key={data.year}>
                                    {/* The bar */}
                                    <Rect
                                        x={x}
                                        y={y}
                                        width={BAR_WIDTH}
                                        height={barHeight}
                                        fill={isPositive ? growwColors.success : (growwColors.error || '#eb5b3c')}
                                        rx={2}
                                        ry={2}
                                    />

                                    {/* Value Label */}
                                    <SvgText
                                        x={x + BAR_WIDTH / 2}
                                        y={labelY}
                                        fontSize="11"
                                        fill={growwColors.text}
                                        textAnchor="middle"
                                        fontWeight="500"
                                    >
                                        {data.value.toFixed(2)}
                                    </SvgText>

                                    {/* Year Label at bottom */}
                                    <SvgText
                                        x={x + BAR_WIDTH / 2}
                                        y={CHART_HEIGHT - 5}
                                        fontSize="11"
                                        fill={growwColors.textSecondary}
                                        textAnchor="middle"
                                    >
                                        {data.year}
                                    </SvgText>
                                </React.Fragment>
                            )
                        })}
                    </Svg>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#fff',
    }
})
