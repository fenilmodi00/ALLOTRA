import React, { memo, useCallback } from 'react'
import { 
  Pressable, 
  StyleSheet, 
  View,
  type ViewStyle, 
  type PressableStateCallbackType 
} from 'react-native'
import { Text } from '@/components/ui/text'
import { growwColors } from '../../design-system/tokens/colors'

interface PillButtonProps {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  disabled?: boolean
  icon?: React.ReactNode
  accessibilityLabel?: string
}

const getStyles = (variant: PillButtonProps['variant']) => {
  const bgColor = variant === 'primary' 
    ? growwColors.primary 
    : variant === 'secondary' 
      ? growwColors.backgroundSecondary 
      : 'transparent'
  
  const borderColor = variant === 'primary' 
    ? 'transparent' 
    : growwColors.borderStrong
  
  const textColor = variant === 'primary' 
    ? growwColors.textInverse 
    : growwColors.text

  return { bgColor, borderColor, textColor }
}

export const PillButton = memo(function PillButton({
  label,
  onPress,
  variant = 'secondary',
  disabled = false,
  icon,
  accessibilityLabel,
}: PillButtonProps) {
  const { bgColor, borderColor, textColor } = getStyles(variant)

  const getPressedStyle = useCallback(
    ({ pressed }: PressableStateCallbackType): ViewStyle => ({
      ...styles.button,
      backgroundColor: bgColor,
      borderColor: borderColor,
      borderWidth: variant !== 'primary' ? 1 : 0,
      opacity: disabled ? 0.5 : 1,
      transform: [{ scale: pressed ? 0.98 : 1 }],
    }),
    [bgColor, borderColor, variant, disabled]
  )

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={getPressedStyle}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled }}
    >
      <View style={styles.content}>
        {icon}
        <Text style={[styles.label, { color: textColor }]}>
          {label}
        </Text>
      </View>
    </Pressable>
  )
})

const styles = StyleSheet.create({
  button: {
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 14,
  },
})
