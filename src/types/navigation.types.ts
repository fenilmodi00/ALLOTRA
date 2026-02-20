import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { CompositeScreenProps } from '@react-navigation/native'

// Root Stack (nested inside Home tab)
export type RootStackParamList = {
  HomeMain: undefined
  IPODetails: { ipoId: string; ipoName: string }
  Check: { ipoId: string; ipoName: string }
}

// Bottom Tab Navigator
export type TabParamList = {
  Home: undefined
  'Mutual Funds': undefined
  Pay: undefined
  Profile: undefined
}

// Screen Props
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'HomeMain'>
export type IPODetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'IPODetails'>
export type CheckScreenProps = NativeStackScreenProps<RootStackParamList, 'Check'>

// Composite props for screens that need both stack and tab navigation
export type HomeTabScreenProps = CompositeScreenProps<
  NativeStackScreenProps<RootStackParamList, 'HomeMain'>,
  BottomTabScreenProps<TabParamList>
>

// Generic navigation prop for components
export type AppNavigationProp = HomeScreenProps['navigation']
