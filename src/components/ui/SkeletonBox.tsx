import React from 'react'
import { ViewStyle } from 'react-native'
import { Skeleton } from './Skeleton'

interface SkeletonBoxProps {
  width: number
  height: number
  borderRadius?: number
  style?: ViewStyle
}

export const SkeletonBox = ({ 
  width, 
  height, 
  borderRadius = 5, 
  style 
}: SkeletonBoxProps) => {
  return (
    <Skeleton
      width={width}
      height={height}
      borderRadius={borderRadius}
      style={style}
    />
  )
}

