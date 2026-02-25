/**
 * MINT Design Token Adapter
 * 
 * Extracts design token values from @groww-tech/mint-css CSS variables
 * into React Native-compatible JS objects.
 * 
 * Source: node_modules/@groww-tech/mint-css/theme/tokens/
 */

export const mintColors = {
  // Content tokens (text/icon colors)
  contentPrimary: '#44475B',
  contentSecondary: '#7C7E8C',
  contentTertiary: '#A9ABB5',
  contentAccent: '#00B386',
  contentNegative: '#EB5B3C',
  contentPositive: '#00B386',
  contentWarning: '#F5A623',
  contentInverse: '#FFFFFF',
  contentLink: '#4E5ACC',

  // Background tokens
  backgroundPrimary: '#FFFFFF',
  backgroundSecondary: '#F5F6F8',
  backgroundTertiary: '#ECEDF0',
  backgroundAccent: 'rgba(0, 179, 134, 0.08)',
  backgroundNegative: 'rgba(235, 91, 60, 0.08)',
  backgroundPositive: 'rgba(0, 179, 134, 0.08)',

  // Border tokens
  borderPrimary: '#E0E0E0',
  borderSecondary: '#ECEDF0',
  borderAccent: '#00B386',

  // IPO-specific extensions (not in MINT, defined per app needs)
  ipoLive: '#00B386',
  ipoLiveBackground: 'rgba(0, 179, 134, 0.08)',
  ipoUpcoming: '#F5A623',
  ipoUpcomingBackground: 'rgba(245, 166, 35, 0.08)',
  ipoClosed: '#7C7E8C',
  ipoClosedBackground: 'rgba(124, 126, 140, 0.08)',
  ipoAllotment: '#4E5ACC',
  ipoAllotmentBackground: 'rgba(78, 90, 204, 0.08)',
} as const;

export const mintTypography = {
  bodySmall: { fontSize: 12, fontWeight: '400' as const, lineHeight: 18 },
  bodyBase: { fontSize: 14, fontWeight: '400' as const, lineHeight: 21 },
  bodyLarge: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySmallBold: { fontSize: 12, fontWeight: '600' as const, lineHeight: 18 },
  bodyBaseBold: { fontSize: 14, fontWeight: '600' as const, lineHeight: 21 },
  bodyLargeBold: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  headingSm: { fontSize: 16, fontWeight: '700' as const, lineHeight: 24 },
  headingMd: { fontSize: 20, fontWeight: '700' as const, lineHeight: 28 },
  headingLg: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  displayMd: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  displayLg: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  buttonSm: { fontSize: 12, fontWeight: '600' as const, lineHeight: 18 },
  buttonMd: { fontSize: 14, fontWeight: '600' as const, lineHeight: 21 },
  buttonLg: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
} as const;

export const mintSpacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export type MintColors = typeof mintColors;
export type MintTypography = typeof mintTypography;
export type MintSpacing = typeof mintSpacing;
