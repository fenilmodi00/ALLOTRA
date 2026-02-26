import React from 'react'
import { View } from 'react-native'
import { Text } from '@/components/ui/text'
import { HStack } from '@/components/ui/hstack'
import { Divider } from '@/components/ui/divider'
import { AccordionSection } from './common'
import type { DisplayIPO } from '../../types'

export const IPOSubscriptionDetails = ({ ipo }: { ipo: DisplayIPO }) => {
  return (
    <AccordionSection value="sub-rate" title="Subscription rate">
      {ipo.growwDetails?.subscriptionRates ? (
        <View className="rounded-xl border border-outline-100 p-4 mb-3">
          {ipo.growwDetails.subscriptionRates.filter(r => r.category !== 'TOTAL').map((rate, index) => (
            <HStack key={index} className="justify-between items-center mb-3">
              <Text className="text-typography-500 text-[13px]">{rate.categoryName}</Text>
              <Text className="text-typography-900 font-bold text-[13px] pt-1">
                {rate.subscriptionRate !== undefined ? `${rate.subscriptionRate.toFixed(2)}x` : 'N/A'}
              </Text>
            </HStack>
          ))}
          <Divider className="mb-4 bg-outline-100" />
          <HStack className="justify-between items-center">
            <Text className="text-typography-900 font-bold text-[14px]">Total</Text>
            <Text className="text-typography-900 font-bold text-[14px]">
              {ipo.growwDetails.subscriptionRates.find(r => r.category === 'TOTAL')?.subscriptionRate?.toFixed(2) || 'N/A'}x
            </Text>
          </HStack>
        </View>
      ) : (
        <View className="rounded-xl border border-outline-100 p-4 mb-3">
          <HStack className="justify-between items-center mb-3">
            <Text className="text-typography-500 text-[13px]">Qualified Institutional Buyers</Text>
            <Text className="text-typography-900 font-bold text-[13px] pt-1">{ipo.subscription?.qib !== undefined ? `${ipo.subscription.qib.toFixed(2)}x` : 'N/A'}</Text>
          </HStack>
          <HStack className="justify-between items-center mb-3">
            <Text className="text-typography-500 text-[13px]">Non-Institutional Investor</Text>
            <Text className="text-typography-900 font-bold text-[13px] pt-1">{ipo.subscription?.nii !== undefined ? `${ipo.subscription.nii.toFixed(2)}x` : 'N/A'}</Text>
          </HStack>
          <HStack className="justify-between items-center mb-4">
            <Text className="text-typography-500 text-[13px]">Retail Individual Investor</Text>
            <Text className="text-typography-900 font-bold text-[13px] pt-1">{ipo.subscription?.rii !== undefined ? `${ipo.subscription.rii.toFixed(2)}x` : 'N/A'}</Text>
          </HStack>
          <Divider className="mb-4 bg-outline-100" />
          <HStack className="justify-between items-center">
            <Text className="text-typography-900 font-bold text-[14px]">Total</Text>
            <Text className="text-typography-900 font-bold text-[14px]">{ipo.subscription?.total !== undefined ? `${ipo.subscription.total.toFixed(2)}x` : (ipo.subscriptionStatus || 'N/A')}</Text>
          </HStack>
        </View>
      )}
      <Text className="text-typography-400 text-[11px] font-medium">Subscription rate matching latest data</Text>
    </AccordionSection>
  )
}
