import React, { memo, useCallback, useState } from 'react'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { TextInput, StyleSheet } from 'react-native'
import { growwColors } from '../../design-system/tokens/colors'
import { formatPANInput, validatePAN } from '../../utils/validators'

interface PANInputProps {
  value: string
  onChangeText: (text: string) => void
  error?: string
  placeholder?: string
  label?: string
  validateOnBlur?: boolean
  onValidationChange?: (isValid: boolean) => void
}

export const PANInput = memo(function PANInput({ 
  value, 
  onChangeText, 
  error: externalError, 
  placeholder = 'Enter PAN Number', 
  label = 'PAN Number',
  validateOnBlur = true,
  onValidationChange,
}: PANInputProps) {
  const [internalError, setInternalError] = useState<string | undefined>()
  const [isFocused, setIsFocused] = useState(false)

  const error = externalError || internalError

  const handleChangeText = useCallback((text: string) => {
    const formatted = formatPANInput(text)
    onChangeText(formatted)
    // Clear error when user starts typing
    if (internalError) setInternalError(undefined)
  }, [onChangeText, internalError])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    if (validateOnBlur && value.length > 0) {
      const result = validatePAN(value)
      if (!result.isValid) {
        setInternalError(result.error)
        onValidationChange?.(false)
      } else {
        setInternalError(undefined)
        onValidationChange?.(true)
      }
    }
  }, [value, validateOnBlur, onValidationChange])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
  }, [])

  const borderColor = error 
    ? growwColors.error 
    : isFocused 
      ? growwColors.borderFocus 
      : growwColors.border

  return (
    <VStack className="w-full gap-1">
      {label && (
        <Text style={{ fontSize: 14, fontWeight: '600', color: growwColors.text }}>
          {label}
        </Text>
      )}
      
      <Box
        style={{
          borderWidth: isFocused ? 2 : 1,
          borderColor,
          borderRadius: 8,
          backgroundColor: growwColors.surface,
        }}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={growwColors.textTertiary}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={10}
          keyboardType="default"
          returnKeyType="done"
          accessibilityLabel={label}
          accessibilityHint="Enter your 10-character PAN number"
          accessibilityState={{ disabled: false }}
        />
      </Box>
      
      {error && (
        <Text style={{ color: growwColors.error, fontSize: 12 }} accessibilityRole="alert">
          {error}
        </Text>
      )}
      
      {!error && value.length > 0 && value.length < 10 && (
        <Text style={{ color: growwColors.textTertiary, fontSize: 12 }}>
          {10 - value.length} characters remaining
        </Text>
      )}
    </VStack>
  )
})

const styles = StyleSheet.create({
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: growwColors.text,
    fontFamily: 'Roboto',
  },
})
