import React from 'react'
import { ScrollView } from 'react-native'
import { Box } from '@/components/ui/box'
import { IndexCard } from '../ipo'
import { SkeletonBox } from '../ui'
import type { MarketIndex } from '../../types'

interface MarketIndicesSectionProps {
  indices: MarketIndex[]
  loading: boolean
}

const FALLBACK_INDICES = [
  { id: 'nifty50', name: 'NIFTY 50', value: 21453.95, change: 125.30, change_percent: 0.59, is_positive: true },
  { id: 'sensex', name: 'SENSEX', value: 71315.09, change: 418.75, change_percent: 0.59, is_positive: true },
  { id: 'banknifty', name: 'BANK NIFTY', value: 52191.50, change: -16.00, change_percent: -0.03, is_positive: false },
]

export const MarketIndicesSection = ({ indices, loading }: MarketIndicesSectionProps) => {
  const displayIndices = indices.length > 0 ? indices : FALLBACK_INDICES

  return (
    <Box style={{ marginBottom: 20 }}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        <Box style={{ flexDirection: 'row', gap: 12 }}>
          {loading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, idx) => (
              <SkeletonBox
                key={idx}
                width={160}
                height={73}
              />
            ))
          ) : (
            displayIndices.map((index, idx) => (
              <IndexCard
                key={index.id}
                indexName={index.name}
                value={index.value}
                change={index.change}
                changePercent={index.change_percent}
                isPositive={index.is_positive}
              />
            ))
          )}
        </Box>
      </ScrollView>
    </Box>
  )
}
