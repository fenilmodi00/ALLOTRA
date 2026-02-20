import React, { memo } from 'react'
import { ActivityIndicator, Pressable } from 'react-native'
import { Text } from '@/components/ui/text'
import { growwColors } from '../../design-system/tokens/colors'

interface CheckButtonProps {
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  title?: string
  accessibilityLabel?: string
}

export const CheckButton = memo(function CheckButton({
  onPress,
  loading = false,
  disabled = false,
  title = 'Check Allotment Status',
  accessibilityLabel,
}: CheckButtonProps) {
  const isDisabled = disabled || loading
  const bgColor = disabled ? growwColors.textTertiary : growwColors.primary

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={{
        backgroundColor: bgColor,
        opacity: disabled ? 0.5 : 1,
        height: 48,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={growwColors.textInverse} />
      ) : (
        <Text style={{ color: growwColors.textInverse, fontWeight: '600', fontSize: 16 }}>
          {title}
        </Text>
      )}
    </Pressable>
  )
})
