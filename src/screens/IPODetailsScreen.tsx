import React from 'react'
import { Image, Pressable, ScrollView, View } from 'react-native'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { ArrowLeft, CheckCircle, Clock, Image as ImageIcon } from 'lucide-react-native'
import { GMPWeekInteractiveChart } from '../components/charts'
import { growwColors } from '../design-system/tokens/colors'
import { useGMPHistory, useIPODetails } from '../hooks'
import { formatDate, formatGMP, formatIssueSize, formatPriceRange, formatSubscriptionStatus, getStatusInfo } from '../utils/formatters'
import type { DisplayIPO } from '../types'
import type { IPODetailsScreenProps } from '../types/navigation.types'

const rowStyle = {
  flexDirection: 'row' as const,
  justifyContent: 'space-between' as const,
  alignItems: 'center' as const,
}

export default function IPODetailsScreen({ navigation, route }: IPODetailsScreenProps) {
  const { ipoId, ipoName } = route.params
  const { ipo: fetchedIPO, loading, error } = useIPODetails(ipoId, true)
  const ipo: DisplayIPO | null = fetchedIPO
  const stockId = fetchedIPO?.stockId || fetchedIPO?.id
  const { history: gmpHistory, loading: gmpHistoryLoading } = useGMPHistory(stockId)

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: growwColors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: growwColors.textSecondary }}>Loading IPO details...</Text>
      </View>
    )
  }

  if (error || !ipo) {
    return (
      <View style={{ flex: 1, backgroundColor: growwColors.background, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: growwColors.error, textAlign: 'center' }}>
          {error || 'IPO not found'}
          {!error ? ` (${ipoName})` : ''}
        </Text>
        <Pressable
          onPress={() => navigation.goBack()}
          style={{ marginTop: 16, backgroundColor: growwColors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}
        >
          <Text style={{ color: growwColors.textInverse, fontWeight: '700' }}>Go Back</Text>
        </Pressable>
      </View>
    )
  }

  const statusInfo = getStatusInfo(ipo.status)
  const now = new Date()
  const openDate = ipo.dates.open ? new Date(ipo.dates.open) : null
  const closeDate = ipo.dates.close ? new Date(ipo.dates.close) : null
  const resultDate = ipo.dates.allotment ? new Date(ipo.dates.allotment) : null
  const listingDate = ipo.dates.listing ? new Date(ipo.dates.listing) : null

  const timelineStatus = (eventDate: Date | null) => {
    if (!eventDate) return 'pending'
    return eventDate <= now ? 'completed' : 'pending'
  }

  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <View style={{ ...rowStyle, paddingVertical: 12 }}>
      <Text style={{ color: growwColors.textSecondary, fontSize: 14 }}>{label}</Text>
      <Text style={{ color: growwColors.text, fontSize: 14, fontWeight: '600' }}>{value}</Text>
    </View>
  )

  const TimelineItem = ({ title, date, status, isLast }: { title: string; date: string; status: 'completed' | 'pending'; isLast?: boolean }) => (
    <View style={{ flexDirection: 'row', gap: 16, minHeight: 60 }}>
      <View style={{ alignItems: 'center' }}>
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: status === 'completed' ? growwColors.success : growwColors.border,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {status === 'completed' && <Icon as={CheckCircle} size="2xs" className="h-3 w-3" color={growwColors.textInverse} />}
          {status !== 'completed' && <Icon as={Clock} size="2xs" className="h-3 w-3" color={growwColors.textInverse} />}
        </View>
        {!isLast && (
          <View
            style={{
              width: 2,
              flex: 1,
              backgroundColor: status === 'completed' ? growwColors.success : growwColors.border,
              marginVertical: 4,
            }}
          />
        )}
      </View>
      <View>
        <Text style={{ color: growwColors.text, fontSize: 14, fontWeight: '600' }}>{title}</Text>
        <Text style={{ color: growwColors.textSecondary, fontSize: 12 }}>{date}</Text>
      </View>
    </View>
  )

  return (
    <View style={{ flex: 1, backgroundColor: growwColors.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: 'white',
          borderBottomWidth: 1,
          borderBottomColor: growwColors.border,
        }}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Icon as={ArrowLeft} size="xl" className="h-6 w-6" color={growwColors.text} />
        </Pressable>
        <Text style={{ marginLeft: 16, fontSize: 18, fontWeight: '700', color: growwColors.text }}>
          IPO Details
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ backgroundColor: 'white', padding: 20, marginBottom: 8 }}>
          <View style={{ ...rowStyle, alignItems: 'flex-start' }}>
            <View>
              <View
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: growwColors.surface,
                  borderRadius: 8,
                  marginBottom: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {ipo.logoUrl ? (
                  <Image source={{ uri: ipo.logoUrl }} style={{ width: 48, height: 48, borderRadius: 8 }} resizeMode="contain" />
                ) : (
                  <Icon as={ImageIcon} size="lg" color={growwColors.textSecondary} />
                )}
              </View>
              <Text style={{ fontSize: 20, fontWeight: '700', color: growwColors.text }}>{ipo.name}</Text>
              <Text style={{ fontSize: 14, color: growwColors.textSecondary, marginTop: 4 }}>
                {ipo.category === 'sme' ? 'SME' : 'Mainboard'} - {ipo.registrar}
              </Text>
            </View>
            <View style={{ backgroundColor: statusInfo.bgColor, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 }}>
              <Text style={{ color: statusInfo.color, fontSize: 12, fontWeight: '600' }}>{statusInfo.text}</Text>
            </View>
          </View>
        </View>

        {ipo.gmp && ipo.gmp.value !== undefined && (
          <View style={{ backgroundColor: 'white', padding: 20, marginBottom: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: growwColors.text, marginBottom: 16 }}>Grey Market Premium</Text>
            <View style={{ gap: 16 }}>
              <View style={rowStyle}>
                <Text style={{ color: growwColors.textSecondary, fontSize: 14 }}>GMP Value</Text>
                <Text style={{ color: ipo.gmp.value >= 0 ? growwColors.success : growwColors.error, fontSize: 14, fontWeight: '600' }}>
                  {formatGMP(ipo.gmp.value)}
                </Text>
              </View>
              {ipo.gmp.gainPercent !== undefined && (
                <View style={rowStyle}>
                  <Text style={{ color: growwColors.textSecondary, fontSize: 14 }}>Expected Gain</Text>
                  <Text style={{ color: ipo.gmp.gainPercent >= 0 ? growwColors.success : growwColors.error, fontSize: 14, fontWeight: '600' }}>
                    {ipo.gmp.gainPercent >= 0 ? '+' : ''}{ipo.gmp.gainPercent.toFixed(2)}%
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={{ backgroundColor: 'white', padding: 20, marginBottom: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: growwColors.text, marginBottom: 12 }}>GMP Trend (7D)</Text>
          <GMPWeekInteractiveChart
            history={gmpHistory}
            loading={gmpHistoryLoading}
            disabledLabel={ipo.gmp?.value === undefined ? 'GMP not active' : 'No GMP history yet'}
          />
        </View>

        <View style={{ backgroundColor: 'white', padding: 20, marginBottom: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: growwColors.text, marginBottom: 16 }}>IPO Details</Text>
          <DetailRow label="Price Range" value={formatPriceRange(ipo.priceRange.min || 0, ipo.priceRange.max || 0)} />
          <View style={{ height: 1, backgroundColor: growwColors.border, marginVertical: 4 }} />
          <DetailRow label="Min Investment" value={ipo.minInvestment ? `INR ${ipo.minInvestment.toLocaleString('en-IN')}` : 'N/A'} />
          <View style={{ height: 1, backgroundColor: growwColors.border, marginVertical: 4 }} />
          <DetailRow label="Lot Size" value={ipo.lotSize ? `${ipo.lotSize} shares` : 'N/A'} />
          <View style={{ height: 1, backgroundColor: growwColors.border, marginVertical: 4 }} />
          <DetailRow label="Issue Size" value={formatIssueSize(ipo.issueSize)} />
        </View>

        {(ipo.subscriptionStatus || ipo.gmp?.subscriptionStatus) && (
          <View style={{ backgroundColor: 'white', padding: 20, marginBottom: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: growwColors.text, marginBottom: 16 }}>Subscription Status</Text>
            <View style={rowStyle}>
              <Text style={{ color: growwColors.textSecondary, fontSize: 14 }}>Overall</Text>
              <Text style={{ color: growwColors.primary, fontSize: 14, fontWeight: '700' }}>
                {formatSubscriptionStatus(ipo.gmp?.subscriptionStatus || ipo.subscriptionStatus)}
              </Text>
            </View>
          </View>
        )}

        <View style={{ backgroundColor: 'white', padding: 20, marginBottom: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: growwColors.text, marginBottom: 16 }}>Timeline</Text>
          <TimelineItem title="Bidding Starts" date={formatDate(ipo.dates.open || '')} status={timelineStatus(openDate)} />
          <TimelineItem title="Bidding Ends" date={formatDate(ipo.dates.close || '')} status={timelineStatus(closeDate)} />
          <TimelineItem title="Allotment Finalization" date={formatDate(ipo.dates.allotment || '')} status={timelineStatus(resultDate)} />
          <TimelineItem title="Listing" date={formatDate(ipo.dates.listing || '')} status={timelineStatus(listingDate)} isLast />
        </View>

        {ipo.description && (
          <View style={{ backgroundColor: 'white', padding: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: growwColors.text, marginBottom: 8 }}>About Company</Text>
            <Text style={{ fontSize: 14, color: growwColors.textSecondary, lineHeight: 22 }}>{ipo.description}</Text>
          </View>
        )}
      </ScrollView>

      {ipo.status === 'CLOSED' && (
        <View
          style={{
            padding: 16,
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: growwColors.border,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <Pressable
            style={{ backgroundColor: growwColors.primary, borderRadius: 8, height: 48, justifyContent: 'center', alignItems: 'center' }}
            onPress={() => navigation.navigate('Check', { ipoName: ipo.name, ipoId: ipo.id })}
          >
            <Text style={{ color: growwColors.textInverse, fontWeight: '700', fontSize: 16 }}>Check Allotment Status</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}
