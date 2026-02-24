import React, { useCallback } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'

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
  const handlePress = useCallback((filter: string) => {
    onFilterChange(filter)
  }, [onFilterChange])

  return (
    <Box style={{ marginBottom: 16, height: 44, justifyContent: 'center' }}>
      <ScrollView
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          {filters.map((filter) => {
            const isActive = activeFilter === filter
            return (
              <Pressable
                key={filter}
                onPress={() => handlePress(filter)}
                style={[styles.tab, isActive && styles.activeTab]}
              >
                <Text
                  style={[
                    styles.tabText,
                    isActive && styles.activeTabText,
                  ]}
                >
                  {filterLabels[filter] || filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </ScrollView>
    </Box>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  container: {
    flexDirection: 'row',
    height: 40,
    gap: 10,
  },
  tab: {
    height: 40,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 85,
    borderRadius: 20,
    backgroundColor: '#eff2f6',
  },
  activeTab: {
    backgroundColor: '#4e5acc',
  },
  tabText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    includeFontPadding: false,
  },
  activeTabText: {
    fontWeight: '700',
    color: '#ffffff',
  },
})
