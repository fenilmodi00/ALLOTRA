import React from 'react'
import { HStack } from '@/components/ui/hstack'
import { VStack } from '@/components/ui/vstack'
import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'
import { CheckCircle, XCircle, Clock } from 'lucide-react-native'
import { growwColors } from '../../design-system/tokens/colors'
import type { PANResult } from '../../types/allotment.types'

const STATUS_CONFIG = {
  ALLOTTED: {
    label: 'Allotted',
    color: growwColors.success,
    bg: growwColors.successBg,
    border: growwColors.successBorder,
    Icon: CheckCircle,
  },
  NOT_ALLOTTED: {
    label: 'Not Allotted',
    color: growwColors.error,
    bg: growwColors.errorBg,
    border: growwColors.errorBorder,
    Icon: XCircle,
  },
  PENDING: {
    label: 'Pending',
    color: growwColors.warning,
    bg: growwColors.warningBg,
    border: growwColors.warningBorder,
    Icon: Clock,
  },
} as const

interface ResultRowProps {
  result: PANResult
}

export function ResultRow({ result }: ResultRowProps) {
  const cfg = result.status ? STATUS_CONFIG[result.status] : null
  if (!cfg) return null

  return (
    <HStack
      style={{
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: cfg.bg,
        borderWidth: 1,
        borderColor: cfg.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
      }}
    >
      <HStack style={{ alignItems: 'center', gap: 10, flex: 1 }}>
        <Icon as={cfg.Icon} size="sm" color={cfg.color} />
        <VStack style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: growwColors.text, letterSpacing: 0.5 }}>
            {result.pan}
          </Text>
          <Text style={{ fontSize: 12, color: growwColors.textSecondary, marginTop: 1 }}>
            {result.message}
          </Text>
        </VStack>
      </HStack>
      <VStack style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: cfg.color }}>
          {cfg.label}
        </Text>
        {result.status === 'ALLOTTED' && (
          <Text style={{ fontSize: 11, color: growwColors.textSecondary, marginTop: 1 }}>
            {result.shares} shares
          </Text>
        )}
      </VStack>
    </HStack>
  )
}
