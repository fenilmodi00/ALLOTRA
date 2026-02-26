import React from 'react'
import { View } from 'react-native'
import { Text } from '@/components/ui/text'
import { HStack } from '@/components/ui/hstack'
import { AccordionSection } from './common'
import { GMPWeekInteractiveChart } from '../charts/GMPWeekInteractiveChart'
import type { DisplayIPO, GMPHistoryPoint } from '../../types'

interface IPOGMPTrendProps {
  ipo: DisplayIPO
  history: GMPHistoryPoint[]
  loading: boolean
}

export const IPOGMPTrend = ({ ipo, history, loading }: IPOGMPTrendProps) => {
  if (history.length === 0 && !ipo.gmp) return null;

  return (
    <AccordionSection value="gmp-chart" title="GMP Trend">
      <View className="mb-4">
        {ipo.gmp && (
          <HStack className="justify-between items-center mb-4">
            <View>
              <Text className="text-typography-500 text-xs">Grey Market Premium</Text>
              <Text className="text-typography-900 font-bold text-lg">
                {ipo.gmp.value !== undefined ? `₹${ipo.gmp.value}` : 'N/A'}
              </Text>
            </View>
            <View>
              <Text className="text-typography-500 text-xs">Estimated Listing</Text>
              <Text className="text-typography-900 font-bold text-lg">
                {ipo.gmp.estimatedListing !== undefined ? `₹${ipo.gmp.estimatedListing}` : 'N/A'}
              </Text>
            </View>
            <View>
              <Text className="text-typography-500 text-xs">Gain %</Text>
              <Text className={`font-bold text-lg ${(ipo.gmp.gainPercent || 0) >= 0 ? 'text-success-500' : 'text-error-500'}`}>
                {ipo.gmp.gainPercent !== undefined ? `${ipo.gmp.gainPercent.toFixed(2)}%` : 'N/A'}
              </Text>
            </View>
          </HStack>
        )}
        {!loading && history.length > 0 ? (
          <View className="bg-white rounded-lg overflow-hidden">
            <GMPWeekInteractiveChart history={history} />
          </View>
        ) : loading ? (
          <View className="h-[100px] items-center justify-center">
            <Text className="text-typography-400 text-[13px]">Loading GMP data...</Text>
          </View>
        ) : null}
      </View>
    </AccordionSection>
  )
}
