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
  Allotment: undefined
  Profile: undefined
}

// Screen Props
// TODO: verify if used, remove if not
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'HomeMain'>
export type IPODetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'IPODetails'>
export type CheckScreenProps = NativeStackScreenProps<RootStackParamList, 'Check'>

// Composite props for screens that need both stack and tab navigation
export type HomeTabScreenProps = CompositeScreenProps<
  NativeStackScreenProps<RootStackParamList, 'HomeMain'>,
  BottomTabScreenProps<TabParamList>
>

// Generic navigation prop for components
// TODO: verify if used, remove if not
export type AppNavigationProp = HomeScreenProps['navigation']
