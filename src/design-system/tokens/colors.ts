/**
 * Design System Colors - MINT Design Tokens
 * 
 * Primary source: @groww-tech/mint-css
 * Adapter: src/design-system/tokens/mint-adapter.ts
 */

import { mintColors } from './mint-adapter';

// Primary export using MINT tokens
export const colors = {
  // Direct MINT mappings
  ...mintColors,
  
  // Semantic aliases for compatibility
  primary: mintColors.contentAccent,
  positive: mintColors.contentPositive,
  negative: mintColors.contentNegative,
  warning: mintColors.contentWarning,
  
  // Surface colors
  surface: mintColors.backgroundPrimary,
  surfaceHover: mintColors.backgroundSecondary,
  surfacePressed: mintColors.backgroundTertiary,
  
  // Text colors
  text: mintColors.contentPrimary,
  textSecondary: mintColors.contentSecondary,
  textTertiary: mintColors.contentTertiary,
  textInverse: mintColors.contentInverse,
  
  // Border colors
  border: mintColors.borderPrimary,
  borderLight: mintColors.borderSecondary,
  borderSubtle: mintColors.borderSecondary, // Added for compatibility
  borderStrong: mintColors.borderPrimary, // Added for compatibility
  borderFocus: mintColors.borderAccent, // Added for compatibility
  warningBorder: mintColors.borderPrimary, // Added for compatibility
  
  // Icon colors
  iconDefault: mintColors.contentPrimary,
  iconActive: mintColors.contentAccent,
  iconInactive: mintColors.contentTertiary,
  iconPositive: mintColors.contentPositive,
  iconNegative: mintColors.contentNegative,
  
  // Backwards compatibility additions that TypeScript was missing
  background: mintColors.backgroundPrimary,
  success: mintColors.contentPositive,
  error: mintColors.contentNegative,
  successBg: mintColors.backgroundPositive,
  errorBg: mintColors.backgroundNegative,
  warningBg: mintColors.backgroundNegative, // Fallback to negative for warning background
  secondary: mintColors.contentSecondary,
  primaryLight: mintColors.backgroundAccent,
  
  // IPO-specific (using IPO-specific tokens from adapter)
  ipoLive: mintColors.ipoLive,
  ipoLiveBackground: mintColors.ipoLiveBackground,
  ipoUpcoming: mintColors.ipoUpcoming,
  ipoUpcomingBackground: mintColors.ipoUpcomingBackground,
  ipoClosed: mintColors.ipoClosed,
  ipoClosedBackground: mintColors.ipoClosedBackground,
  ipoAllotment: mintColors.ipoAllotment,
  ipoAllotmentBackground: mintColors.ipoAllotmentBackground,
  
  // Legacy aliases for IPOs
  ipoLiveBg: mintColors.ipoLiveBackground,
  ipoUpcomingBg: mintColors.ipoUpcomingBackground,
  ipoClosedBg: mintColors.ipoClosedBackground,
  ipoAllotmentBg: mintColors.ipoAllotmentBackground,
  
  // Skeleton
  skeleton: mintColors.backgroundTertiary,
  skeletonHighlight: mintColors.backgroundSecondary,
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Dark mode tokens (placeholder - to be implemented)
  dark: {
    contentPrimary: '#FFFFFF',
    contentSecondary: '#A9ABB5',
    backgroundPrimary: '#1A1A1A',
    backgroundSecondary: '#2D2D2D',
    borderPrimary: '#3D3D3D',
  },
} as const;

// Backward-compatible export
export const growwColors = colors;

export type Colors = typeof colors;
