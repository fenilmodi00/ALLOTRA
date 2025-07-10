import React from 'react';
import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Get publishable key from environment variables or use the hardcoded one
const publishableKey = 'pk_test_cHJvbW90ZWQtYWxiYWNvcmUtNDEuY2xlcmsuYWNjb3VudHMuZGV2JA';

// Define a token cache for Clerk
const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseClerkProvider 
      publishableKey={publishableKey}
      tokenCache={tokenCache}
    >
      {children}
    </BaseClerkProvider>
  );
} 