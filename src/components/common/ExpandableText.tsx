import React, { useState, useCallback } from 'react'
import { Pressable, Text as RNText, View } from 'react-native'
import { Text } from '@/components/ui/text'

interface ExpandableTextProps {
  content: string
  maxLength?: number
}

export function ExpandableText({ content, maxLength = 150 }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const shouldTruncate = content.length > maxLength
  const displayText = isExpanded || !shouldTruncate 
    ? content 
    : content.slice(0, maxLength).trim() + '...'

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  if (!content) {
    return null
  }

  return (
    <View>
      <Text className="text-typography-600 text-[13px] leading-relaxed mb-2">
        {displayText}
      </Text>
      {shouldTruncate && (
        <Pressable onPress={toggleExpand}>
          <Text className="font-bold text-typography-900 text-[13px]">
            {isExpanded ? 'Show less' : 'Read more'}
          </Text>
        </Pressable>
      )}
    </View>
  )
}
