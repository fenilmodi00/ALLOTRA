import React, { useState, useMemo } from 'react'
import { Image, Pressable, ScrollView, View } from 'react-native'
import { Icon } from '@/components/ui/icon'
import { ArrowLeft, CheckCircle, Clock, Image as ImageIcon, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, FileText, PlayCircle, Minus, Plus } from 'lucide-react-native'
import { Accordion, AccordionItem, AccordionHeader, AccordionTrigger, AccordionTitleText, AccordionIcon, AccordionContent, AccordionContentText } from '@/components/ui/accordion'
import { growwColors } from '../design-system/tokens/colors'
import { useGMPHistory, useIPODetails } from '../hooks'
import { formatDate, formatIssueSize } from '../utils/formatters'
import type { DisplayIPO, IPOFAQ, IPOFinancial } from '../types'
import type { IPODetailsScreenProps } from '../types/navigation.types'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Divider } from '@/components/ui/divider'
import { Box } from '@/components/ui/box'
import { ExpandableText } from '../components/common/ExpandableText'
import { TabGroup, TabPanel } from '../components/common/TabGroup'
import { GMPWeekInteractiveChart } from '../components/charts/GMPWeekInteractiveChart'

const AccordionSection = ({ value, title, children }: { value: string, title: string, children: React.ReactNode }) => {
  return (
    <AccordionItem value={value} className="bg-white border-b border-outline-100">
      <AccordionHeader>
        <AccordionTrigger className="px-4 py-4 focus:bg-transparent">
          {({ isExpanded }: { isExpanded: boolean }) => (
            <>
              <AccordionTitleText className="text-[17px] font-bold text-typography-900">{title}</AccordionTitleText>
              {isExpanded ? (
                <AccordionIcon as={ChevronUp} className="ml-3 text-typography-500 w-5 h-5" />
              ) : (
                <AccordionIcon as={ChevronDown} className="ml-3 text-typography-500 w-5 h-5" />
              )}
            </>
          )}
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent className="px-4 pb-6 pt-0">
        {children}
      </AccordionContent>
    </AccordionItem>
  )
}

const TimelineItem = ({ title, date, isActive, isLast, showInfo }: any) => (
  <View className={`flex-row pl-0 py-3 ${isLast ? '' : ''} items-start`}>
    <View className="w-5 items-center mr-3 mt-[2px] z-10">
      {isActive ? (
        <View className="w-5 h-5 rounded-full border-[2px] border-[#fbbf24] items-center justify-center bg-white">
          <View className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" />
        </View>
      ) : (
        <View className="w-[14px] h-[14px] rounded-full border-[2px] border-outline-200 bg-white" />
      )}
    </View>
    <View className="pb-1">
      <View className="flex-row items-center">
        <Text className={`font-bold ${isActive ? 'text-typography-900' : 'text-typography-600'} text-[14px]`}>{title}</Text>
        {showInfo && <Icon as={Clock} className="w-3 h-3 ml-1 text-typography-400" />}
      </View>
      <Text className="text-typography-500 text-xs mt-0.5">{date || 'TBA'}</Text>
    </View>
  </View>
)

export default function IPODetailsScreen({ navigation, route }: IPODetailsScreenProps) {
  const { ipoId, ipoName } = route.params
  const { ipo: fetchedIPO, loading, error } = useIPODetails(ipoId, true)
  const ipo: DisplayIPO | null = fetchedIPO

  // GMP History for chart
  const { history: gmpHistory, loading: gmpLoading } = useGMPHistory(ipo?.stockId || '')

  // Tab states
  const [financialsTab, setFinancialsTab] = useState('revenue')
  const [prosConsTab, setProsConsTab] = useState('pros')
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  // Financials tabs
  const financialsTabs = [
    { key: 'revenue', label: 'Revenue' },
    { key: 'profit', label: 'Profit' },
    { key: 'totalAssets', label: 'Total Assets' },
  ]

  // Pros/Cons tabs
  const prosConsTabs = [
    { key: 'pros', label: 'Pros' },
    { key: 'cons', label: 'Cons' },
  ]

  // Financial chart data
  const financialsData = ipo?.financials || []
  const chartData = useMemo(() => {
    const sortedData = [...financialsData].sort((a, b) => {
      const aYear = a.year || ''
      const bYear = b.year || ''
      return aYear.localeCompare(bYear)
    })
    const maxValue = Math.max(
      ...sortedData.map(d => financialsTab === 'revenue' ? (d.revenue || 0) : financialsTab === 'profit' ? (d.profit || 0) : (d.totalAssets || 0))
    )
    return {
      data: sortedData,
      maxValue: maxValue || 1,
    }
  }, [financialsData, financialsTab])

  const getBarHeight = (value: number) => {
    if (!value || chartData.maxValue === 0) return '5%'
    const height = (value / chartData.maxValue) * 100
    return `${Math.max(height, 5)}%`
  }

  const formatFinancialValue = (value?: number) => {
    if (!value) return 'N/A'
    return value >= 100 ? `${(value / 100).toFixed(2)}Cr` : `${value}Cr`
  }

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
    <View className="flex-1 bg-[#F5F6F8]">
      <HStack className="items-center px-4 py-3 bg-white border-b border-outline-100">
        <Pressable onPress={() => navigation.goBack()} className="mr-4">
          <Icon as={ArrowLeft} className="w-6 h-6 text-typography-900" />
        </Pressable>
      </HStack>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <VStack className="px-4 py-5 bg-white mb-2">
          <HStack className="items-center mb-2">
            {ipo.logoUrl ? (
              <Image source={{ uri: ipo.logoUrl }} className="w-8 h-8 rounded shrink-0 mr-3" resizeMode="contain" />
            ) : (
              <Box className="w-8 h-8 bg-background-50 rounded items-center justify-center mr-3">
                <Text className="text-typography-400 font-bold text-xs">{ipo.name.charAt(0)}</Text>
              </Box>
            )}
          </HStack>
          <Text className="text-[20px] font-bold text-typography-900">{ipo.name}</Text>
          <Text className="text-[13px] text-typography-500 mt-1">
            Closes on {ipo.dates.close ? formatDate(ipo.dates.close) : 'TBA'}
          </Text>

          <HStack className="items-baseline mt-4 mb-1">
            <Text className="text-[22px] font-bold text-typography-900">₹{ipo.minInvestment?.toLocaleString() || 'N/A'}</Text>
            <Text className="text-[13px] text-typography-500 ml-1">/ {ipo.lotSize || 0} shares</Text>
          </HStack>
          <Text className="text-[12px] text-typography-500">Minimum Investment</Text>
        </VStack>

        <Accordion
          size="md"
          variant="unfilled"
          type="multiple"
          isCollapsible={true}
          defaultValue={['ipo-details', 'app-details', 'sub-rate', 'schedule', 'gmp-chart', 'about', 'financials', 'pros-cons']}
          className="w-full bg-[#f2f2f2]"
        >
          {/* 1. IPO details */}
          <AccordionSection value="ipo-details" title="IPO details">
            <View className="flex-row flex-wrap justify-between gap-y-6">
              <View className="w-1/2 pr-4">
                <Text className="text-typography-500 text-xs mb-1">Minimum Investment</Text>
                <Text className="text-typography-900 font-bold text-sm">₹{ipo.minInvestment?.toLocaleString() || 'N/A'}</Text>
              </View>
              <View className="w-1/2 ">
                <Text className="text-typography-500 text-xs mb-1">Price range</Text>
                <Text className="text-typography-900 font-bold text-sm">₹{ipo.priceRange?.min || 0} - ₹{ipo.priceRange?.max || 0}</Text>
              </View>
              <View className="w-1/2 pr-4">
                <Text className="text-typography-500 text-xs mb-1">Lot size</Text>
                <Text className="text-typography-900 font-bold text-sm">{ipo.lotSize || 0}</Text>
              </View>
              <View className="w-1/2 ">
                <Text className="text-typography-500 text-xs mb-1">Issue size</Text>
                <Text className="text-typography-900 font-bold text-sm">{formatIssueSize(ipo.issueSize) || 'N/A'}</Text>
              </View>
              <View className="w-1/2 pt-2">
                <Text className="text-typography-500 text-xs mb-2">IPO document</Text>
                <HStack className="items-center gap-1">
                  <Text className="text-[#00b386] font-bold text-[13px]">RHP PDF</Text>
                  <Icon as={FileText} className="text-[#00b386] w-3 h-3" />
                </HStack>
              </View>
            </View>
          </AccordionSection>

          {/* 2. Application details */}
          <AccordionSection value="app-details" title="Application details">
            <Text className="text-typography-500 text-[13px] mb-4">
              For {ipo.name}, eligible investors can apply as Regular.
            </Text>
            <VStack className="gap-5">
              <View>
                <Text className="text-typography-900 font-bold text-[14px] mb-1">Apply as Regular</Text>
                <Text className="text-typography-500 text-[12px]">Price is Rs {ipo.priceRange?.min || 0} - {ipo.priceRange?.max || 0}. Apply upto ₹2,00,000</Text>
              </View>
              <View>
                <Text className="text-typography-900 font-bold text-[14px] mb-1">Apply as High Networth Individual</Text>
                <Text className="text-typography-500 text-[12px]">Price is Rs {ipo.priceRange?.min || 0} - {ipo.priceRange?.max || 0}. Apply between ₹2,00,000 - ₹5,00,000</Text>
              </View>
            </VStack>
          </AccordionSection>

          {/* 3. Subscription rate */}
          <AccordionSection value="sub-rate" title="Subscription rate">
            <View className="rounded-xl border border-outline-100 p-4 mb-3">
              <HStack className="justify-between items-center mb-3">
                <Text className="text-typography-500 text-[13px]">Qualified Institutional Buyers</Text>
                <Text className="text-typography-900 font-bold text-[13px] pt-1">0.00x</Text>
              </HStack>
              <HStack className="justify-between items-center mb-3">
                <Text className="text-typography-500 text-[13px]">Non-Institutional Investor</Text>
                <Text className="text-typography-900 font-bold text-[13px] pt-1">0.12x</Text>
              </HStack>
              <HStack className="justify-between items-center mb-4">
                <Text className="text-typography-500 text-[13px]">Retail Individual Investor</Text>
                <Text className="text-typography-900 font-bold text-[13px] pt-1">0.95x</Text>
              </HStack>
              <Divider className="mb-4 bg-outline-100" />
              <HStack className="justify-between items-center">
                <Text className="text-typography-900 font-bold text-[14px]">Total</Text>
                <Text className="text-typography-900 font-bold text-[14px]">{ipo.subscriptionStatus ? ipo.subscriptionStatus : '0.11x'}</Text>
              </HStack>
            </View>
            <Text className="text-typography-400 text-[11px] font-medium">As on 23 Feb '26, 6:31 PM</Text>
          </AccordionSection>

          {/* 4. Schedule */}
          <AccordionSection value="schedule" title="Schedule">
            <View className="relative">
              <View className="absolute left-[9px] top-[24px] bottom-[24px] w-[2px] bg-outline-100" />
              <TimelineItem title="IPO open date" date={formatDate(ipo.dates.open || '')} isActive={true} />
              <TimelineItem title="IPO close date" date={formatDate(ipo.dates.close || '')} isActive={false} />
              <TimelineItem title="Allotment date" date={formatDate(ipo.dates.allotment || '')} isActive={false} />
              <TimelineItem title="Funds unblock or debit" date={formatDate(ipo.dates.allotment || '')} isActive={false} showInfo={true} />
              <TimelineItem title="Tentative listing date" date={formatDate(ipo.dates.listing || '')} isActive={false} isLast={true} />
            </View>
          </AccordionSection>

          {/* GMP Chart Section */}
          {gmpHistory.length > 0 && (
            <AccordionSection value="gmp-chart" title="GMP Trend">
              <View className="mb-4">
                {ipo.gmp && (
                  <HStack className="justify-between items-center mb-4">
                    <View>
                      <Text className="text-typography-500 text-xs">Grey Market Premium</Text>
                      <Text className="text-typography-900 font-bold text-lg">
                        {ipo.gmp.value !== undefined ? `₹${ipo.gmp.value}` : 'N/A'}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-typography-500 text-xs">Estimated Listing</Text>
                      <Text className="text-typography-900 font-bold text-lg">
                        {ipo.gmp.estimatedListing !== undefined ? `₹${ipo.gmp.estimatedListing}` : 'N/A'}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-typography-500 text-xs">Gain %</Text>
                      <Text className={`font-bold text-lg ${(ipo.gmp.gainPercent || 0) >= 0 ? 'text-success-500' : 'text-error-500'}`}>
                        {ipo.gmp.gainPercent !== undefined ? `${ipo.gmp.gainPercent.toFixed(2)}%` : 'N/A'}
                      </Text>
                    </View>
                  </HStack>
                )}
                {!gmpLoading && gmpHistory.length > 0 ? (
                  <View className="h-[220px] bg-white rounded-lg overflow-hidden">
                    <GMPWeekInteractiveChart history={gmpHistory} />
                  </View>
                ) : (
                  <View className="h-[100px] items-center justify-center">
                    <Text className="text-typography-400 text-[13px]">
                      {gmpLoading ? 'Loading GMP data...' : 'No GMP history available'}
                    </Text>
                  </View>
                )}
              </View>
            </AccordionSection>
          )}

          {/* 5. About */}
          <AccordionSection value="about" title="About">
            <HStack className="justify-between items-center mb-4">
              <Text className="text-typography-500 text-[13px]">Founded in</Text>
              <Text className="text-typography-900 font-bold text-[13px]">{ipo.foundedYear || 'N/A'}</Text>
            </HStack>
            <HStack className="justify-between items-center mb-5">
              <Text className="text-typography-500 text-[13px]">MD/CEO</Text>
              <Text className="text-typography-900 font-bold text-[13px]">{ipo.mdCeo || 'N/A'}</Text>
            </HStack>
            
            <ExpandableText 
              content={ipo.about || ipo.description || "No description available."} 
              maxLength={150}
            />

            {/* Video placeholder - could be made dynamic */}
            <View className="w-full rounded-xl bg-gray-900 overflow-hidden relative justify-center items-center h-[180px] mt-4">
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=1000' }} 
                className="w-full h-full absolute opacity-70" 
                resizeMode="cover" 
              />
              <View className="w-12 h-12 rounded-full bg-white/90 items-center justify-center pl-1 z-10 shadow-soft-4">
                <Icon as={PlayCircle} className="w-8 h-8 text-error-600" />
              </View>
              <Text className="absolute bottom-3 left-3 text-white/50 text-[10px] w-full bg-black/50 px-2 py-1 leading-normal" numberOfLines={1}>Company Introduction Video</Text>
            </View>
          </AccordionSection>

          {/* 6. Financials */}
          <AccordionSection value="financials" title="Financials">
            <TabGroup 
              tabs={financialsTabs} 
              defaultTab="revenue" 
              onTabChange={(key) => setFinancialsTab(key)}
            />
            <Text className="text-typography-400 text-[11px] mb-8">All values are in Cr</Text>

            {chartData.data.length > 0 ? (
              <View>
                <HStack className="h-40 items-end justify-around px-4 mb-2 border-b border-outline-100 pb-0">
                  {chartData.data.map((item, index) => (
                    <VStack key={index} className="items-center justify-end h-full w-12 gap-1.5">
                      <Text className="text-typography-600 text-xs text-center font-medium">
                        {financialsTab === 'revenue' ? formatFinancialValue(item.revenue) : 
                         financialsTab === 'profit' ? formatFinancialValue(item.profit) : 
                         formatFinancialValue(item.totalAssets)}
                      </Text>
                      <View 
                        className="w-3.5 bg-[#00b386]" 
                        style={{ height: getBarHeight(
                          financialsTab === 'revenue' ? (item.revenue || 0) : 
                          financialsTab === 'profit' ? (item.profit || 0) : 
                          (item.totalAssets || 0)
                        ) as any }} 
                      />
                    </VStack>
                  ))}
                </HStack>
                <HStack className="justify-around px-4 mb-2">
                  {chartData.data.map((item, index) => (
                    <Text key={index} className="text-typography-400 text-[12px] w-12 text-center">{item.year}</Text>
                  ))}
                </HStack>
              </View>
            ) : (
              <View className="items-center justify-center py-8">
                <Text className="text-typography-400 text-[13px]">Financial data not available</Text>
              </View>
            )}
          </AccordionSection>

          {/* 7. Pros and cons */}
          <AccordionSection value="pros-cons" title="Pros and cons">
            <TabGroup 
              tabs={prosConsTabs} 
              defaultTab="pros" 
              onTabChange={(key) => setProsConsTab(key)}
            />

            <VStack className="gap-5">
              {prosConsTab === 'pros' ? (
                (ipo.strengths?.length ? ipo.strengths : []).map((item, index) => (
                  <HStack key={`pro-${index}`} className="gap-3 items-start pr-4">
                    <View className="mt-0.5">
                      <Icon as={ThumbsUp} className="w-[18px] h-[18px] text-[#00b386] fill-[#00b386]" />
                    </View>
                    <Text className="text-typography-600 text-[13px] leading-[20px] flex-1">{item}</Text>
                  </HStack>
                ))
              ) : (
                (ipo.risks?.length ? ipo.risks : [
                  "Risk factor 1 not available",
                  "Risk factor 2 not available"
                ]).map((item, index) => (
                  <HStack key={`con-${index}`} className="gap-3 items-start pr-4">
                    <View className="mt-0.5">
                      <Icon as={ThumbsDown} className="w-[18px] h-[18px] text-error-500 fill-error-500" />
                    </View>
                    <Text className="text-typography-600 text-[13px] leading-[20px] flex-1">{item}</Text>
                  </HStack>
                ))
              )}
              {(prosConsTab === 'pros' && !ipo.strengths?.length) && (
                <Text className="text-typography-400 text-[13px]">No pros available</Text>
              )}
              {(prosConsTab === 'cons' && !ipo.risks?.length) && (
                <Text className="text-typography-400 text-[13px]">No cons available</Text>
              )}
            </VStack>
          </AccordionSection>

          {/* 8. FAQs */}
          <AccordionSection value="faqs" title="FAQs">
            <VStack className="rounded-xl border border-outline-100 overflow-hidden">
              {(ipo.faqs?.length ? ipo.faqs : []).length > 0 ? (
                ipo.faqs!.map((faq, index) => {
                  const isExpanded = expandedFAQ === index
                  return (
                    <Pressable 
                      key={index}
                      onPress={() => setExpandedFAQ(isExpanded ? null : index)}
                      className={`p-4 justify-between items-center ${index !== (ipo.faqs?.length || 1) - 1 ? 'border-b border-outline-100' : ''}`}
                    >
                      <HStack className="flex-1 items-start pr-4">
                        <Text className="text-typography-900 text-[13px] flex-1 font-medium">{faq.question}</Text>
                      </HStack>
                      <View className="ml-2">
                        {isExpanded ? (
                          <Icon as={Minus} className="text-typography-400 w-5 h-5" />
                        ) : (
                          <Icon as={Plus} className="text-typography-400 w-5 h-5" />
                        )}
                      </View>
                      {isExpanded && (
                        <Text className="text-typography-500 text-[12px] leading-relaxed mt-3 w-full">
                          {faq.answer}
                        </Text>
                      )}
                    </Pressable>
                  )
                })
              ) : (
                <View className="p-4">
                  <Text className="text-typography-400 text-[13px]">FAQs not available</Text>
                </View>
              )}
            </VStack>
          </AccordionSection>
        </Accordion>
      </ScrollView>

      {ipo.status === 'CLOSED' ? (
        <View className="p-4 bg-white border-t border-outline-100 absolute bottom-0 left-0 right-0">
          <Pressable
            className="bg-[#00b386] rounded-lg h-12 justify-center items-center"
            onPress={() => navigation.navigate('Check', { ipoName: ipo.name, ipoId: ipo.id })}
          >
            <Text className="text-white font-bold text-[16px]">Check Allotment Status</Text>
          </Pressable>
        </View>
      ) : (
        <View className="p-4 bg-white border-t border-outline-100 absolute bottom-0 left-0 right-0 shadow-soft-4">
        </View>
      )}
    </View>
  )
}
