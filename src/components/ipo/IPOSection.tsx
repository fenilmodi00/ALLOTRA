import React, { memo, useMemo } from 'react'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { growwColors } from '../../design-system/tokens/colors'
import { IPOStockCard } from './IPOStockCard'
import { PillButton } from '../common'
import type { DisplayIPO } from '../../types'

interface IPOSectionProps {
  title: string
  ipos: DisplayIPO[]
  showMore: boolean
  onToggleShowMore: () => void
  onIPOPress: (ipo: DisplayIPO) => void
  onCheckStatus?: (ipo: DisplayIPO) => void
  showCheckButton?: boolean
  sectionKey: string
}

export const IPOSection = memo(function IPOSection({
  title,
  ipos,
  showMore,
  onToggleShowMore,
  onIPOPress,
  onCheckStatus,
  showCheckButton = false,
  sectionKey
}: IPOSectionProps) {
  const displayIPOs = useMemo(() => {
    const maxItems = showMore ? 20 : 10
    return ipos.slice(0, Math.min(ipos.length, maxItems))
  }, [ipos, showMore])

  const showMoreCount = useMemo(() => {
    return Math.min(ipos.length - 10, 10)
  }, [ipos.length])

  if (ipos.length === 0) {
    return (
      <Box style={{ marginBottom: 10 }}>
        {title ? (
          <Text style={{ marginBottom: 15, fontSize: 18, fontWeight: '700', color: growwColors.text, fontFamily: 'Roboto' }}>
            {title}
          </Text>
        ) : null}
        <Box style={{ 
          padding: 15,
          alignItems: 'center',
          backgroundColor: growwColors.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: growwColors.border
        }}>
          <Text style={{ color: growwColors.textSecondary, textAlign: 'center', fontSize: 16 }}>
            No IPOs available at the moment
          </Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box style={{ marginBottom: 10 }}>
      {title ? (
        <Text style={{ marginBottom: 15, fontSize: 18, fontWeight: '700', color: growwColors.text, fontFamily: 'Roboto' }}>
          {title}
        </Text>
      ) : null}
      
      <Box style={{ 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: 12, 
        justifyContent: 'space-between' 
      }}>
        {displayIPOs.map((ipo, index) => {
          // Generate a simple unique key for production
          const uniqueKey = `${sectionKey}-${ipo.id || ipo.name?.replace(/\s+/g, '') || 'unknown'}-${index}`
          return (
            <IPOStockCard
              key={uniqueKey}
              ipo={ipo}
              onPress={() => onIPOPress(ipo)}
              showCheckButton={showCheckButton}
              onCheckStatus={onCheckStatus ? () => onCheckStatus(ipo) : undefined}
            />
          )
        })}
      </Box>
      
      {ipos.length > 10 && (
        <Box style={{ marginTop: 16, alignItems: 'center' }}>
          <PillButton
            label={showMore ? 'Show Less' : `Show ${showMoreCount} More`}
            onPress={onToggleShowMore}
            variant={showMore ? 'outline' : 'primary'}
          />
        </Box>
      )}
    </Box>
  )
})
