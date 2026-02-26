import React, { useState, useCallback } from 'react'
import { Pressable, ScrollView, Alert, ActivityIndicator, TextInput } from 'react-native'
import { Box } from '@/components/ui/box'
import { HStack } from '@/components/ui/hstack'
import { VStack } from '@/components/ui/vstack'
import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'
import { Divider } from '@/components/ui/divider'
import {
  CreditCard,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native'
import { growwColors } from '../design-system/tokens/colors'
import { PANInput } from '../components/common/PANInput'
import { validatePAN } from '../utils/validators'
import { useAllotment } from '../hooks/useAllotment'
import { SectionHeader } from '../components/allotment/SectionHeader'
import { PANChip } from '../components/allotment/PANChip'
import { ResultRow } from '../components/allotment/ResultRow'

// ─── Constants ────────────────────────────────────────────────────────────────

const RECENT_ALLOTTED_IPOS = [
  { id: '1', name: 'PNGS Reva Diamond', date: '26 Feb', subscribed: '0.83x', logo: 'R' },
  { id: '2', name: 'Omnitech Engineering', date: '27 Feb', subscribed: '0.08x', logo: 'O' },
  { id: '3', name: 'Tata Technologies', date: '22 Nov', subscribed: '69.43x', logo: 'T' },
  { id: '4', name: 'IREDA', date: '21 Nov', subscribed: '38.80x', logo: 'I' },
  { id: '5', name: 'DOMS Industries', date: '15 Dec', subscribed: '93.52x', logo: 'D' },
]

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AllotmentScreen() {
  const { savedPANs, results, checkingId, addPAN, removePAN, checkAllotment } = useAllotment()

  // Local UI state
  const [addPanValue, setAddPanValue] = useState('')
  const [addNickname, setAddNickname] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [panValid, setPanValid] = useState(false)
  const [resultsExpanded, setResultsExpanded] = useState(true)
  const [showAllIpos, setShowAllIpos] = useState(false)
  const [ipoName, setIpoName] = useState('')

  // ── PAN management ──────────────────────────────────────────────────────────

  const handleAddPAN = useCallback(() => {
    const { isValid, error } = validatePAN(addPanValue)
    if (!isValid) {
      Alert.alert('Invalid PAN', error || 'Please enter a valid PAN number')
      return
    }

    const result = addPAN(addPanValue, addNickname)
    if (!result.success && result.error) {
      Alert.alert('Duplicate PAN', result.error)
      return
    }

    setAddPanValue('')
    setAddNickname('')
    setShowAddForm(false)
    setPanValid(false)
  }, [addPanValue, addNickname, addPAN])

  const handleRemovePAN = useCallback((id: string) => {
    Alert.alert('Remove PAN', 'Are you sure you want to remove this PAN?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removePAN(id),
      },
    ])
  }, [removePAN])

  // ── Bulk allotment check ────────────────────────────────────────────────────

  const handleBulkCheck = useCallback(async (selectedIpoId: string, selectedIpoName: string) => {
    if (savedPANs.length === 0) {
      Alert.alert('No PANs', 'Please add at least one PAN to check allotment.')
      return
    }
    setIpoName(selectedIpoName)
    await checkAllotment(selectedIpoId, selectedIpoName)
    setResultsExpanded(true)
  }, [savedPANs, checkAllotment])

  // ── Render ──────────────────────────────────────────────────────────────────

  const allottedCount = results.filter((r) => r.status === 'ALLOTTED').length
  const notAllottedCount = results.filter((r) => r.status === 'NOT_ALLOTTED').length
  const pendingCount = results.filter((r) => r.status === 'PENDING').length

  return (
    <Box style={{ flex: 1, backgroundColor: growwColors.backgroundSecondary }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Box
        style={{
          backgroundColor: growwColors.surface,
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: growwColors.border,
        }}
      >
        <HStack style={{ alignItems: 'center', gap: 10 }}>
          <Box
            style={{
              backgroundColor: growwColors.primaryLight,
              borderRadius: 10,
              padding: 8,
            }}
          >
            <Icon as={CreditCard} size="md" color={growwColors.primary} />
          </Box>
          <VStack>
            <Text
              style={{
                fontSize: 22,
                fontWeight: '700',
                color: growwColors.text,
                fontFamily: 'Inter_700Bold',
              }}
            >
              Allotment
            </Text>
            <Text style={{ fontSize: 12, color: growwColors.textSecondary }}>
              Manage PANs & check IPO allotment
            </Text>
          </VStack>
        </HStack>
      </Box>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* ── Saved PANs section ────────────────────────────────────────────── */}
        <Box
          style={{
            margin: 16,
            backgroundColor: growwColors.surface,
            borderRadius: 16,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <HStack style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <SectionHeader
              title="Saved PANs"
              subtitle={savedPANs.length === 0 ? 'No PANs added yet' : `${savedPANs.length} PAN${savedPANs.length > 1 ? 's' : ''} saved`}
            />
            <Pressable
              onPress={() => setShowAddForm((v) => !v)}
              style={{
                backgroundColor: showAddForm ? growwColors.backgroundSecondary : growwColors.primary,
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
              accessibilityRole="button"
              accessibilityLabel={showAddForm ? 'Cancel adding PAN' : 'Add new PAN'}
            >
              <Icon
                as={Plus}
                size="xs"
                color={showAddForm ? growwColors.textSecondary : '#fff'}
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: showAddForm ? growwColors.textSecondary : '#fff',
                }}
              >
                {showAddForm ? 'Cancel' : 'Add PAN'}
              </Text>
            </Pressable>
          </HStack>

          {/* Add PAN form */}
          {showAddForm && (
            <Box
              style={{
                backgroundColor: growwColors.backgroundSecondary,
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: growwColors.border,
              }}
            >
              <VStack style={{ gap: 12 }}>
                <PANInput
                  value={addPanValue}
                  onChangeText={setAddPanValue}
                  label="PAN Number"
                  placeholder="e.g. ABCDE1234F"
                  onValidationChange={setPanValid}
                />

                {/* Nickname field */}
                <VStack style={{ gap: 4 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: growwColors.text }}>
                    Nickname (optional)
                  </Text>
                  <Box
                    style={{
                      borderWidth: 1,
                      borderColor: growwColors.border,
                      borderRadius: 8,
                      backgroundColor: growwColors.surface,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                    }}
                  >
                    <Box>
                      <TextInput
                        value={addNickname}
                        onChangeText={setAddNickname}
                        placeholder="e.g. Self, Spouse"
                        placeholderTextColor={growwColors.textTertiary}
                        style={{
                          fontSize: 15,
                          color: growwColors.text,
                          padding: 0,
                          margin: 0,
                        }}
                        returnKeyType="done"
                        maxLength={20}
                      />
                    </Box>
                  </Box>
                </VStack>

                <Pressable
                  onPress={handleAddPAN}
                  style={{
                    backgroundColor: growwColors.primary,
                    borderRadius: 10,
                    paddingVertical: 14,
                    alignItems: 'center',
                    opacity: panValid ? 1 : 0.5,
                  }}
                  disabled={!panValid}
                  accessibilityRole="button"
                  accessibilityLabel="Save PAN"
                >
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>
                    Save PAN
                  </Text>
                </Pressable>
              </VStack>
            </Box>
          )}

          {/* PAN list */}
          {savedPANs.length > 0 ? (
            <VStack style={{ gap: 10 }}>
              {savedPANs.map((pan) => (
                <PANChip key={pan.id} pan={pan} onRemove={handleRemovePAN} />
              ))}
            </VStack>
          ) : (
            !showAddForm && (
              <Box
                style={{
                  alignItems: 'center',
                  paddingVertical: 24,
                  backgroundColor: growwColors.backgroundSecondary,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: growwColors.border,
                  borderStyle: 'dashed',
                }}
              >
                <Icon as={CreditCard} size="xl" color={growwColors.textTertiary} />
                <Text style={{ color: growwColors.textSecondary, marginTop: 8, fontSize: 14 }}>
                  Add a PAN to get started
                </Text>
              </Box>
            )
          )}
        </Box>

        {/* ── Bulk Allotment Check section ───────────────────────────────────── */}
        <Box
          style={{
            marginHorizontal: 16,
            backgroundColor: growwColors.surface,
            borderRadius: 16,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <SectionHeader
            title="Bulk Allotment Check"
            subtitle="Check allotment for all saved PANs at once"
          />

          {/* IPO name input */}
          <VStack style={{ gap: 4, marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: growwColors.text }}>
              IPO Name
            </Text>
            <HStack
              style={{
                borderWidth: 1,
                borderColor: growwColors.border,
                borderRadius: 8,
                backgroundColor: growwColors.surface,
                paddingHorizontal: 12,
                paddingVertical: 12,
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Icon as={Search} size="sm" color={growwColors.textTertiary} />
              <TextInput
                value={ipoName}
                onChangeText={setIpoName}
                placeholder="e.g. Tata Technologies IPO"
                placeholderTextColor={growwColors.textTertiary}
                style={{
                  flex: 1,
                  fontSize: 15,
                  color: growwColors.text,
                  padding: 0,
                }}
                returnKeyType="search"
              />
            </HStack>
          </VStack>

          {/* PAN summary pills */}
          {savedPANs.length > 0 && (
            <Box style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, color: growwColors.textSecondary, marginBottom: 8 }}>
                Will check {savedPANs.length} PAN{savedPANs.length > 1 ? 's' : ''}:
              </Text>
              <HStack style={{ flexWrap: 'wrap', gap: 8 }}>
                {savedPANs.map((p) => (
                  <Box
                    key={p.id}
                    style={{
                      backgroundColor: growwColors.primaryLight,
                      borderRadius: 20,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: growwColors.primary, fontWeight: '600' }}>
                      {p.pan}
                    </Text>
                  </Box>
                ))}
              </HStack>
            </Box>
          )}

          {/* IPO Selection List */}
          <VStack style={{ gap: 16 }}>
            {(showAllIpos ? RECENT_ALLOTTED_IPOS : RECENT_ALLOTTED_IPOS.slice(0, 2)).map((ipo) => (
              <HStack
                key={ipo.id}
                style={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 4,
                }}
              >
                <HStack style={{ alignItems: 'center', gap: 12, flex: 1 }}>
                  <Box
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: growwColors.backgroundSecondary,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: growwColors.border,
                    }}
                  >
                    <Text style={{ fontSize: 20, fontWeight: '700', color: growwColors.text }}>
                      {ipo.logo}
                    </Text>
                  </Box>
                  <VStack style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: growwColors.text }}>
                      {ipo.name}
                    </Text>
                    <Text style={{ fontSize: 13, color: growwColors.textSecondary, marginTop: 2 }}>
                      Closes on {ipo.date}
                    </Text>
                    <Text style={{ fontSize: 13, color: growwColors.textSecondary, marginTop: 2 }}>
                      {ipo.subscribed} subscribed
                    </Text>
                  </VStack>
                </HStack>

                <Pressable
                  onPress={() => handleBulkCheck(ipo.id, ipo.name)}
                  disabled={checkingId !== null || savedPANs.length === 0}
                  style={{
                    borderWidth: 1,
                    borderColor: growwColors.border,
                    borderRadius: 12,
                    paddingHorizontal: 20,
                    paddingVertical: 8,
                    backgroundColor: 'transparent',
                    opacity: savedPANs.length === 0 ? 0.5 : 1,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Check allotment for ${ipo.name}`}
                  accessibilityState={{ disabled: checkingId !== null || savedPANs.length === 0, busy: checkingId === ipo.id }}
                >
                  {checkingId === ipo.id ? (
                    <ActivityIndicator color={growwColors.primary} size="small" />
                  ) : (
                    <Text style={{ color: growwColors.text, fontWeight: '600', fontSize: 14 }}>
                      Check
                    </Text>
                  )}
                </Pressable>
              </HStack>
            ))}

            {/* Load More Button */}
            {!showAllIpos && RECENT_ALLOTTED_IPOS.length > 2 && (
              <Pressable
                onPress={() => setShowAllIpos(true)}
                style={{
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderTopWidth: 1,
                  borderTopColor: growwColors.border,
                  marginTop: 8,
                }}
              >
                <HStack style={{ alignItems: 'center', gap: 4 }}>
                  <Text style={{ color: growwColors.primary, fontWeight: '600', fontSize: 14 }}>
                    Show more
                  </Text>
                  <Icon as={ChevronDown} size="sm" color={growwColors.primary} />
                </HStack>
              </Pressable>
            )}
          </VStack>
        </Box>

        {/* ── Results section ─────────────────────────────────────────────────── */}
        {results.length > 0 && (
          <Box
            style={{
              margin: 16,
              backgroundColor: growwColors.surface,
              borderRadius: 16,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {/* Results header */}
            <Pressable
              onPress={() => setResultsExpanded((v) => !v)}
              style={{ padding: 20, paddingBottom: resultsExpanded ? 12 : 20 }}
            >
              <HStack style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <VStack>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: growwColors.text, fontFamily: 'Inter_700Bold' }}>
                    Results
                  </Text>
                  <Text style={{ fontSize: 12, color: growwColors.textSecondary, marginTop: 2 }}>
                    {allottedCount}/{results.length} allotted for {ipoName}
                  </Text>
                </VStack>
                <Icon
                  as={resultsExpanded ? ChevronUp : ChevronDown}
                  size="sm"
                  color={growwColors.textSecondary}
                />
              </HStack>
            </Pressable>

            {resultsExpanded && (
              <>
                <Divider style={{ backgroundColor: growwColors.border }} />

                {/* Summary bar */}
                <HStack
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    justifyContent: 'space-around',
                    backgroundColor: growwColors.backgroundSecondary,
                  }}
                >
                  {[
                    { label: 'Allotted', count: allottedCount, color: growwColors.success },
                    { label: 'Not Allotted', count: notAllottedCount, color: growwColors.error },
                    { label: 'Pending', count: pendingCount, color: growwColors.warning },
                  ].map((s) => (
                    <VStack key={s.label} style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: 20, fontWeight: '700', color: s.color }}>
                        {s.count}
                      </Text>
                      <Text style={{ fontSize: 11, color: growwColors.textSecondary }}>
                        {s.label}
                      </Text>
                    </VStack>
                  ))}
                </HStack>

                <Divider style={{ backgroundColor: growwColors.border }} />

                <VStack style={{ gap: 10, padding: 16 }}>
                  {results.map((r, i) => (
                    <ResultRow key={i} result={r} />
                  ))}
                </VStack>
              </>
            )}
          </Box>
        )}
      </ScrollView>
    </Box>
  )
}
