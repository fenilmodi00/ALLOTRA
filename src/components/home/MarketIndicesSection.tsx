import React from 'react'
import { ScrollView, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { Box } from '@/components/ui/box'
import { IndexCard } from '../ipo'
import { SkeletonBox } from '../ui'
import type { MarketIndex } from '../../types'

interface MarketIndicesSectionProps {
  indices: MarketIndex[]
  loading: boolean
}

export const MarketIndicesSection = ({ indices, loading }: MarketIndicesSectionProps) => {
  const showSkeleton = loading && indices.length === 0

  return (
    <Box style={{ marginBottom: 20 }}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {showSkeleton ? (
          <Animated.View 
            entering={FadeIn.duration(200)} 
            exiting={FadeOut.duration(150)}
            style={{ flexDirection: 'row', gap: 12 }}
          >
            {Array.from({ length: 3 }).map((_, idx) => (
              <SkeletonBox
                key={idx}
                width={160}
                height={73}
              />
            ))}
          </Animated.View>
        ) : indices.length > 0 ? (
          <Animated.View 
            entering={FadeIn.duration(300)} 
            style={{ flexDirection: 'row', gap: 12 }}
          >
            {indices.map((index) => (
              <IndexCard
                key={index.id}
                indexName={index.name}
                value={index.value}
                change={index.change}
                changePercent={index.change_percent}
                isPositive={index.is_positive}
              />
            ))}
          </Animated.View>
        ) : null}
      </ScrollView>
    </Box>
  )
}
