/**
 * Design System Typography - MINT Design Tokens
 * 
 * Primary source: @groww-tech/mint-css
 */

import { mintTypography } from './mint-adapter';

export const typography = {
  // Font size scale (matching MINT)
  fontSize: {
    '2xs': 10,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
    '6xl': 48,
  },
  
  // Font weight scale
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line height scale
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // MINT typography presets
  presets: {
    bodySmall: mintTypography.bodySmall,
    bodyBase: mintTypography.bodyBase,
    bodyLarge: mintTypography.bodyLarge,
    bodySmallBold: mintTypography.bodySmallBold,
    bodyBaseBold: mintTypography.bodyBaseBold,
    bodyLargeBold: mintTypography.bodyLargeBold,
    headingSm: mintTypography.headingSm,
    headingMd: mintTypography.headingMd,
    headingLg: mintTypography.headingLg,
    displayMd: mintTypography.displayMd,
    displayLg: mintTypography.displayLg,
    buttonSm: mintTypography.buttonSm,
    buttonMd: mintTypography.buttonMd,
    buttonLg: mintTypography.buttonLg,
  },
} as const;

// Legacy exports for backward compatibility
export const fontSize = typography.fontSize;
export const fontWeight = typography.fontWeight;
export const lineHeight = typography.lineHeight;

export type Typography = typeof typography;
