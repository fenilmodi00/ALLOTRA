import React, { useState } from 'react'
import { Pressable, ScrollView } from 'react-native'
import { Box } from '@/components/ui/box'
import { HStack } from '@/components/ui/hstack'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { Search, ScanLine, User } from 'lucide-react-native'
import { growwColors } from '../design-system/tokens/colors'
// import { StockCard } from '../components/stocks/StockCard' // Removed unused import
import { TabBar } from '../components/common/TabBar'

export default function InvestmentsScreen({ navigation }: any) {
    const [activeTab, setActiveTab] = useState('Popular')

    const funds = [
        { name: 'Quant Small Cap Fund', price: 245.60, change: 12.40, changePercent: 1.52, isPositive: true },
        { name: 'ICICI Prudential Bluechip', price: 98.20, change: -0.40, changePercent: -0.41, isPositive: false },
        { name: 'Parag Parikh Flexi Cap', price: 68.50, change: 0.80, changePercent: 1.18, isPositive: true },
        { name: 'HDFC Mid-Cap Opportunities', price: 154.30, change: 3.20, changePercent: 2.12, isPositive: true },
    ]

    return (
        <Box style={{ flex: 1, backgroundColor: growwColors.background }}>
            {/* Header */}
            <HStack style={{ justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'white' }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: growwColors.text, fontFamily: 'Roboto' }}>
                    Mutual Funds
                </Text>
                <HStack style={{ gap: 22, alignItems: 'center' }}>
                    <Pressable onPress={() => navigation.navigate('Pay')}>
                        <Icon as={Search} size="xl" className="h-6 w-6" color={growwColors.text} />
                    </Pressable>
                    <Pressable>
                        <Icon as={ScanLine} size="xl" className="h-6 w-6" color={growwColors.text} />
                    </Pressable>
                    <Pressable onPress={() => navigation.navigate('Profile')}>
                        <Box style={{ width: 30, height: 30, backgroundColor: growwColors.backgroundSecondary, borderRadius: 15, justifyContent: 'center', alignItems: 'center' }}>
                            <Icon as={User} size="md" color={growwColors.text} />
                        </Box>
                    </Pressable>
                </HStack>
            </HStack>

            <ScrollView showsVerticalScrollIndicator={false}>
                <VStack style={{ gap: 30, paddingBottom: 80, paddingTop: 10 }}>

                    {/* Tabs */}
                    <TabBar
                        tabs={['Popular', 'Collections', 'NFO']}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />

                    {/* Funds List */}
                    <Box style={{ paddingHorizontal: 20 }}>
                        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 15, color: growwColors.text, fontFamily: 'Roboto' }}>
                            Popular Funds
                        </Text>
                        <VStack style={{ gap: 16 }}>
                            {funds.map((fund, idx) => (
                                // Reusing StockCard styles but potentially different layout if desired
                                // For now, listing them horizontally or vertically
                                <HStack key={idx} style={{ justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: 'white', borderRadius: 10, borderWidth: 1, borderColor: growwColors.border }}>
                                    <VStack>
                                        <Text style={{ fontWeight: '600', fontSize: 16, fontFamily: 'Roboto' }}>{fund.name}</Text>
                                        <Text style={{ fontSize: 12, color: 'gray', marginTop: 4 }}>NAV: ₹{fund.price.toFixed(2)}</Text>
                                    </VStack>
                                    <VStack style={{ alignItems: 'flex-end' }}>
                                        <Text style={{ color: fund.isPositive ? growwColors.success : growwColors.error, fontSize: 13, fontWeight: '600' }}>
                                            {fund.isPositive ? '+' : ''}{fund.changePercent.toFixed(2)}%
                                        </Text>
                                        <Text style={{ fontSize: 12, color: 'gray' }}>1Y Returns</Text>
                                    </VStack>
                                </HStack>
                            ))}
                        </VStack>
                    </Box>

                    {/* SIP Section */}
                    <Box style={{ paddingHorizontal: 20 }}>
                        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 15, color: growwColors.text, fontFamily: 'Roboto' }}>
                            SIP Collections
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <HStack style={{ gap: 16 }}>
                                {[1, 2, 3].map((_, i) => (
                                    <Box key={i} style={{ width: 140, height: 80, backgroundColor: growwColors.backgroundSecondary, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontWeight: '500' }}>High Return</Text>
                                    </Box>
                                ))}
                            </HStack>
                        </ScrollView>
                    </Box>

                </VStack>
            </ScrollView>
        </Box>
    )
}
