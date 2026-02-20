import React from 'react'
import { enableScreens } from 'react-native-screens'
import { GluestackUIProvider as GluestackV3Provider } from '@/components/ui/gluestack-ui-provider'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'

enableScreens()
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter'
import { growwColors } from './src/design-system/tokens/colors'
import { AppNavigator } from './src/components/common/AppNavigator'
import { useAppInitialization } from './src/hooks'
import './global.css'

export default function App() {
  // Load Inter fonts
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  })

  // Initialize app (cache warmup, etc.)
  const { initialized, warming, error } = useAppInitialization()

  // Run debug tests in development mode only
  React.useEffect(() => {
    if (__DEV__) {
      // Dynamically import debug utilities to avoid including them in production
      import('./src/debug/networkTest').then(({ runNetworkTest }) => {
        runNetworkTest()
      })
      import('./src/debug/testDataFix').then(({ testDataFix }) => {
        testDataFix()
      })
      import('./src/debug/testIPOData').then(({ runIPODataTest }) => {
        runIPODataTest()
      })
    }
  }, [])

  if (!fontsLoaded) {
    return null
  }

  // Show loading screen while initializing
  if (!initialized && warming) {
    return (
      <SafeAreaProvider>
        <GluestackV3Provider mode="light">
          <SafeAreaView style={{ flex: 1, backgroundColor: growwColors.background }}>
            <Box style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: growwColors.textSecondary }}>
                Initializing app...
              </Text>
              {error && (
                <Text style={{ fontSize: 12, color: growwColors.error, marginTop: 8, textAlign: 'center' }}>
                  {error}
                </Text>
              )}
            </Box>
          </SafeAreaView>
        </GluestackV3Provider>
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <GluestackV3Provider mode="light">
        <SafeAreaView style={{ flex: 1, backgroundColor: growwColors.background }}>
          <StatusBar style="auto" />
          <AppNavigator />
        </SafeAreaView>
      </GluestackV3Provider>
    </SafeAreaProvider>
  )
}
