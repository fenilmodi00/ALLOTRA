import React, { memo, useMemo } from 'react'
import { Box } from '@/components/ui/box'
import { HStack } from '@/components/ui/hstack'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { growwColors } from '../../design-system/tokens/colors'
import type { AllotmentStatus } from '../../types'

interface ResultCardProps {
  status: AllotmentStatus
  sharesApplied: number
  sharesAllotted: number
  message?: string
  ipoName?: string
}

const getStatusConfig = (status: AllotmentStatus) => {
  switch (status) {
    case 'ALLOTTED':
      return {
        color: growwColors.success,
        icon: '✓',
        title: 'Allotted!',
        bg: growwColors.successBg,
      }
    case 'NOT_ALLOTTED':
      return {
        color: growwColors.error,
        icon: '✗',
        title: 'Not Allotted',
        bg: growwColors.errorBg,
      }
    case 'PENDING':
      return {
        color: growwColors.warning,
        icon: '⏱',
        title: 'Pending',
        bg: growwColors.warningBg,
      }
    case 'NOT_APPLIED':
      return {
        color: growwColors.textSecondary,
        icon: '—',
        title: 'Not Applied',
        bg: growwColors.backgroundSecondary,
      }
    default:
      return {
        color: growwColors.textSecondary,
        icon: '?',
        title: 'Unknown',
        bg: growwColors.backgroundSecondary,
      }
  }
}

export const ResultCard = memo(function ResultCard({ 
  status, 
  sharesApplied, 
  sharesAllotted, 
  message,
  ipoName,
}: ResultCardProps) {
  const config = useMemo(() => getStatusConfig(status), [status])

  return (
    <Box
      style={{
        borderWidth: 2,
        borderColor: config.color,
        backgroundColor: growwColors.surface,
        borderRadius: 16,
        padding: 20,
      }}
      accessibilityRole="summary"
      accessibilityLabel={`Allotment result: ${config.title}${ipoName ? ` for ${ipoName}` : ''}`}
    >
      <VStack className="items-center gap-4">
        {/* Icon Circle */}
        <Box
          style={{
            backgroundColor: config.bg,
            width: 80,
            height: 80,
            borderRadius: 40,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 40 }} accessibilityElementsHidden>{config.icon}</Text>
        </Box>

        {/* Status Text */}
        <VStack className="items-center gap-1">
          <Text style={{ fontSize: 20, fontWeight: '700', color: config.color }}>
            {config.title}
          </Text>
          {message && (
            <Text style={{ fontSize: 14, color: growwColors.textSecondary, textAlign: 'center' }}>
              {message}
            </Text>
          )}
        </VStack>

        {/* Shares Info */}
        <HStack
          style={{
            width: '100%',
            justifyContent: 'space-between',
            backgroundColor: growwColors.backgroundSecondary,
            padding: 12,
            borderRadius: 8,
          }}
        >
          <VStack style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 12, color: growwColors.textSecondary }}>Applied</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: growwColors.text }}>
              {sharesApplied}
            </Text>
          </VStack>
          <Box style={{ width: 1, backgroundColor: growwColors.border }} />
          <VStack style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 12, color: growwColors.textSecondary }}>Allotted</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: growwColors.text }}>
              {sharesAllotted}
            </Text>
          </VStack>
        </HStack>
      </VStack>
    </Box>
  )
})
