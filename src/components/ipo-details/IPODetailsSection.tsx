import React from 'react'
import { View, Pressable, Linking } from 'react-native'
import { Text } from '@/components/ui/text'
import { HStack } from '@/components/ui/hstack'
import { Box } from '@/components/ui/box'
import { Icon } from '@/components/ui/icon'
import { FileText } from 'lucide-react-native'
import { AccordionSection } from './common'
import type { DisplayIPO } from '../../types'
import { formatIssueSize } from '../../utils/formatters'

export const IPODetailsSection = ({ ipo }: { ipo: DisplayIPO }) => {
  const formatFinancialValue = (value?: number) => {
    if (!value) return 'N/A'
    return value >= 100 ? `${(value / 100).toFixed(2)}Cr` : `${value}Cr`
  }

  return (
    <AccordionSection value="ipo-details" title="IPO details">
      <View className="flex-row flex-wrap justify-between gap-y-6">
        <View className="w-1/2 pr-4">
          <Text className="text-typography-500 text-xs mb-1">Minimum Investment</Text>
          <Text className="text-typography-900 font-bold text-sm">₹{(ipo.growwDetails?.minPrice && ipo.growwDetails?.lotSize)
            ? (ipo.growwDetails.minPrice * ipo.growwDetails.lotSize).toLocaleString()
            : (ipo.minInvestment?.toLocaleString() || 'N/A')} </Text>
        </View>
        <View className="w-1/2 ">
          <Text className="text-typography-500 text-xs mb-1">Price range</Text>
          <Text className="text-typography-900 font-bold text-sm">₹{ipo.priceRange?.min || 0} - ₹{ipo.priceRange?.max || 0}</Text>
        </View>
        <View className="w-1/2 pr-4">
          <Text className="text-typography-500 text-xs mb-1">Lot size</Text>
          <Text className="text-typography-900 font-bold text-sm">{ipo.lotSize || 0}</Text>
        </View>
        <View className="w-1/2 ">
          <Text className="text-typography-500 text-xs mb-1">Issue size</Text>
          <Text className="text-typography-900 font-bold text-sm">
            {ipo.growwDetails?.issueSize
              ? formatFinancialValue(ipo.growwDetails.issueSize / 10000000)
              : (formatIssueSize(ipo.issueSize) || 'N/A')}
          </Text>
        </View>
        <Box className="w-1/2 pt-2">
          <Text className="text-typography-500 text-xs mb-2">IPO document</Text>
          {ipo.documentUrl ? (
            <Pressable onPress={() => Linking.openURL(ipo.documentUrl!)}>
              <HStack className="items-center gap-1">
                <Text className="text-[#00b386] font-bold text-[13px]">RHP PDF</Text>
                <Icon as={FileText} className="text-[#00b386] w-3 h-3" />
              </HStack>
            </Pressable>
          ) : (
            <Text className="text-typography-900 font-bold text-sm">N/A</Text>
          )}
        </Box>
      </View>
    </AccordionSection>
  )
}
