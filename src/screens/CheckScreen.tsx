import React, { useState } from 'react'
import { ScrollView } from 'react-native'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { growwColors } from '../design-system/tokens/colors'
import { PANInput, CheckButton, ResultCard } from '../components/common'
import { useAllotmentCheck } from '../hooks'

export default function CheckScreen({ route, navigation }: any) {
    const { ipoName, ipoId } = route.params || { ipoName: 'Select IPO', ipoId: null }
    const [pan, setPan] = useState('')
    const [error, setError] = useState('')

    // Use real allotment check hook
    const { result, loading, error: apiError, checkAllotment, reset } = useAllotmentCheck()

    const handleCheck = async () => {
        if (pan.length !== 10) {
            setError('Invalid PAN format')
            return
        }
        
        if (!ipoId) {
            setError('IPO ID not available')
            return
        }

        setError('')
        
        try {
            await checkAllotment(ipoId, pan)
        } catch (err) {
            console.error('Allotment check failed:', err)
        }
    }

    const handleCheckAnother = () => {
        reset()
        setPan('')
        setError('')
    }

    return (
        <Box style={{ flex: 1, backgroundColor: growwColors.background }}>
            {/* Header */}
            <Box style={{ backgroundColor: growwColors.surface, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: growwColors.border }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: growwColors.text, fontFamily: 'Inter_700Bold' }}>
                    {ipoName}
                </Text>
                <Text style={{ fontSize: 12, color: growwColors.textSecondary, marginTop: 4, fontFamily: 'Inter_400Regular' }}>
                    Check Allotment Status
                </Text>
            </Box>

            <ScrollView>
                <VStack style={{ gap: 16, padding: 20 }}>
                    {!result ? (
                        <>
                            <PANInput
                                value={pan}
                                onChangeText={(text) => {
                                    setPan(text)
                                    setError('')
                                }}
                                error={error || apiError || ''}
                                placeholder="Enter PAN (e.g. ABCDE1234F)"
                                label="Permanent Account Number"
                            />

                            {!ipoId && (
                                <Box style={{ backgroundColor: growwColors.warningBg, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: growwColors.warningBorder }}>
                                    <Text style={{ fontSize: 12, color: growwColors.warning }}>
                                        Please select an IPO from the list to check allotment status
                                    </Text>
                                </Box>
                            )}

                            <Box style={{ marginTop: 20 }}>
                                <CheckButton
                                    onPress={handleCheck}
                                    loading={loading}
                                    disabled={pan.length !== 10 || !ipoId}
                                    title="Check Status"
                                />
                            </Box>
                        </>
                    ) : (
                        <VStack style={{ gap: 16 }}>
                            <ResultCard
                                status={result.status}
                                sharesApplied={result.sharesApplied}
                                sharesAllotted={result.sharesAllotted}
                                message={result.message}
                            />

                            <Box style={{ marginTop: 20 }}>
                                <CheckButton
                                    onPress={handleCheckAnother}
                                    title="Check Another"
                                />
                            </Box>
                        </VStack>
                    )}
                </VStack>
            </ScrollView>
        </Box>
    )
}
