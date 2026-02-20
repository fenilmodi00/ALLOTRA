import React, { memo } from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from '@/components/ui/text'
import { growwColors } from '../../design-system/tokens/colors'

interface EmptyStateProps {
  title: string
  message: string
  emoji?: string
}

export const EmptyState = memo(function EmptyState({ 
  title, 
  message,
  emoji = '📭'
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: growwColors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: growwColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
})
