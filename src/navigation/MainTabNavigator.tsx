import React from 'react';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import PanManagementScreen from '../screens/PanManagement/PanManagementScreen';
import ResultsScreen from '../screens/Results/ResultsScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import { CustomTabBar } from '../components/navigation/CustomTabBar';

export type MainTabParamList = {
  Home: undefined;
  Likes: undefined;
  Search: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props: BottomTabBarProps) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen
        name="Likes"
        component={ResultsScreen}
        options={{ title: 'Results' }}
      />
      <Tab.Screen
        name="Search"
        component={PanManagementScreen}
        options={{ title: 'PAN Management' }}
      />
      <Tab.Screen
        name="Profile"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
} 