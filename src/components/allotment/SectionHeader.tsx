import React from 'react'
import { VStack } from '@/components/ui/vstack'
import { Text } from '@/components/ui/text'
import { growwColors } from '../../design-system/tokens/colors'

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <VStack style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: growwColors.text, fontFamily: 'Inter_700Bold' }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{ fontSize: 12, color: growwColors.textSecondary, marginTop: 2 }}>
          {subtitle}
        </Text>
      )}
    </VStack>
  )
}
