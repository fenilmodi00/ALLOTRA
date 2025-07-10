import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth, SignedIn, SignedOut } from '@clerk/clerk-expo';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import AdminPanelScreen from '../screens/Admin/AdminPanelScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  AdminPanel: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Stack navigator for authenticated users
function AuthenticatedStack() {
  // Check if the user has admin role
  // In a real app, you would use Clerk's user metadata or organization roles
  const isAdmin = false; // Placeholder for admin check

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabNavigator} />
      {isAdmin && (
        <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
      )}
    </Stack.Navigator>
  );
}

// Stack navigator for unauthenticated users
function UnauthenticatedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthNavigator} />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <SignedIn>
        <AuthenticatedStack />
      </SignedIn>
      <SignedOut>
        <UnauthenticatedStack />
      </SignedOut>
    </NavigationContainer>
  );
} 