import React, { useState, useCallback } from 'react'
import { Pressable } from 'react-native'
import { Text } from '@/components/ui/text'
import { HStack } from '@/components/ui/hstack'

export interface TabItem {
  key: string
  label: string
}

interface TabGroupProps {
  tabs: TabItem[]
  defaultTab?: string
  onTabChange?: (key: string) => void
}

export function TabGroup({ tabs, defaultTab, onTabChange }: TabGroupProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.key)

  const handleTabPress = useCallback((key: string) => {
    setActiveTab(key)
    onTabChange?.(key)
  }, [onTabChange])

  return (
    <HStack className="gap-3 mb-6">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key
        return (
          <Pressable
            key={tab.key}
            onPress={() => handleTabPress(tab.key)}
            className={`px-5 py-1.5 rounded-full border ${
              isActive 
                ? 'border-typography-900 bg-typography-900' 
                : 'border-outline-200 bg-transparent'
            }`}
          >
            <Text 
              className={`font-medium text-[13px] ${
                isActive ? 'text-white' : 'text-typography-500'
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        )
      })}
    </HStack>
  )
}

interface TabPanelProps {
  children: React.ReactNode
  activeKey: string
  tabKey: string
}

export function TabPanel({ children, activeKey, tabKey }: TabPanelProps) {
  if (activeKey !== tabKey) {
    return null
  }
  return <>{children}</>
}
