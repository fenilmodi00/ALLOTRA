import React, { useState } from 'react'
import { Pressable, Switch } from 'react-native'
import { Box } from '@/components/ui/box'
import { HStack } from '@/components/ui/hstack'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { User, Settings, Moon, ChevronRight, Shield, LogOut, CreditCard } from 'lucide-react-native'
import { growwColors } from '../design-system/tokens/colors'

export default function ProfileScreen() {
    const [darkMode, setDarkMode] = useState(false)

    const MenuItem = ({ icon, title, subtitle, showToggle, isDestructive }: any) => (
        <Pressable>
            {({ pressed }: any) => (
                <HStack
                    style={{
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 16,
                      paddingHorizontal: 20,
                      backgroundColor: pressed ? growwColors.surface : 'white',
                    }}
                >
                    <HStack style={{ gap: 16, alignItems: 'center' }}>
                        <Box style={{ backgroundColor: growwColors.surface, padding: 8, borderRadius: 8 }}>
                            <Icon as={icon} size="lg" color={isDestructive ? growwColors.error : growwColors.text} />
                        </Box>
                        <VStack>
                            <Text style={{ fontSize: 16, fontWeight: '600', color: isDestructive ? growwColors.error : growwColors.text }}>
                                {title}
                            </Text>
                            {subtitle && (
                                <Text style={{ fontSize: 12, color: growwColors.textSecondary }}>
                                    {subtitle}
                                </Text>
                            )}
                        </VStack>
                    </HStack>

                    {showToggle ? (
                        <Switch
                            value={darkMode}
                            onValueChange={setDarkMode}
                            trackColor={{ false: growwColors.border, true: growwColors.primary }}
                            thumbColor={'white'}
                        />
                    ) : (
                        <Icon as={ChevronRight} size="lg" color={growwColors.textSecondary} />
                    )}
                </HStack>
            )}
        </Pressable>
    )

    return (
        <Box style={{ flex: 1, backgroundColor: growwColors.background }}>
            {/* Header */}
            <Box style={{ backgroundColor: growwColors.surface, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: growwColors.border }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: growwColors.text, fontFamily: 'Inter_700Bold' }}>
                    You
                </Text>
            </Box>

            <VStack style={{ flex: 1, marginTop: 12 }}>
                {/* Profile Section */}
                <Box style={{ backgroundColor: 'white', marginBottom: 12 }}>
                    <HStack style={{ paddingHorizontal: 20, paddingVertical: 20, alignItems: 'center', gap: 16 }}>
                        <Box style={{ backgroundColor: growwColors.primaryLight, padding: 16, borderRadius: 32 }}>
                            <Text style={{ fontSize: 24, fontWeight: '700', color: growwColors.primary }}>
                                JD
                            </Text>
                        </Box>
                        <VStack>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: growwColors.text }}>
                                John Doe
                            </Text>
                            <Text style={{ fontSize: 14, color: growwColors.textSecondary }}>
                                john.doe@example.com
                            </Text>
                        </VStack>
                    </HStack>
                </Box>

                {/* Saved PANs */}
                <Box style={{ backgroundColor: 'white', marginBottom: 12 }}>
                    <Text style={{ paddingHorizontal: 20, paddingVertical: 12, fontSize: 14, fontWeight: '600', color: growwColors.textSecondary }}>
                        ACCOUNT DETAILS
                    </Text>
                    <MenuItem
                        icon={CreditCard}
                        title="Saved PANs"
                        subtitle="Manage your saved PAN cards"
                    />
                </Box>

                {/* Settings */}
                <Box style={{ backgroundColor: 'white', marginBottom: 12 }}>
                    <Text style={{ paddingHorizontal: 20, paddingVertical: 12, fontSize: 14, fontWeight: '600', color: growwColors.textSecondary }}>
                        SETTINGS
                    </Text>
                    <MenuItem
                        icon={Moon}
                        title="Dark Mode"
                        showToggle
                    />
                    <MenuItem
                        icon={Shield}
                        title="Privacy & Security"
                    />
                    <MenuItem
                        icon={Settings}
                        title="App Settings"
                    />
                </Box>

                {/* Logout */}
                <Box style={{ backgroundColor: 'white' }}>
                    <MenuItem
                        icon={LogOut}
                        title="Log Out"
                        isDestructive
                    />
                </Box>

                <Text style={{ textAlign: 'center', marginTop: 24, color: growwColors.textSecondary, fontSize: 12 }}>
                    Version 1.0.0
                </Text>
            </VStack>
        </Box>
    )
}
