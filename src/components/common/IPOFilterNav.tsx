import React from 'react'
import { Pressable, ScrollView } from 'react-native'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { growwColors } from '../../design-system/tokens/colors'

interface IPOFilterNavProps {
  filters: string[]
  activeFilter: string
  onFilterChange: (filter: string) => void
}

const filterLabels: Record<string, string> = {
  ongoing: 'Ongoing',
  upcoming: 'Upcoming',
  allotted: 'Allotted',
  listed: 'Listed',
}

export const IPOFilterNav = ({ filters, activeFilter, onFilterChange }: IPOFilterNavProps) => {
  return (
    <Box style={{ marginBottom: 20, paddingHorizontal: 18 }}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        {filters.map((filter) => {
          const isActive = activeFilter === filter
          return (
            <Pressable
              key={filter}
              onPress={() => onFilterChange(filter)}
              style={{
                height: 40,
                paddingHorizontal: 20,
                backgroundColor: isActive ? '#d9d9d9' : growwColors.surface,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#d2cdcd',
                justifyContent: 'center',
                alignItems: 'center',
                minWidth: 90,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 'bold',
                  fontSize: 16,
                  color: growwColors.text,
                }}
              >
                {filterLabels[filter] || filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </Box>
  )
}
