import React, { memo } from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from '@/components/ui/text'
import { PillButton } from '../common/PillButton'
import { growwColors } from '../../design-system/tokens/colors'

interface ErrorViewProps {
  message: string
  onRetry?: () => void
  title?: string
}

export const ErrorView = memo(function ErrorView({ 
  message, 
  onRetry,
  title = 'Error'
}: ErrorViewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⚠️</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <PillButton
          label="Retry"
          onPress={onRetry}
          variant="primary"
          accessibilityLabel="Retry loading"
        />
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: growwColors.background,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: growwColors.text,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: growwColors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
})
