import React from 'react'
import { View } from 'react-native'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { AccordionSection } from './common'
import type { DisplayIPO } from '../../types'

export const IPOApplicationDetails = ({ ipo }: { ipo: DisplayIPO }) => {
  return (
    <AccordionSection value="app-details" title="Application details">
      <Text className="text-typography-500 text-[13px] mb-4">
        For {ipo.growwDetails?.companyName || ipo.name}, eligible investors can apply as Regular.
      </Text>
      <VStack className="gap-5">
        {ipo.categories?.map((cat, index) => (
          <View key={index}>
            <Text className="text-typography-900 font-bold text-[14px] mb-1">
              {cat.categoryDetails?.categoryLabel || cat.categoryLabel || `Apply as ${cat.category}`}
            </Text>
            {cat.categoryDetails?.categoryInfo?.map((info: string, i: number) => (
              <Text key={i} className="text-typography-500 text-[12px]">{info}</Text>
            )) || (
                <Text className="text-typography-500 text-[12px]">
                  Price is Rs {cat.minPrice || ipo.priceRange?.min || 0} - {cat.maxPrice || ipo.priceRange?.max || 0}. {cat.categorySubText || ''}
                </Text>
              )}
          </View>
        ))}
        {!ipo.categories?.length && (
          <>
            <View>
              <Text className="text-typography-900 font-bold text-[14px] mb-1">Apply as Regular</Text>
              <Text className="text-typography-500 text-[12px]">upto ₹2,00,000</Text>
            </View>
            <View>
              <Text className="text-typography-900 font-bold text-[14px] mb-1">Apply as High Networth Individual</Text>
              <Text className="text-typography-500 text-[12px]">between ₹2,00,000 - ₹5,00,000</Text>
            </View>
          </>
        )}
      </VStack>
    </AccordionSection>
  )
}
