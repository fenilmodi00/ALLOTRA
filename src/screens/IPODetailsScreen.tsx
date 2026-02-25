import React, { useState, useMemo, useRef } from 'react'
import { Image, Pressable, ScrollView, View, Linking, Animated } from 'react-native'
import { Icon } from '@/components/ui/icon'
import { ArrowLeft, Clock, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, FileText, Minus, Plus } from 'lucide-react-native'
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
import { FinancialsChart } from '../components/charts/FinancialsChart'

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

interface TimelineItemProps {
  title: string
  date: string | null | undefined
  isActive: boolean
  showInfo?: boolean
  color?: string
}
const TimelineItem = ({ title, date, isActive, showInfo, color = '#00b386' }: TimelineItemProps) => (
  <HStack className="pl-0 py-3 items-start">
    <Box className="w-5 items-center mr-3 mt-[2px] z-10">
      {isActive ? (
        <Box
          className="w-5 h-5 rounded-full border-[2px] items-center justify-center bg-white"
          style={{ borderColor: color }}
        >
          <Box className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
        </Box>
      ) : (
        <Box className="w-[14px] h-[14px] rounded-full border-[2px] border-outline-200 bg-white" />
      )}
    </Box>
    <Box className="pb-1">
      <HStack className="items-center">
        <Text className={`font-bold ${isActive ? 'text-typography-900' : 'text-typography-600'} text-[14px]`}>{title}</Text>
        {showInfo && <Icon as={Clock} className="w-3 h-3 ml-1 text-typography-400" />}
      </HStack>
      <Text className="text-typography-500 text-xs mt-0.5">{date || 'TBA'}</Text>
    </Box>
  </HStack>
)

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

  // Tab states
  // removed financialsTab state as it's handled internally by FinancialsChart
  const [prosConsTab, setProsConsTab] = useState('pros')
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  // Pros/Cons tabs
  const prosConsTabs = [
    { key: 'pros', label: 'Pros' },
    { key: 'cons', label: 'Cons' },
  ]

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
    <Box className="flex-1 bg-[#F5F6F8]">
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
          className="w-full bg-[#f2f2f2]"
        >
          {/* 1. IPO details */}
          <AccordionSection value="ipo-details" title="IPO details">
            <View className="flex-row flex-wrap justify-between gap-y-6">
              <View className="w-1/2 pr-4">
                <Text className="text-typography-500 text-xs mb-1">Minimum Investment</Text>
                <Text className="text-typography-900 font-bold text-sm">₹{(ipo.growwDetails?.minPrice && ipo.growwDetails?.lotSize)
                  ? (ipo.growwDetails.minPrice * ipo.growwDetails.lotSize).toLocaleString()
                  : (ipo.minInvestment?.toLocaleString() || 'N/A')} </Text>
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
                <Text className="text-typography-900 font-bold text-sm">
                  {ipo.growwDetails?.issueSize
                    ? formatFinancialValue(ipo.growwDetails.issueSize / 10000000)
                    : (formatIssueSize(ipo.issueSize) || 'N/A')}
                </Text>
              </View>
              <Box className="w-1/2 pt-2">
                <Text className="text-typography-500 text-xs mb-2">IPO document</Text>
                {ipo.documentUrl ? (
                  <Pressable onPress={() => Linking.openURL(ipo.documentUrl!)}>
                    <HStack className="items-center gap-1">
                      <Text className="text-[#00b386] font-bold text-[13px]">RHP PDF</Text>
                      <Icon as={FileText} className="text-[#00b386] w-3 h-3" />
                    </HStack>
                  </Pressable>
                ) : (
                  <Text className="text-typography-900 font-bold text-sm">N/A</Text>
                )}
              </Box>
            </View>
          </AccordionSection>

          {/* 2. Application details */}
          <AccordionSection value="app-details" title="Application details">
            <Text className="text-typography-500 text-[13px] mb-4">
              For {ipo.growwDetails?.companyName || ipo.name}, eligible investors can apply as Regular.
            </Text>
            <VStack className="gap-5">
              {ipo.categories?.map((cat, index) => (
                <View key={index}>
                  <Text className="text-typography-900 font-bold text-[14px] mb-1">
                    {cat.categoryDetails?.categoryLabel || cat.categoryLabel || `Apply as ${cat.category}`}
                  </Text>
                  {cat.categoryDetails?.categoryInfo?.map((info, i) => (
                    <Text key={i} className="text-typography-500 text-[12px]">{info}</Text>
                  )) || (
                      <Text className="text-typography-500 text-[12px]">
                        Price is Rs {cat.minPrice || ipo.priceRange?.min || 0} - {cat.maxPrice || ipo.priceRange?.max || 0}. {cat.categorySubText}
                      </Text>
                    )}
                </View>
              ))}
              {!ipo.categories?.length && (
                <>
                  <View>
                    <Text className="text-typography-900 font-bold text-[14px] mb-1">Apply as Regular</Text>
                    <Text className="text-typography-500 text-[12px]">upto ₹2,00,000</Text>
                  </View>
                  <View>
                    <Text className="text-typography-900 font-bold text-[14px] mb-1">Apply as High Networth Individual</Text>
                    <Text className="text-typography-500 text-[12px]">between ₹2,00,000 - ₹5,00,000</Text>
                  </View>
                </>
              )}
            </VStack>
          </AccordionSection>

          {/* 3. Subscription rate */}
          <AccordionSection value="sub-rate" title="Subscription rate">
            {ipo.growwDetails?.subscriptionRates ? (
              <View className="rounded-xl border border-outline-100 p-4 mb-3">
                {ipo.growwDetails.subscriptionRates.filter(r => r.category !== 'TOTAL').map((rate, index) => (
                  <HStack key={index} className="justify-between items-center mb-3">
                    <Text className="text-typography-500 text-[13px]">{rate.categoryName}</Text>
                    <Text className="text-typography-900 font-bold text-[13px] pt-1">
                      {rate.subscriptionRate !== undefined ? `${rate.subscriptionRate.toFixed(2)}x` : 'N/A'}
                    </Text>
                  </HStack>
                ))}
                <Divider className="mb-4 bg-outline-100" />
                <HStack className="justify-between items-center">
                  <Text className="text-typography-900 font-bold text-[14px]">Total</Text>
                  <Text className="text-typography-900 font-bold text-[14px]">
                    {ipo.growwDetails.subscriptionRates.find(r => r.category === 'TOTAL')?.subscriptionRate?.toFixed(2) || 'N/A'}x
                  </Text>
                </HStack>
              </View>
            ) : (
              <View className="rounded-xl border border-outline-100 p-4 mb-3">
                <HStack className="justify-between items-center mb-3">
                  <Text className="text-typography-500 text-[13px]">Qualified Institutional Buyers</Text>
                  <Text className="text-typography-900 font-bold text-[13px] pt-1">{ipo.subscription?.qib !== undefined ? `${ipo.subscription.qib.toFixed(2)}x` : 'N/A'}</Text>
                </HStack>
                <HStack className="justify-between items-center mb-3">
                  <Text className="text-typography-500 text-[13px]">Non-Institutional Investor</Text>
                  <Text className="text-typography-900 font-bold text-[13px] pt-1">{ipo.subscription?.nii !== undefined ? `${ipo.subscription.nii.toFixed(2)}x` : 'N/A'}</Text>
                </HStack>
                <HStack className="justify-between items-center mb-4">
                  <Text className="text-typography-500 text-[13px]">Retail Individual Investor</Text>
                  <Text className="text-typography-900 font-bold text-[13px] pt-1">{ipo.subscription?.rii !== undefined ? `${ipo.subscription.rii.toFixed(2)}x` : 'N/A'}</Text>
                </HStack>
                <Divider className="mb-4 bg-outline-100" />
                <HStack className="justify-between items-center">
                  <Text className="text-typography-900 font-bold text-[14px]">Total</Text>
                  <Text className="text-typography-900 font-bold text-[14px]">{ipo.subscription?.total !== undefined ? `${ipo.subscription.total.toFixed(2)}x` : (ipo.subscriptionStatus || 'N/A')}</Text>
                </HStack>
              </View>
            )}
            <Text className="text-typography-400 text-[11px] font-medium">Subscription rate matching latest data</Text>
          </AccordionSection>

          {/* 4. Schedule */}
          <AccordionSection value="schedule" title="Schedule">
            <Box className="relative">
              {/* Progress Line Background */}
              <Box className="absolute left-[9px] top-[24px] bottom-[24px] w-[2px] bg-outline-100" />

              {/* Dynamic Progress Line */}
              {(() => {
                const today = new Date();
                const parseDate = (d?: string) => d ? new Date(d) : null;

                const openDate = parseDate(ipo.growwDetails?.startDate || ipo.dates.open);
                const closeDate = parseDate(ipo.growwDetails?.endDate || ipo.dates.close);
                const allotmentDate = parseDate(ipo.growwDetails?.allotmentDate || ipo.dates.allotment);
                const listingDate = parseDate(ipo.growwDetails?.listingDate || ipo.dates.listing);

                // Determine Status Color
                let statusColor = '#f97316'; // orange default for upcoming
                if (openDate && today >= openDate) {
                  statusColor = '#eab308'; // yellow if open
                }
                if (closeDate && today >= closeDate) {
                  statusColor = '#00b386'; // green if closed
                }

                const getProgressHeight = () => {
                  if (listingDate && today >= listingDate) return '100%';
                  if (allotmentDate && today >= allotmentDate) return '75%';
                  if (closeDate && today >= closeDate) return '50%';
                  if (openDate && today >= openDate) return '25%';
                  return '0%';
                };

                return (
                  <>
                    <Box
                      className="absolute left-[9px] top-[24px] w-[2px] z-0"
                      style={{
                        height: getProgressHeight() as any,
                        backgroundColor: statusColor
                      }}
                    />
                    <TimelineItem
                      title="IPO open date"
                      date={formatDate(ipo.growwDetails?.startDate || ipo.dates.open || '')}
                      isActive={openDate ? today >= openDate : false}
                      color={statusColor}
                    />
                    <TimelineItem
                      title="IPO close date"
                      date={formatDate(ipo.growwDetails?.endDate || ipo.dates.close || '')}
                      isActive={closeDate ? today >= closeDate : false}
                      color={statusColor}
                    />
                    <TimelineItem
                      title="Allotment date"
                      date={formatDate(ipo.growwDetails?.allotmentDate || ipo.dates.allotment || '')}
                      isActive={allotmentDate ? today >= allotmentDate : false}
                      color={statusColor}
                    />
                    <TimelineItem
                      title="Funds unblock or debit"
                      date={formatDate(ipo.growwDetails?.allotmentDate || ipo.dates.allotment || '')}
                      isActive={allotmentDate ? today >= allotmentDate : false}
                      showInfo={true}
                      color={statusColor}
                    />
                    <TimelineItem
                      title="Tentative listing date"
                      date={formatDate(ipo.growwDetails?.listingDate || ipo.dates.listing || '')}
                      isActive={listingDate ? today >= listingDate : false}
                      color={statusColor}
                    />
                  </>
                );
              })()}
            </Box>
          </AccordionSection>

          {/* GMP Chart Section */}
          {(gmpHistory.length > 0 || ipo.gmp) && (
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
                  <View className="bg-white rounded-lg overflow-hidden">
                    <GMPWeekInteractiveChart history={gmpHistory} />
                  </View>
                ) : gmpLoading ? (
                  <View className="h-[100px] items-center justify-center">
                    <Text className="text-typography-400 text-[13px]">Loading GMP data...</Text>
                  </View>
                ) : null}
              </View>
            </AccordionSection>
          )}

          {/* 5. About */}
          <AccordionSection value="about" title="About">
            <HStack className="justify-between items-center mb-4">
              <Text className="text-typography-500 text-[13px]">Founded in</Text>
              <Text className="text-typography-900 font-bold text-[13px]">{ipo.growwDetails?.aboutCompany?.yearFounded || ipo.foundedYear || 'N/A'}</Text>
            </HStack>
            <HStack className="justify-between items-center mb-5">
              <Text className="text-typography-500 text-[13px]">MD/CEO</Text>
              <Text className="text-typography-900 font-bold text-[13px]">{ipo.growwDetails?.aboutCompany?.managingDirector || ipo.mdCeo || 'N/A'}</Text>
            </HStack>

            <ExpandableText
              content={ipo.growwDetails?.aboutCompany?.aboutCompany || ipo.about || ipo.description || "No description available."}
              maxLength={150}
            />
          </AccordionSection>

          {/* 6. Financials */}
          <AccordionSection value="financials" title="Financials">
            {ipo.financials && ipo.financials.length > 0 ? (
              <FinancialsChart financials={ipo.financials} />
            ) : (
              <Box className="items-center justify-center py-8">
                <Text className="text-typography-400 text-[13px]">Financial data not available</Text>
              </Box>
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
                    <Box className="mt-0.5">
                      <Icon as={ThumbsUp} className="w-[18px] h-[18px] text-[#00b386] fill-[#00b386]" />
                    </Box>
                    <Text className="text-typography-600 text-[13px] leading-[20px] flex-1 text-justify">{item}</Text>
                  </HStack>
                ))
              ) : (
                (ipo.risks?.length ? ipo.risks : []).map((item, index) => (
                  <HStack key={`con-${index}`} className="gap-3 items-start pr-4">
                    <Box className="mt-0.5">
                      <Icon as={ThumbsDown} className="w-[18px] h-[18px] text-error-500 fill-error-500" />
                    </Box>
                    <Text className="text-typography-600 text-[13px] leading-[20px] flex-1 text-justify">{item}</Text>
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
                      className={`p-4 justify-between items-start flex-col w-full ${index !== (ipo.faqs?.length || 1) - 1 ? 'border-b border-outline-100' : ''}`}
                    >
                      <HStack className="w-full justify-between items-center">
                        <Text className="text-typography-900 text-[13px] flex-1 font-medium pr-4">{faq.question}</Text>
                        <Box>
                          {isExpanded ? (
                            <Icon as={Minus} className="text-typography-400 w-5 h-5" />
                          ) : (
                            <Icon as={Plus} className="text-typography-400 w-5 h-5" />
                          )}
                        </Box>
                      </HStack>
                      {isExpanded && (
                        <Text className="text-typography-500 text-[12px] leading-relaxed mt-3 w-full">
                          {faq.answer}
                        </Text>
                      )}
                    </Pressable>
                  )
                })
              ) : (
                <Box className="p-4">
                  <Text className="text-typography-400 text-[13px]">FAQs not available</Text>
                </Box>
              )}
            </VStack>
          </AccordionSection>
        </Accordion>
      </Animated.ScrollView>

      {ipo.status === 'CLOSED' ? (
        <Box className="p-4 bg-white border-t border-outline-100 absolute bottom-0 left-0 right-0">
          <Pressable
            className="bg-[#00b386] rounded-lg h-12 justify-center items-center"
            onPress={() => navigation.navigate('Check', { ipoName: ipo.name, ipoId: ipo.id })}
          >
            <Text className="text-white font-bold text-[16px]">Check Allotment Status</Text>
          </Pressable>
        </Box>
      ) : (
        <Box className="p-4 bg-white border-t border-outline-100 absolute bottom-0 left-0 right-0 shadow-soft-4">
          <Pressable
            className="bg-[#00b386] rounded-lg h-12 justify-center items-center"
            onPress={() => {
              // Usually opens broker or application flow, for now placeholder toast/alert or empty
              if (ipo.rtaLink) {
                Linking.openURL(ipo.rtaLink)
              }
            }}
          >
            <Text className="text-white font-bold text-[16px]">Apply for IPO</Text>
          </Pressable>
        </Box>
      )}
    </Box>
  )
}
