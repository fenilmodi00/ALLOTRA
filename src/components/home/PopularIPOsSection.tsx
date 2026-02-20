import React from 'react'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { IPOSection } from '../ipo'
import { SkeletonBox } from '../ui'
import { growwColors } from '../../design-system/tokens/colors'
import type { DisplayIPO } from '../../types'

interface PopularIPOsSectionProps {
  ipos: DisplayIPO[]
  showMore: boolean
  onToggleShowMore: () => void
  onIPOPress: (ipo: DisplayIPO) => void
  loading: boolean
  dynamicSpacing?: number // Add dynamic spacing prop
}

export const PopularIPOsSection = ({
  ipos,
  showMore,
  onToggleShowMore,
  onIPOPress,
  loading,
  dynamicSpacing = 20 // Reduced default spacing
}: PopularIPOsSectionProps) => {
  return (
    <Box style={{ 
      marginBottom: 20, 
      paddingHorizontal: 18,
      marginTop: dynamicSpacing // Use dynamic spacing
    }}>
      <Text 
        style={{ marginBottom: 15, fontSize: 24, fontWeight: '700', color: growwColors.text, fontFamily: 'Inter' }}
      >
        Most Popular IPOs
      </Text>
      
      {loading ? (
        <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' }}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonBox
              key={idx}
              width={171}
              height={171}
              borderRadius={13}
            />
          ))}
        </Box>
      ) : ipos.length > 0 ? (
        <IPOSection
          title="" // Empty title since we show it above
          ipos={ipos}
          showMore={showMore}
          onToggleShowMore={onToggleShowMore}
          onIPOPress={onIPOPress}
          sectionKey="popular"
        />
      ) : (
        <Box style={{ width: '100%', padding: 10, alignItems: 'center' }}>
          <Text style={{ color: growwColors.textSecondary, textAlign: 'center' }}>
            IPO data not available
          </Text>
        </Box>
      )}
    </Box>
  )
}
