import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'
import { Icon } from '@/components/ui/icon'
import { Home, Search, User, Briefcase } from 'lucide-react-native'
import HomeScreen from '../../screens/HomeScreen'
import CheckScreen from '../../screens/CheckScreen'
import ProfileScreen from '../../screens/ProfileScreen'
import InvestmentsScreen from '../../screens/InvestmentsScreen'
import SearchScreen from '../../screens/SearchScreen'
import IPODetailsScreen from '../../screens/IPODetailsScreen'
import { BottomNavigation } from './BottomNavigation'
import type { RootStackParamList, TabParamList } from '../../types/navigation.types'

const Tab = createBottomTabNavigator<TabParamList>()
const Stack = createNativeStackNavigator<RootStackParamList>()

// Home Stack (Home -> Details -> Check)
const HomeStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeMain" component={HomeScreen} />
            <Stack.Screen name="IPODetails" component={IPODetailsScreen} />
            <Stack.Screen name="Check" component={CheckScreen} />
        </Stack.Navigator>
    )
}

export const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Tab.Navigator
                tabBar={props => <BottomNavigation {...props} />}
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Tab.Screen
                    name="Home"
                    component={HomeStack}
                    options={{
                        tabBarIcon: ({ color }) => <Icon as={Home} color={color} size="xl" className="h-6 w-6" />,
                        tabBarLabel: 'Stocks'
                    }}
                />
                <Tab.Screen
                    name="Mutual Funds"
                    component={InvestmentsScreen}
                    options={{
                        tabBarIcon: ({ color }) => <Icon as={Briefcase} color={color} size="xl" className="h-6 w-6" />,
                        tabBarLabel: 'Mutual Funds'
                    }}
                />
                <Tab.Screen
                    name="Pay"
                    component={SearchScreen}
                    options={{
                        tabBarIcon: ({ color }) => <Icon as={Search} color={color} size="xl" className="h-6 w-6" />,
                        tabBarLabel: 'UPI'
                    }}
                />
                <Tab.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{
                        tabBarIcon: ({ color }) => <Icon as={User} color={color} size="xl" className="h-6 w-6" />,
                        tabBarLabel: 'You'
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    )
}
