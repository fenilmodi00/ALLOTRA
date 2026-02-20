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

export const IndexCard = memo(function IndexCard({
  indexName,
  value,
  change,
  changePercent,
  isPositive,
}: IndexCardProps) {
  const changeColor = isPositive ? '#00b386' : '#f21717' // Figma colors

  return (
    <Box
      style={{
        backgroundColor: growwColors.surface,
        borderColor: '#d2cdcd',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        width: 169,
        height: 73,
        justifyContent: 'center',
      }}
      accessibilityRole="text"
      accessibilityLabel={`${indexName}, ${value.toFixed(2)}, ${isPositive ? 'up' : 'down'} ${formatPercentage(changePercent)}`}
    >
      <VStack style={{ gap: 2 }}>
        <Text
          style={{
            fontFamily: 'Inter',
            fontWeight: 'bold',
            fontSize: 14,
            color: growwColors.text,
          }}
          numberOfLines={1}
        >
          {indexName}
        </Text>

        <Box style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: 'Inter',
              fontWeight: 'bold',
              fontSize: 14,
              color: growwColors.text,
            }}
            numberOfLines={1}
          >
            {value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </Text>
          <Text style={{ color: changeColor, fontWeight: 'bold', fontSize: 14, marginLeft: 8 }}>
            {isPositive ? '+' : ''} {formatPriceChange(change)}
          </Text>
        </Box>
      </VStack>
    </Box>
  )
})
