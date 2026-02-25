# MINT Design System Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate the IPO app's design system from custom Gluestack UI tokens to Groww's MINT design tokens while maintaining React Native compatibility. Keep Gluestack UI component primitives but restyle them to match Groww's production visual design.

**Architecture:** Extract design tokens (colors, typography, spacing) from `@groww-tech/mint-css` CSS variables into a React Native-compatible adapter module. Use these tokens to restyle existing Gluestack UI wrappers and custom components. Do NOT install `@groww-tech/ui-toolkit` (web-only, incompatible with RN).

**Tech Stack:** React Native + Expo, Gluestack UI v3, NativeWind v4, @groww-tech/mint-css (token extraction only), lucide-react-native (icons), tailwindcss v3

---

## Important Context

- **This is a React Native Expo app, NOT a website** — any web-only packages from Groww Webster are incompatible
- `@groww-tech/mint-css` provides CSS tokens only — we'll extract values manually into JS objects
- `@groww-tech/ui-toolkit` is React DOM-only — DO NOT install it
- `@groww-tech/icon-store` uses SVG/DOM — keep lucide-react-native instead
- Gluestack UI component primitives (`Box`, `Text`, `Button`, etc.) are RN-compatible and should be kept, just restyled

---

## Prerequisites

Before starting, verify the project state:

```bash
# Verify current dependencies
cat package.json | grep -E "(gluestack|mint-css|nativewind|tailwind)"

# Verify current design tokens exist
ls -la src/design-system/tokens/

# Verify Gluestack wrappers exist
ls -la components/ui/
```

---

## Phase 0: Foundation Setup

### Task 0.1: Install @groww-tech/mint-css Package

**Files:**
- Modify: `package.json`

**Step 1: Add mint-css dependency**

Run:
```bash
bun add @groww-tech/mint-css
```

Expected: Package added to dependencies

**Step 2: Verify installation**

Run:
```bash
ls node_modules/@groww-tech/mint-css/
```

Expected: Directory exists with theme/tokens folders

**Step 3: Commit**

```bash
git add package.json bun.lock
git commit -m "chore: add @groww-tech/mint-css for design tokens"
```

---

### Task 0.2: Create MINT Token Adapter Module

**Files:**
- Create: `src/design-system/tokens/mint-adapter.ts`

**Step 1: Create the adapter file**

```typescript
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
```

**Step 2: Verify file created**

Run:
```bash
ls -la src/design-system/tokens/mint-adapter.ts
```

Expected: File exists

**Step 3: Commit**

```bash
git add src/design-system/tokens/mint-adapter.ts
git commit -m "feat: add MINT design token adapter for RN"
```

---

### Task 0.3: Update Tailwind Config with MINT Colors

**Files:**
- Modify: `tailwind.config.js`

**Step 1: Read current tailwind config**

Run:
```bash
cat tailwind.config.js
```

**Step 2: Replace color palette with MINT values**

Replace the `colors` section in `tailwind.config.js` with:

```javascript
// MINT Design Tokens mapped to Tailwind
colors: {
  // Content colors
  'content-primary': '#44475B',
  'content-secondary': '#7C7E8C',
  'content-tertiary': '#A9ABB5',
  'content-accent': '#00B386',
  'content-negative': '#EB5B3C',
  'content-positive': '#00B386',
  'content-warning': '#F5A623',
  'content-inverse': '#FFFFFF',
  'content-link': '#4E5ACC',

  // Background colors
  'bg-primary': '#FFFFFF',
  'bg-secondary': '#F5F6F8',
  'bg-tertiary': '#ECEDF0',
  'bg-accent': 'rgba(0, 179, 134, 0.08)',
  'bg-negative': 'rgba(235, 91, 60, 0.08)',
  'bg-positive': 'rgba(0, 179, 134, 0.08)',

  // Border colors
  'border-default': '#E0E0E0',
  'border-secondary': '#ECEDF0',
  'border-accent': '#00B386',

  // IPO-specific
  'ipo-live': '#00B386',
  'ipo-live-bg': 'rgba(0, 179, 134, 0.08)',
  'ipo-upcoming': '#F5A623',
  'ipo-upcoming-bg': 'rgba(245, 166, 35, 0.08)',
  'ipo-closed': '#7C7E8C',
  'ipo-closed-bg': 'rgba(124, 126, 140, 0.08)',
  'ipo-allotment': '#4E5ACC',
  'ipo-allotment-bg': 'rgba(78, 90, 204, 0.08)',

  // Legacy aliases for backward compatibility
  primary: '#4E5ACC',
  accent: '#00B386',
  success: '#00B386',
  error: '#EB5B3C',
  warning: '#F5A623',
},
```

**Step 3: Verify TypeScript**

Run:
```bash
npx tsc --noEmit
```

Expected: No errors (or existing errors unchanged)

**Step 4: Commit**

```bash
git add tailwind.config.js
git commit -m "feat: map MINT design tokens in Tailwind config"
```

---

## Phase 1: Design Token Migration

### Task 1.1: Replace Colors Token File

**Files:**
- Modify: `src/design-system/tokens/colors.ts`

**Step 1: Read current colors file**

Run:
```bash
cat src/design-system/tokens/colors.ts
```

**Step 2: Replace with MINT-backed colors**

Replace the entire file content:

```typescript
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
  
  // Border colors
  border: mintColors.borderPrimary,
  borderLight: mintColors.borderSecondary,
  
  // Icon colors
  iconDefault: mintColors.contentPrimary,
  iconActive: mintColors.contentAccent,
  iconInactive: mintColors.contentTertiary,
  iconPositive: mintColors.contentPositive,
  iconNegative: mintColors.contentNegative,
  
  // IPO-specific (using IPO-specific tokens from adapter)
  ipoLive: mintColors.ipoLive,
  ipoLiveBackground: mintColors.ipoLiveBackground,
  ipoUpcoming: mintColors.ipoUpcoming,
  ipoUpcomingBackground: mintColors.ipoUpcomingBackground,
  ipoClosed: mintColors.ipoClosed,
  ipoClosedBackground: mintColors.ipoClosedBackground,
  ipoAllotment: mintColors.ipoAllotment,
  ipoAllotmentBackground: mintColors.ipoAllotmentBackground,
  
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
```

**Step 3: Verify TypeScript**

Run:
```bash
npx tsc --noEmit
```

Expected: No new errors

**Step 4: Commit**

```bash
git add src/design-system/tokens/colors.ts
git commit -m "refactor: replace colors with MINT design tokens"
```

---

### Task 1.2: Replace Typography Token File

**Files:**
- Modify: `src/design-system/tokens/typography.ts`

**Step 1: Read current typography file**

Run:
```bash
cat src/design-system/tokens/typography.ts
```

**Step 2: Replace with MINT typography scale**

```typescript
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
```

**Step 3: Verify TypeScript**

Run:
```bash
npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add src/design-system/tokens/typography.ts
git commit -m "refactor: replace typography with MINT design tokens"
```

---

### Task 1.3: Replace Spacing Token File

**Files:**
- Modify: `src/design-system/tokens/spacing.ts`

**Step 1: Read current spacing file**

Run:
```bash
cat src/design-system/tokens/spacing.ts
```

**Step 2: Replace with MINT spacing**

```typescript
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
```

**Step 4: Commit**

```bash
git add src/design-system/tokens/spacing.ts
git commit -m "refactor: replace spacing with MINT design tokens"
```

---

### Task 1.4: Update Design System Barrel Export

**Files:**
- Modify: `src/design-system/tokens/index.ts`

**Step 1: Read current barrel export**

Run:
```bash
cat src/design-system/tokens/index.ts
```

**Step 2: Update exports**

```typescript
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './mint-adapter';
```

**Step 3: Commit**

```bash
git add src/design-system/tokens/index.ts
git commit -f: "chore: update tokens barrel export to include MINT adapter"
```

---

## Phase 2: Eliminate Hardcoded Colors

### Task 2.1: Find All Hardcoded Colors

**Step 1: Search for hex color literals**

Run:
```bash
rg '#[0-9a-fA-F]{3,6}' src/ --type tsx | head -50
```

Expected: List of files with hardcoded colors

**Step 2: Search for rgba colors**

Run:
```bash
rg 'rgba?\(' src/ --type tsx | head -30
```

Expected: List of files with rgba colors

---

### Task 2.2: Replace #00B386 in IPOCard

**Files:**
- Modify: `src/components/ipo/IPOCard.tsx`

**Step 1: Read the file**

Run:
```bash
cat src/components/ipo/IPOCard.tsx
```

**Step 2: Find and replace hardcoded #00B386**

Replace all instances of `#00b386` or `#00B386` with references to mintColors.contentAccent or the imported colors:

```typescript
// At imports, add:
import { colors } from '@/design-system/tokens';

// Replace inline #00b386 with:
colors.contentAccent  // or 'contentAccent' if using inline style
```

**Step 3: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add src/components/ipo/IPOCard.tsx
git commit -m "refactor: replace hardcoded #00B386 with MINT tokens in IPOCard"
```

---

### Task 2.3: Replace #F5F6F8 in IPOCard

**Files:**
- Modify: `src/components/ipo/IPOCard.tsx`

**Step 1: Replace #F5F6F8 with MINT token**

Replace all instances of `#F5F6F8` with `colors.backgroundSecondary`:

```bash
sed -i 's/#F5F6F8/colors.backgroundSecondary/g' src/components/ipo/IPOCard.tsx
```

**Step 2: Commit**

```bash
git add src/components/ipo/IPOCard.tsx
git commit -m "refactor: replace #F5F6F8 with MINT tokens"
```

---

### Task 2.4: Migrate Remaining IPO Card Components

**Files:**
- Modify: `src/components/ipo/IPOStockCard.tsx`
- Modify: `src/components/ipo/IndexCard.tsx`

**For each file:**

**Step 1: Read the file**

Run:
```bash
cat src/components/ipo/IPOStockCard.tsx
```

**Step 2: Replace hardcoded colors**

Replace:
- `#00b386` / `#00B386` → `colors.contentAccent`
- `#f35d5d` → `colors.contentNegative`
- `#F5F6F8` → `colors.backgroundSecondary`
- Other hardcoded colors → nearest MINT token

**Step 3: Commit each file**

```bash
git add src/components/ipo/IPOStockCard.tsx
git commit -m "refactor: replace hardcoded colors with MINT tokens in IPOStockCard"
```

Repeat for IndexCard.tsx

---

### Task 2.5: Migrate Common Components

**Files:**
- Modify: `src/components/common/PillButton.tsx`
- Modify: `src/components/common/TabBar.tsx`
- Modify: `src/components/common/CheckButton.tsx`
- Modify: `src/components/common/PANInput.tsx`

**For each file:**

**Step 1: Read and replace hardcoded colors**

Run through each file, replace:
- `#00b386` → `colors.contentAccent`
- `#f35d5d` → `colors.contentNegative`
- `#F5F6F8` → `colors.backgroundSecondary`
- `#4e5acc` → `colors.contentLink`
- `#fbbf24` → `colors.contentWarning`

**Step 2: Commit each file**

```bash
git add src/components/common/PillButton.tsx
git commit -m "refactor: replace hardcoded colors with MINT tokens in PillButton"
```

Repeat for each component file

---

### Task 2.6: Migrate Home Components

**Files:**
- Modify: `src/components/home/HomeHeader.tsx`
- Modify: `src/components/home/IPOFilterTabs.tsx`
- Modify: `src/components/home/MarketIndicesSection.tsx`
- Modify: `src/components/home/PopularIPOsSection.tsx`

**For each file:**

**Step 1: Replace hardcoded colors**

**Step 2: Commit**

---

### Task 2.7: Migrate UI Components

**Files:**
- Modify: `src/components/ui/EmptyState.tsx`
- Modify: `src/components/ui/ErrorView.tsx`
- Modify: `src/components/ui/LoadingText.tsx`
- Modify: `src/components/ui/SkeletonBox.tsx`

**For each file:**

**Step 1: Replace hardcoded colors**

**Step 2: Commit**

---

## Phase 3: Component Visual Alignment

### Task 3.1: Restyle Gluestack Button

**Files:**
- Modify: `components/ui/button/index.tsx`

**Step 1: Read current button styles**

Run:
```bash
cat components/ui/button/index.tsx
```

**Step 2: Identify variant styles**

The file uses `tva()` function from Gluestack. Find where primary/action colors are defined.

**Step 3: Update to use MINT accent color**

Replace any hardcoded primary green/blue with MINT's contentAccent (#00B386)

**Step 4: Commit**

```bash
git add components/ui/button/index.tsx
git commit -m "style: use MINT accent color in Button component"
```

---

### Task 3.2: Restyle Gluestack Badge

**Files:**
- Modify: `components/ui/badge/index.tsx`

**Step 1: Read badge file**

Run:
```bash
cat components/ui/badge/index.tsx
```

**Step 2: Update colors**

Replace success/error/warning color definitions with MINT tokens

**Step 3: Commit**

```bash
git add components/ui/badge/index.tsx
git commit -m "style: use MINT semantic colors in Badge"
```

---

### Task 3.3: Restyle Gluestack Text

**Files:**
- Modify: `components/ui/text/index.tsx`
- Modify: `components/ui/text/styles.tsx`

**Step 1: Update default text color**

Replace default text color with `colors.contentPrimary`

**Step 2: Commit**

---

### Task 3.4: Restyle Gluestack Accordion

**Files:**
- Modify: `components/ui/accordion/index.tsx`

**Step 1: Update accordion colors**

Replace header/trigger colors with MINT tokens

**Step 2: Commit**

---

### Task 3.5: Restyle Gluestack Divider

**Files:**
- Modify: `components/ui/divider/index.tsx`

**Step 1: Update divider color**

Replace border color with `colors.borderPrimary`

**Step 2: Commit**

---

## Phase 4: Screen-by-Screen Migration

### Task 4.1: Migrate ProfileScreen

**Files:**
- Modify: `src/screens/ProfileScreen.tsx`

**Step 1: Read screen file**

Run:
```bash
cat src/screens/ProfileScreen.tsx
```

**Step 2: Replace className color literals**

Replace:
- `bg-[#hex]` → MINT-mapped bg class
- `text-[#hex]` → MINT-mapped text class

**Step 3: Commit**

```bash
git add src/screens/ProfileScreen.tsx
git commit -m "refactor: migrate ProfileScreen to MINT design tokens"
```

---

### Task 4.2: Migrate SearchScreen

**Files:**
- Modify: `src/screens/SearchScreen.tsx`

**Step 1: Migrate screen**

**Step 2: Commit**

---

### Task 4.3: Migrate CheckScreen

**Files:**
- Modify: `src/screens/CheckScreen.tsx`

**Step 1: Migrate screen**

**Step 2: Commit**

---

### Task 4.4: Migrate InvestmentsScreen

**Files:**
- Modify: `src/screens/InvestmentsScreen.tsx`

**Step 1: Migrate screen**

**Step 2: Commit**

---

### Task 4.5: Migrate HomeScreen

**Files:**
- Modify: `src/screens/HomeScreen.tsx`

**Step 1: Migrate screen**

**Step 2: Commit**

---

### Task 4.6: Migrate IPODetailsScreen

**Files:**
- Modify: `src/screens/IPODetailsScreen.tsx`

**Step 1: Migrate screen (largest screen)**

This is the most complex screen with accordion, multiple cards, dividers.

**Step 2: Commit**

```bash
git add src/screens/IPODetailsScreen.tsx
git commit -m "refactor: migrate IPODetailsScreen to MINT design tokens"
```

---

## Phase 5: Cleanup & Verification

### Task 5.1: Audit Remaining Hardcoded Values

**Step 1: Final audit**

Run:
```bash
rg '#[0-9a-fA-F]{3,6}' src/ --type tsx
```

Expected: Empty or minimal results

**Step 2: Commit if any fixes made**

---

### Task 5.2: Verify on iOS

**Step 1: Start Metro**

Run:
```bash
bun start
```

**Step 2: Run on iOS (in separate terminal)**

Run:
```bash
bun run ios
```

Expected: App builds and runs without crashes

**Step 3: Commit**

---

### Task 5.3: Verify on Android

**Step 1: Run on Android**

Run:
```bash
bun run android
```

Expected: App builds and runs without crashes

**Step 2: Commit**

---

### Task 5.4: Update Design System Documentation

**Files:**
- Modify: `src/design-system/index.ts`

**Step 1: Update barrel export**

```typescript
/**
 * Design System - MINT Design Tokens
 * 
 * This package provides design tokens from the MINT design system
 * (https://github.com/Groww-OSS/webster/tree/develop/packages/mint-css)
 * 
 * Usage:
 * import { colors, typography, spacing } from '@/design-system/tokens';
 * import { mintColors, mintTypography, mintSpacing } from '@/design-system/tokens';
 */

export * from './tokens';
export * from './themes';
// export * from './components'; // Future: when we add component presets
```

**Step 2: Commit**

```bash
git add src/design-system/index.ts
git commit -m "docs: update design system documentation"
```

---

### Task 5.5: Final TypeScript Check

**Step 1: Run full type check**

Run:
```bash
npx tsc --noEmit
```

Expected: No errors (or pre-existing errors only)

**Step 2: Commit if any fixes made**

---

## Summary

This migration introduces `@groww-tech/mint-css` as the source of truth for design tokens while keeping:
- Gluestack UI v3 for React Native component primitives
- NativeWind v4 for className-based styling
- lucide-react-native for icons

Key changes:
- 1 new file: `src/design-system/tokens/mint-adapter.ts`
- 3 modified token files: colors.ts, typography.ts, spacing.ts
- 1 modified: tailwind.config.js
- ~25+ component files restyled
- ~6 screen files migrated

Total estimated tasks: 35-40 individual commit-ready tasks

---

## Plan Complete

The plan is saved to `docs/plans/2026-02-25-mint-design-system-migration.md`.

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
