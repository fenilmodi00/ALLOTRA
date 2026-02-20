import React from 'react'
import { Box } from '@/components/ui/box'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { Search } from 'lucide-react-native'

export default function SearchScreen() {
  return (
    <Box className="flex-1 items-center justify-center bg-background-0">
      <VStack className="items-center gap-4">
        <Box className="rounded-full bg-primary-50 p-6">
          <Icon as={Search} size="xl" className="h-12 w-12 text-primary-500" />
        </Box>
        <Text className="text-xl font-bold text-typography-950">
          Pay & Search
        </Text>
        <Text className="px-10 text-center text-sm text-typography-600">
          Search for stocks, pay bills, and manage UPI payments. Coming soon!
        </Text>
      </VStack>
    </Box>
  )
}
