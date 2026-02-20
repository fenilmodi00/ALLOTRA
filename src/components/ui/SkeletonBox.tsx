import React from 'react'
import { Box } from '@/components/ui/box'
import { growwColors } from '../../design-system/tokens/colors'

interface SkeletonBoxProps {
  width: number
  height: number
  borderRadius?: number
  style?: any
}

export const SkeletonBox = ({ 
  width, 
  height, 
  borderRadius = 5, 
  style 
}: SkeletonBoxProps) => {
  return (
    <Box 
      style={{ 
        width, 
        height, 
        backgroundColor: growwColors.surface, 
        borderRadius,
        borderWidth: 1,
        borderColor: growwColors.border,
        ...style
      }} 
    />
  )
}
