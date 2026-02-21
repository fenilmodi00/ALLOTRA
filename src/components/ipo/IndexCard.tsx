import React, { memo } from 'react'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { growwColors } from '../../design-system/tokens/colors'
import { formatPriceChange, formatPercentage } from '../../utils/formatters'

interface IndexCardProps {
  indexName: string
  value: number
  change: number
  changePercent: number
  isPositive: boolean
}

/**
 * IndexCard - Groww-style flat index card.
 *
 * Design specs from Figma node 1:6077 (Index 1 / Index 2):
 * - Size: ~195 wide x 68 tall
 * - borderRadius: 10, borderWidth: 1, borderColor: #e8e8e8
 * - No shadows or elevation
 * - Name: Roboto Medium 13px (#000)
 * - Value: Roboto Regular 13px (#000)
 * - Change: Roboto SemiBold 13px (#f35d5d or #00b386)
 */
export const IndexCard = memo(function IndexCard({
  indexName,
  value,
  change,
  changePercent,
  isPositive,
}: IndexCardProps) {
  const changeColor = isPositive ? growwColors.success : growwColors.error
  const changeSign = isPositive ? '+' : ''

  return (
    <Box
      style={{
        backgroundColor: growwColors.surface,
        borderColor: growwColors.border,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flex: 1,
        height: 68,
        justifyContent: 'center',
      }}
      accessibilityRole="text"
      accessibilityLabel={`${indexName}, ${value.toFixed(2)}, ${isPositive ? 'up' : 'down'} ${formatPercentage(changePercent)}`}
    >
      <VStack style={{ gap: 3 }}>
        {/* Roboto Medium 13px — index name */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: '500',
            color: growwColors.text,
          }}
          numberOfLines={1}
        >
          {indexName}
        </Text>

        {/* Value + change on same row */}
        <Box style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {/* Roboto Regular 13px — index value */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: '400',
              color: growwColors.text,
            }}
            numberOfLines={1}
          >
            {value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </Text>

          {/* Roboto SemiBold 13px — change amount and percent */}
          <Text style={{ fontSize: 13, fontWeight: '600', color: changeColor }}>
            {changeSign}{formatPriceChange(Math.abs(change))} ({changeSign}{Math.abs(changePercent).toFixed(2)}%)
          </Text>
        </Box>
      </VStack>
    </Box>
  )
})
