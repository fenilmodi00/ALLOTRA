import React from 'react'
import { Pressable } from 'react-native'
import { Box } from '@/components/ui/box'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { Search, Grid, User } from 'lucide-react-native'
import { growwColors } from '../../design-system/tokens/colors'
import { colors } from '../../design-system/tokens';

interface HomeHeaderProps {
  onSearchPress: () => void
  onProfilePress: () => void
}

export const HomeHeader = ({ onSearchPress, onProfilePress }: HomeHeaderProps) => {
  return (
    <Box
      style={{ 
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginBottom: 20,
        backgroundColor: 'white'
      }}
    >
      <Box style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Box 
          style={{ 
            width: 32, 
            height: 32, 
            borderRadius: 16, 
            backgroundColor: growwColors.secondary,
            justifyContent: 'center',
            alignItems: 'center',
          }} 
        >
          <Box 
            style={{ 
              width: 16, 
              height: 8, 
              borderBottomLeftRadius: 16, 
              borderBottomRightRadius: 16, 
              backgroundColor: colors.contentLink 
            }} 
          />
        </Box>
        <Text style={{ fontSize: 24, fontWeight: '700', color: growwColors.text, fontFamily: 'Inter' }}>
          IPOs
        </Text>
      </Box>
      
      <Box style={{ flexDirection: 'row', gap: 15, alignItems: 'center' }}>
        <Pressable onPress={onSearchPress}>
          <Icon as={Search} size="xl" className="h-6 w-6" color={growwColors.text} />
        </Pressable>
        <Pressable>
          <Icon as={Grid} size="xl" className="h-6 w-6" color={growwColors.text} />
        </Pressable>
        <Pressable onPress={onProfilePress}>
          <Box 
            style={{ 
              width: 32, 
              height: 32, 
              backgroundColor: '#f0f0f0', 
              borderRadius: 16,
              overflow: 'hidden',
            }} 
          >
            <Icon as={User} size="xl" className="h-8 w-8" color={growwColors.textSecondary} />
          </Box>
        </Pressable>
      </Box>
    </Box>
  )
}
