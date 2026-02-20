import React, { memo } from 'react'
import { Pressable } from 'react-native'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { growwColors } from '../../design-system/tokens/colors'
import { formatCurrency, formatPriceChange, formatPercentage } from '../../utils/formatters'

interface StockCardProps {
  logoUrl?: string
  stockName: string
  symbol?: string
  price: number
  change: number
  changePercent: number
  isPositive: boolean
  onPress?: () => void
}

// Company logo placeholder component
const CompanyLogo = ({ name, size = 60 }: { name: string; size?: number }) => {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <Box
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: growwColors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: growwColors.border,
      }}
    >
      <Text
        style={{ fontSize: size > 50 ? 18 : 14, fontWeight: '700', color: growwColors.primary }}
      >
        {initials}
      </Text>
    </Box>
  )
}

export const StockCard = memo(function StockCard({
  logoUrl,
  stockName,
  symbol,
  price,
  change,
  changePercent,
  isPositive,
  onPress,
}: StockCardProps) {
  const changeColor = isPositive ? growwColors.success : growwColors.error

  const CardContent = (
    <Box
      style={{
        backgroundColor: growwColors.surface,
        borderColor: growwColors.border,
        borderWidth: 1,
        borderRadius: 13,
        padding: 12,
        width: '48%',
        height: 171,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      {/* Company Logo */}
      <Box style={{ alignSelf: 'flex-start' }}>
        <CompanyLogo name={stockName} size={60} />
      </Box>

      {/* Stock Info */}
      <VStack style={{ gap: 4, flex: 1, justifyContent: 'flex-end' }}>
        <Text
          style={{ fontSize: 14, fontWeight: '500', color: growwColors.text, fontFamily: 'Inter' }}
          numberOfLines={1}
        >
          {stockName}
        </Text>

        <Text
          style={{ fontSize: 15, fontWeight: '700', color: growwColors.text, fontFamily: 'Inter' }}
        >
          ₹{price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </Text>

        <Text
          style={{ fontSize: 14, fontWeight: '500', color: changeColor, fontFamily: 'Inter' }}
        >
          {isPositive ? '+' : ''}₹{Math.abs(change).toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
        </Text>
      </VStack>

      {/* Watchlist Icon */}
      <Box
        style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          width: 22,
          height: 22,
          backgroundColor: growwColors.backgroundSecondary,
          borderRadius: 11,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 12, color: growwColors.textSecondary }}>+</Text>
      </Box>
    </Box>
  )

  if (onPress) {
    return (
      <Pressable 
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${stockName}, price ${formatCurrency(price)}, ${isPositive ? 'up' : 'down'} ${formatPercentage(changePercent)}`}
      >
        {CardContent}
      </Pressable>
    )
  }

  return CardContent
})
