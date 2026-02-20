import React from 'react'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { growwColors } from '../../design-system/tokens/colors'

interface LoadingTextProps {
  message?: string
  style?: any
}

export const LoadingText = ({ 
  message = 'Loading...', 
  style 
}: LoadingTextProps) => {
  return (
    <Box style={{ 
      padding: 30, 
      alignItems: 'center', 
      marginBottom: 15,
      ...style 
    }}>
      <Text style={{ color: growwColors.textSecondary, textAlign: 'center' }}>
        {message}
      </Text>
    </Box>
  )
}
