import React from 'react'
import { Pressable, ScrollView } from 'react-native'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { growwColors } from '../../design-system/tokens/colors'

interface TabBarProps {
    tabs: string[]
    activeTab: string
    onTabChange: (tab: string) => void
}

export const TabBar = ({ tabs, activeTab, onTabChange }: TabBarProps) => {
    return (
        <Box style={{ marginBottom: 10, height: 50 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                <Box style={{ flexDirection: 'row', gap: 15, alignItems: 'center' }}>
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab
                        return (
                            <Pressable
                                key={tab}
                                onPress={() => onTabChange(tab)}
                                style={{
                                  paddingVertical: 8,
                                  paddingHorizontal: 16,
                                  borderBottomWidth: isActive ? 2 : 0,
                                  borderBottomColor: growwColors.primary,
                                  backgroundColor: isActive ? 'rgba(78, 90, 204, 0.08)' : 'transparent',
                                  borderRadius: 20,
                                  justifyContent: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                      fontFamily: 'Roboto',
                                      fontWeight: isActive ? '600' : '500',
                                      fontSize: 14,
                                      color: isActive ? growwColors.primary : growwColors.textSecondary,
                                    }}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </Text>
                            </Pressable>
                        )
                    })}
                </Box>
            </ScrollView>
        </Box>
    )
}
