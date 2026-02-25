/**
 * Design System Spacing - MINT Design Tokens
 * 
 * Primary source: @groww-tech/mint-css
 */

import { mintSpacing } from './mint-adapter';

export const spacing = {
  // MINT spacing scale
  xxs: mintSpacing.xxs,
  xs: mintSpacing.xs,
  sm: mintSpacing.sm,
  md: mintSpacing.md,
  base: mintSpacing.base,
  lg: mintSpacing.lg,
  xl: mintSpacing.xl,
  xxl: mintSpacing.xxl,
  xxxl: mintSpacing.xxxl,
} as const;

// Legacy numeric scale (kept for backward compatibility)
export const spacingScale = [
  mintSpacing.xxs,  // 0: 2
  mintSpacing.xs,   // 1: 4
  mintSpacing.sm,   // 2: 8
  mintSpacing.md,   // 3: 12
  mintSpacing.base, // 4: 16
  mintSpacing.lg,   // 5: 20
  mintSpacing.xl,   // 6: 24
  mintSpacing.xxl,  // 7: 32
  mintSpacing.xxxl, // 8: 40
] as const;

export type Spacing = typeof spacing;
