import React, { useState, useCallback, useEffect } from 'react'
import { ScrollView } from 'react-native'
import { Box } from '@/components/ui/box'
import { useIPOList, useMarketIndices } from '../hooks'
import { useIPOFiltering } from '../hooks'
import { useDynamicSpacing } from '../hooks'
import { 
  HomeHeader, 
  MarketIndicesSection, 
  IPOFilterTabs, 
  PopularIPOsSection 
} from '../components/home'
import type { DisplayIPO } from '../types'
import type { HomeTabScreenProps } from '../types/navigation.types'
import { useIPOUIStore } from '../store'

export default function HomeScreen({ navigation }: HomeTabScreenProps) {
    const { activeFilter, setActiveFilter } = useIPOUIStore()
    const [showMoreIPOs, setShowMoreIPOs] = useState<{[key: string]: boolean}>({})
    const [showMorePopular, setShowMorePopular] = useState(false)

    useEffect(() => {
        setActiveFilter('ongoing')
    }, [setActiveFilter])

    // Fetch real market data
    const { indices, loading: indicesLoading } = useMarketIndices(true)
    
    // Fetch real IPO data with intelligent filtering
    const { ipos: allIPOs, loading: iposLoading } = useIPOList('all', true)
    
    // Use custom hook for IPO filtering logic
    const { getIPOsForFilter } = useIPOFiltering(allIPOs)

    // Use dynamic spacing hook
    const { currentSpacing } = useDynamicSpacing(
        getIPOsForFilter, 
        activeFilter, 
        showMoreIPOs
    )

    // Navigation handlers
    const handleSearchPress = useCallback(() => {
        navigation.navigate('Pay')
    }, [navigation])

    const handleProfilePress = useCallback(() => {
        navigation.navigate('Profile')
    }, [navigation])

    const handleIPOPress = useCallback((ipo: DisplayIPO) => {
        console.log('📋 IPO Card Navigation:', ipo.name, ipo.id)
        navigation.navigate('IPODetails', { ipoId: ipo.id, ipoName: ipo.name })
    }, [navigation])

    const handleCheckStatus = useCallback((ipo: DisplayIPO) => {
        navigation.navigate('Check', { 
            ipoName: ipo.name,
            ipoId: ipo.id 
        })
    }, [navigation])

    const toggleShowMore = useCallback((filter: string) => {
        setShowMoreIPOs(prev => ({
            ...prev,
            [filter]: !prev[filter]
        }))
    }, [])

    const toggleShowMorePopular = useCallback(() => {
        setShowMorePopular(prev => !prev)
    }, [])

    const filters = ['upcoming', 'ongoing', 'allotted', 'listed']

    const showPopularSection = activeFilter === 'ongoing' || activeFilter === 'allotted'

    return (
        <Box className="flex-1 bg-background-0">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <HomeHeader 
                    onSearchPress={handleSearchPress}
                    onProfilePress={handleProfilePress}
                />

                {/* Market Indices */}
                <MarketIndicesSection 
                    indices={indices}
                    loading={indicesLoading}
                />

                {/* IPO Filter Tabs */}
                <IPOFilterTabs
                    filters={filters}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    getIPOsForFilter={getIPOsForFilter}
                    showMoreIPOs={showMoreIPOs}
                    onToggleShowMore={toggleShowMore}
                    onIPOPress={handleIPOPress}
                    onCheckStatus={handleCheckStatus}
                    loading={iposLoading}
                />

                {/* Most Popular IPOs - Only show for Ongoing and Allotted */}
                {showPopularSection && (
                    <PopularIPOsSection
                        ipos={allIPOs}
                        showMore={showMorePopular}
                        onToggleShowMore={toggleShowMorePopular}
                        onIPOPress={handleIPOPress}
                        loading={iposLoading}
                        dynamicSpacing={currentSpacing}
                    />
                )}

                {/* Spacer for Bottom Nav */}
                <Box className="h-20" />
            </ScrollView>
        </Box>
    )
}
