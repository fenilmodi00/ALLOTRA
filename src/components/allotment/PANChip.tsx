import React from 'react'
import { Pressable } from 'react-native'
import { HStack } from '@/components/ui/hstack'
import { VStack } from '@/components/ui/vstack'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'
import { CreditCard, Trash2 } from 'lucide-react-native'
import { growwColors } from '../../design-system/tokens/colors'
import type { SavedPAN } from '../../types/allotment.types'

interface PANChipProps {
  pan: SavedPAN
  onRemove: (id: string) => void
}

export function PANChip({ pan, onRemove }: PANChipProps) {
  return (
    <HStack
      style={{
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: growwColors.surface,
        borderWidth: 1,
        borderColor: growwColors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
      }}
    >
      <HStack style={{ alignItems: 'center', gap: 12, flex: 1 }}>
        <Box
          style={{
            backgroundColor: growwColors.primaryLight,
            borderRadius: 8,
            padding: 8,
          }}
        >
          <Icon as={CreditCard} size="sm" color={growwColors.primary} />
        </Box>
        <VStack style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: growwColors.text, letterSpacing: 0.5 }}>
            {pan.pan}
          </Text>
          {pan.nickname ? (
            <Text style={{ fontSize: 12, color: growwColors.textSecondary, marginTop: 1 }}>
              {pan.nickname}
            </Text>
          ) : null}
        </VStack>
      </HStack>

      <Pressable
        onPress={() => onRemove(pan.id)}
        hitSlop={12}
        accessibilityLabel={`Remove PAN ${pan.pan}`}
        accessibilityRole="button"
      >
        <Icon as={Trash2} size="sm" color={growwColors.error} />
      </Pressable>
    </HStack>
  )
}
