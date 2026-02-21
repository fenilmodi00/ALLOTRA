import React, { memo } from 'react'
import { Image as RNImage, Pressable } from 'react-native'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { growwColors } from '../../design-system/tokens/colors'
import { formatCurrency, formatPercentage } from '../../utils/formatters'

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

/**
 * Squircle logo matching Groww Figma design (node 1:6097).
 * borderRadius: 12 on a 38x38 box gives the characteristic Groww "squircle" logo look.
 */
const CompanyLogo = ({ logoUrl, name, size = 38 }: { logoUrl?: string; name: string; size?: number }) => {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()

  if (logoUrl) {
    return (
      <Box
        style={{
          width: size,
          height: size,
          borderRadius: 12,
          backgroundColor: '#f8f9fa',
          borderWidth: 1,
          borderColor: growwColors.border,
          overflow: 'hidden',
        }}
      >
        <RNImage
          source={{ uri: logoUrl }}
          style={{ width: size, height: size, borderRadius: 12 }}
          resizeMode="contain"
        />
      </Box>
    )
  }

  return (
    <Box
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        backgroundColor: growwColors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: growwColors.border,
      }}
    >
      <Text style={{ fontSize: 14, fontWeight: '600', color: growwColors.primary }}>
        {initials}
      </Text>
    </Box>
  )
}

/**
 * StockCard - Groww-style flat card for stock/IPO grid sections.
 *
 * Design specs from Figma node 1:6097 (Most bought Cards):
 * - borderRadius: 10, borderWidth: 1, borderColor: #e8e8e8
 * - No shadows or elevation
 * - Logo: 38x38 squircle (borderRadius: 12), top-left at 14px inset
 * - Name: Roboto Medium 16px (#000)
 * - Price: Roboto Regular 15px (#000)
 * - Change: Roboto SemiBold 13px (#00b386 or #f35d5d)
 */
export const StockCard = memo(function StockCard({
  logoUrl,
  stockName,
  price,
  change,
  changePercent,
  isPositive,
  onPress,
}: StockCardProps) {
  const changeColor = isPositive ? growwColors.success : growwColors.error
  const changeSign = isPositive ? '+' : ''

  const CardContent = (
    // Flat card: no shadow, no elevation — pure border-only aesthetic
    <Box
      style={{
        backgroundColor: growwColors.surface,
        borderColor: growwColors.border,
        borderWidth: 1,
        borderRadius: 10,
        padding: 14,
        width: '48%',
        height: 160,
        justifyContent: 'space-between',
      }}
    >
      {/* Logo top-left, squircle shape */}
      <Box style={{ alignSelf: 'flex-start' }}>
        <CompanyLogo logoUrl={logoUrl} name={stockName} size={38} />
      </Box>

      {/* Text stack at bottom */}
      <VStack style={{ gap: 2 }}>
        {/* Roboto Medium 16px — company name */}
        <Text
          style={{ fontSize: 16, fontWeight: '500', color: growwColors.text }}
          numberOfLines={1}
        >
          {stockName}
        </Text>

        {/* Roboto Regular 15px — current price */}
        <Text style={{ fontSize: 15, fontWeight: '400', color: growwColors.text }}>
          ₹{price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </Text>

        {/* Roboto SemiBold 13px — change with sign */}
        <Text style={{ fontSize: 13, fontWeight: '600', color: changeColor }}>
          {changeSign}₹{Math.abs(change).toFixed(2)} ({changeSign}{changePercent.toFixed(2)}%)
        </Text>
      </VStack>
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
