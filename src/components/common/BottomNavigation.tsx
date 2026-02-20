import React from 'react'
import { Pressable } from 'react-native'
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { growwColors } from '../../design-system/tokens/colors'

interface BottomNavigationProps {
    state: any,
    descriptors: any,
    navigation: any
}

export const BottomNavigation = ({ state, descriptors, navigation }: BottomNavigationProps) => {
    return (
        <Box
            style={{
                backgroundColor: 'white',
                height: 64,
                borderTopWidth: 0,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.1,
                shadowRadius: 5,
                elevation: 10,
                justifyContent: 'center',
                width: '100%',
            }}
        >
            <Box
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: 30,
                    height: '100%',
                }}
            >
                {state.routes.map((route: any, index: number) => {
                    const { options } = descriptors[route.key];
                    const label =
                        options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                                ? options.title
                                : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const color = isFocused ? growwColors.primary : growwColors.textSecondary;

                    // Icon mapping based on route name
                    const getIcon = () => {
                        if (label === 'Stocks') return <MaterialIcons name="show-chart" size={24} color={color} />
                        if (label === 'Mutual Funds') return <MaterialCommunityIcons name="view-grid-outline" size={24} color={color} />
                        if (label === 'UPI') return <Ionicons name="play-outline" size={24} color={color} />
                        if (route.name === 'Profile') return <Ionicons name="person-circle-outline" size={28} color={color} />
                        return <MaterialIcons name="circle" size={24} color={color} />
                    }

                    return (
                        <Pressable
                            key={index}
                            onPress={onPress}
                            style={{ alignItems: 'center', justifyContent: 'center' }}
                        >
                            <VStack className="items-center gap-1">
                                {getIcon()}
                                <Text
                                    style={{
                                        fontFamily: 'Roboto',
                                        fontWeight: '500',
                                        fontSize: 11,
                                        color,
                                    }}
                                >
                                    {label}
                                </Text>
                            </VStack>
                        </Pressable>
                    );
                })}
            </Box>
        </Box>
    )
}
