import React, { useRef } from 'react'
import { Image, Pressable, View, Animated } from 'react-native'
import { Icon } from '@/components/ui/icon'
import { ArrowLeft } from 'lucide-react-native'
import { Accordion } from '@/components/ui/accordion'
import { useGMPHistory, useIPODetails } from '../hooks'
import { formatDate } from '../utils/formatters'
import type { DisplayIPO } from '../types'
import type { IPODetailsScreenProps } from '../types/navigation.types'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Box } from '@/components/ui/box'
import { IPODetailsSection } from '../components/ipo-details/IPODetailsSection'
import { IPOApplicationDetails } from '../components/ipo-details/IPOApplicationDetails'
import { IPOSubscriptionDetails } from '../components/ipo-details/IPOSubscriptionDetails'
import { IPOSchedule } from '../components/ipo-details/IPOSchedule'
import { IPOGMPTrend } from '../components/ipo-details/IPOGMPTrend'
import { IPOAbout } from '../components/ipo-details/IPOAbout'
import { IPOFinancials } from '../components/ipo-details/IPOFinancials'
import { IPOProsCons } from '../components/ipo-details/IPOProsCons'
import { IPOFAQs } from '../components/ipo-details/IPOFAQs'

export default function IPODetailsScreen({ navigation, route }: IPODetailsScreenProps) {
  const { ipoId, ipoName } = route.params
  const { ipo: fetchedIPO, loading, error } = useIPODetails(ipoId, true)
  const ipo: DisplayIPO | null = fetchedIPO

  // GMP History for chart
  const { history: gmpHistory, loading: gmpLoading } = useGMPHistory(ipo?.stockId || '')

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [90, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
        <Text className="text-typography-500">Loading IPO details...</Text>
      </View>
    )
  }

  if (error || !ipo) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white', padding: 20, justifyContent: 'center', alignItems: 'center' }}>
        <Text className="text-error-500 text-center mb-4">
          {error || 'IPO not found'}
          {!error ? ` (${ipoName})` : ''}
        </Text>
        <Pressable onPress={() => navigation.goBack()} className="bg-[#00b386] px-4 py-2 rounded-lg">
          <Text className="text-white font-bold">Go Back</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <Box className="flex-1 bg-white">
      <HStack className="items-center px-4 py-3 bg-white border-b border-outline-100 z-10" style={{ elevation: 1 }}>
        <Pressable onPress={() => navigation.goBack()} className="mr-4">
          <Icon as={ArrowLeft} className="w-6 h-6 text-typography-900" />
        </Pressable>
        <Animated.View style={{ opacity: headerTitleOpacity, flex: 1, paddingRight: 8 }}>
          <Text className="text-[18px] font-bold text-typography-900" numberOfLines={1}>
            {ipo.growwDetails?.companyName || ipo.name}
          </Text>
        </Animated.View>
      </HStack>

      <Animated.ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <VStack className="px-4 py-5 bg-white mb-2">
          {ipo.logoUrl ? (
            <Image
              source={{ uri: ipo.logoUrl }}
              className="w-20 h-20 rounded mb-2"
              resizeMode="contain"
            />
          ) : (
            <Box className="w-12 h-12 bg-background-50 rounded items-center justify-center mb-2">
              <Text className="text-typography-400 font-bold text-lg">
                {(ipo.growwDetails?.companyName || ipo.name).charAt(0)}
              </Text>
            </Box>
          )}
          <Text className="text-[22px] font-bold text-typography-900">
            {ipo.growwDetails?.companyName || ipo.name}
          </Text>
          <Text className="text-[13px] text-typography-500 mt-1">
            Closes on {ipo.growwDetails?.endDate ? formatDate(ipo.growwDetails.endDate) : (ipo.dates.close ? formatDate(ipo.dates.close) : 'TBA')}
          </Text>

          <HStack className="items-baseline mt-4 mb-1">
            <Text className="text-[22px] font-bold text-typography-900">
              ₹{(ipo.growwDetails?.minPrice && ipo.growwDetails?.lotSize)
                ? (ipo.growwDetails.minPrice * ipo.growwDetails.lotSize).toLocaleString()
                : (ipo.minInvestment?.toLocaleString() || 'N/A')}
            </Text>
            <Text className="text-[13px] text-typography-500 ml-1">/ {ipo.growwDetails?.lotSize || ipo.lotSize || 0} shares</Text>
          </HStack>
          <Text className="text-[12px] text-typography-500">Minimum Investment</Text>
        </VStack>

        <Accordion
          size="md"
          variant="unfilled"
          type="multiple"
          isCollapsible={true}
          defaultValue={['ipo-details', 'app-details', 'sub-rate', 'schedule', 'gmp-chart', 'about', 'financials', 'pros-cons']}
          className="w-full bg-white"
        >
          <IPODetailsSection ipo={ipo} />
          <IPOApplicationDetails ipo={ipo} />
          <IPOSubscriptionDetails ipo={ipo} />
          <IPOSchedule ipo={ipo} />
          <IPOGMPTrend ipo={ipo} history={gmpHistory} loading={gmpLoading} />
          <IPOAbout ipo={ipo} />
          <IPOFinancials ipo={ipo} />
          <IPOProsCons ipo={ipo} />
          <IPOFAQs ipo={ipo} />
        </Accordion>
      </Animated.ScrollView>

      {ipo.status === 'CLOSED' && (
        <Box className="p-4 bg-white border-t border-outline-100 absolute bottom-0 left-0 right-0">
          <Pressable
            className="bg-[#00b386] rounded-lg h-12 justify-center items-center"
            onPress={() => navigation.navigate('Check', { ipoName: ipo.name, ipoId: ipo.id })}
          >
            <Text className="text-white font-bold text-[16px]">Check Allotment Status</Text>
          </Pressable>
        </Box>
      )}
    </Box>
  )
}
