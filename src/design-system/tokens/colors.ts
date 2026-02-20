// Groww App Color Palette - Migrated from config/growwColors.ts
export const colors = {
  // Primary Brand Colors (Figma Extracted)
  primary: '#4e5acc', // Brand Primary (Indigo/Purple)
  primaryLight: '#eef0ff', // Light variant for backgrounds
  primaryDark: '#3a44a0', // Dark variant for active states

  // Secondary Brand Colors
  secondary: '#00b386', // Brand Green (Success/Growth)
  accent: '#f35d5d', // Brand Red (Error/Loss)

  // Semantic Colors
  success: '#00b386',
  successBg: '#e6f7f2', // Light green background
  successBorder: '#b3e6d9',
  error: '#f35d5d',
  errorBg: '#ffe5e5', // Light red background
  errorBorder: '#ffb3b3',
  warning: '#ffb900',
  warningBg: '#fff8e1', // Light yellow background
  warningBorder: '#ffe082',
  info: '#4e5acc',
  infoBg: '#eef0ff', // Light blue/purple background
  infoBorder: '#c5caff',

  // Surface Colors
  background: '#ffffff', // Background Primary
  backgroundSecondary: '#f5f5f5', // Background Secondary (lighter)
  backgroundTertiary: '#ececec', // Background Tertiary
  surface: '#ffffff',
  surfaceHover: '#fafafa',
  surfacePressed: '#f0f0f0',

  // Border Colors
  border: '#e8e8e8', // Border Default
  borderSubtle: '#cacaca', // Border Subtle (dashed)
  borderStrong: '#000000', // Border Strong
  borderFocus: '#4e5acc', // Focus ring

  // Text Colors
  text: '#000000', // Text Primary
  textSecondary: '#757575', // Text Muted
  textTertiary: '#999999', // Text Disabled
  textActive: '#4e5acc',
  textPositive: '#00b386',
  textNegative: '#f35d5d',
  textInverse: '#ffffff',
  textLink: '#4e5acc',

  // Icon Colors
  iconDefault: '#000000',
  iconActive: '#4e5acc',
  iconInactive: '#9e9e9e',
  iconPositive: '#00b386',
  iconNegative: '#f35d5d',

  // IPO Status Colors
  ipoLive: '#00b386',
  ipoLiveBg: '#e6f7f2',
  ipoUpcoming: '#4e5acc',
  ipoUpcomingBg: '#eef0ff',
  ipoClosed: '#757575',
  ipoClosedBg: '#f5f5f5',
  ipoAllotment: '#ffb900',
  ipoAllotmentBg: '#fff8e1',

  // Skeleton/Loading
  skeleton: '#e8e8e8',
  skeletonHighlight: '#f5f5f5',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.1)',

  // Dark Mode
  darkBg: '#0F1419',
  darkSurface: '#1A1F28',
  darkText: '#FFFFFF',
  darkBorder: '#2A303F',
} as const;

// Type for color keys
export type GrowwColorKey = keyof typeof colors;
export type ColorTokens = typeof colors;

// For backward compatibility, export as growwColors
export const growwColors = colors;