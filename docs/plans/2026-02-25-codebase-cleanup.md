# Codebase Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove unused code, dead variables, ungated console calls, duplicate logic, and unnecessary patterns across the entire `src/` tree to reduce bundle size, eliminate runtime noise, and improve maintainability.

**Architecture:** Each task is scoped to one file or one cross-cutting concern. Tasks within the same "domain group" are independent and can be dispatched in parallel. No new features are added — only removals and targeted rewrites of existing code.

**Tech Stack:** React Native, Expo, TypeScript (strict), Zustand, Gluestack UI, React Navigation.

---

## Cleanup Groups (Parallel Dispatch Strategy)

The tasks are grouped into 5 independent domains. All tasks within a group can run in parallel. Groups must be completed in order only where noted.

---

## Group A — Hooks (run in parallel)

### Task A1: `src/hooks/useIPOData.ts`

**Files:**
- Modify: `src/hooks/useIPOData.ts`

**Step 1: Remove `usePerformanceMetrics` (unused exported hook)**

Delete lines ~330–347. The hook is never imported or called anywhere in the codebase.

```ts
// DELETE this entire export:
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<any>(null)
  ...
}
```

**Step 2: Remove stale comment**

Find and delete the comment:
```ts
// V2: Use optimized endpoint
```

**Step 3: Replace ungated `console.warn` calls with `devError`**

Both raw warnings exist at ~line 331 and ~line 358. Replace each:

```ts
// BEFORE:
console.warn('Performance metrics not available:', err)
console.warn('Cache warmup failed:', err)

// AFTER:
devError('Performance metrics not available:', err)
devError('Cache warmup failed:', err)
```

`devError` is already imported from `../utils/logger` in this file.

**Step 4: Verify**

Search the whole codebase for `usePerformanceMetrics` — confirm zero call sites before deleting.

```bash
npx tsc --noEmit 2>&1 | head -40
```

**Step 5: Commit**

```bash
git add src/hooks/useIPOData.ts
git commit -m "cleanup: remove unused usePerformanceMetrics hook and gate console.warn calls"
```

---

### Task A2: `src/hooks/useIPOFiltering.ts`

**Files:**
- Modify: `src/hooks/useIPOFiltering.ts`

**Step 1: Delete `startOfDay` and `endOfDay` dead functions**

Both are defined at module scope (~lines 39–49) but have zero call sites in the file or the wider codebase.

```ts
// DELETE both:
const startOfDay = (date: Date): Date => { ... }
const endOfDay   = (date: Date): Date => { ... }
```

**Step 2: Add inline comment on `IST_OFFSET_MS`**

```ts
// BEFORE:
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000

// AFTER:
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000 // UTC+5:30 in milliseconds
```

**Step 3: Commit**

```bash
git add src/hooks/useIPOFiltering.ts
git commit -m "cleanup: remove dead startOfDay/endOfDay helpers"
```

---

### Task A3: `src/hooks/useAppInitialization.ts`

**Files:**
- Modify: `src/hooks/useAppInitialization.ts`

**Step 1: Remove unused `ipoService` import (~line 3)**

```ts
// DELETE:
import { ipoService } from '../services/ipoService'
```

**Step 2: Gate `console.warn` (~line 28)**

```ts
// BEFORE:
console.warn('App initialization failed:', err)

// AFTER:
devError('App initialization failed:', err)
```

Import `devError` from `'../utils/logger'` if not already imported.

**Step 3: Remove open-ended TODO comments (~lines 23–24)**

```ts
// DELETE these lines:
// You can add other initialization tasks here
// e.g., check app version, sync user preferences, etc.
```

**Step 4: Commit**

```bash
git add src/hooks/useAppInitialization.ts
git commit -m "cleanup: remove unused ipoService import, gate console.warn, remove TODO comments"
```

---

### Task A4: `src/hooks/useDynamicSpacing.ts`

**Files:**
- Modify: `src/hooks/useDynamicSpacing.ts`

**Step 1: Remove redundant condition in `calculateSpacing` (~line 37)**

```ts
// BEFORE:
if (isExpanded && ipoCount > 6) return spacing.expanded

// AFTER (the > 6 check is always true at this branch):
if (isExpanded) return spacing.expanded
```

**Step 2: Collapse redundant `useMemo(useCallback)` pattern (~line 41)**

```ts
// BEFORE:
const currentSpacing = useMemo(() => calculateSpacing(), [calculateSpacing])

// AFTER (calculateSpacing is already stable via useCallback):
const currentSpacing = calculateSpacing()
```

Remove the now-unused `useMemo` import if it becomes unused (check the file's other usages first).

**Step 3: Commit**

```bash
git add src/hooks/useDynamicSpacing.ts
git commit -m "cleanup: remove redundant condition and unnecessary useMemo wrapper in useDynamicSpacing"
```

---

## Group B — Services (run in parallel)

### Task B1: `src/services/ipoService.ts`

**Files:**
- Modify: `src/services/ipoService.ts`

**Step 1: Remove exact-duplicate `getLiveIPOs`**

`getActiveIPOs` and `getLiveIPOs` both call `getFeedV2({ status: 'live' })`. Pick one and delete the other. Prefer keeping `getActiveIPOs` (semantically clearer).

```ts
// DELETE:
async getLiveIPOs(): Promise<DisplayIPO[]> { return this.getFeedV2({ status: 'live' }) }
```

Grep for `getLiveIPOs` across the codebase and update any call sites to use `getActiveIPOs`.

**Step 2: Remove thin-wrapper aliases with zero external call sites**

Verify each of the following has no external callers (grep the codebase), then delete:

- `getIPOs()` — wraps `getFeedV2`
- `getActiveIPOsWithGMP()` — wraps `getFeedV2({ status: 'all' })`
- `getIPOById()` — wraps `getIPOByIdWithGMP()`
- `checkAllotment()` — wraps `checkAllotmentV2()`

```ts
// DELETE each verified-unused wrapper method
```

**Step 3: Fix the false tree-shaking comment and redundant re-exports (~lines 224–240)**

```ts
// BEFORE (misleading comment):
// Named exports for tree-shaking
export const { getIPOs, getActiveIPOsWithGMP, ... } = ipoService

// AFTER — remove the comment; keep only re-exports that have actual callers,
// or remove the entire block if callers import `ipoService` directly.
```

**Step 4: Add a TODO comment on the `ipoName` silent gap (~line 176)**

```ts
// BEFORE:
ipoName: '',

// AFTER:
ipoName: '', // TODO: V2 API does not return ipoName; resolve when endpoint is updated
```

**Step 5: Commit**

```bash
git add src/services/ipoService.ts
git commit -m "cleanup: remove duplicate getLiveIPOs and unused thin-wrapper methods in ipoService"
```

---

## Group C — Utils (run in parallel)

### Task C1: `src/utils/dataTransformers.ts`

**Files:**
- Modify: `src/utils/dataTransformers.ts`

**Step 1: Gate all `console.warn` calls with `devError`**

There are 5 ungated warnings at lines ~31, ~124, ~213, ~224, ~261.

```ts
// BEFORE:
console.warn('⚠️ transformIPOData received null/undefined IPO data')

// AFTER:
devError('transformIPOData received null/undefined IPO data')
```

Import `devError` from `'../utils/logger'` (relative import from within utils: `'./logger'`).

**Step 2: Fix `any[]` parameter in `transformRawFinancials` (~line 86)**

```ts
// BEFORE:
const transformRawFinancials = (rawFinancials: any[]): IPOFinancial[] => {

// AFTER — define a minimal raw type or use unknown[]:
type RawFinancial = Record<string, unknown>
const transformRawFinancials = (rawFinancials: RawFinancial[]): IPOFinancial[] => {
```

Add the `RawFinancial` type at the top of the file (not in `src/types/` — it is an internal transformer detail).

**Step 3: Remove redundant `'LIVE'` case in `normalizeIPOStatus` (~lines 9–24)**

```ts
// BEFORE:
case 'ACTIVE':
case 'ONGOING':
  return 'LIVE'
case 'LIVE':    // <-- redundant (same return)
  return 'LIVE'

// AFTER:
case 'ACTIVE':
case 'ONGOING':
case 'LIVE':
  return 'LIVE'
```

**Step 4: Commit**

```bash
git add src/utils/dataTransformers.ts
git commit -m "cleanup: gate console.warn calls, fix any[] type, remove redundant LIVE case"
```

---

### Task C2: `src/utils/asyncStorageCache.ts`

**Files:**
- Modify: `src/utils/asyncStorageCache.ts`

**Step 1: Verify `cacheRead` has zero call sites**

```bash
# Search project (excluding node_modules):
grep -r "cacheRead" src/ --include="*.ts" --include="*.tsx"
```

If zero results (other than its own definition and export), proceed.

**Step 2: Remove or mark `cacheRead` as intentionally unused**

Option A (preferred — remove dead export):
```ts
// DELETE the entire cacheRead function and its export
```

Option B (if there's intent to use it later):
```ts
// Add comment:
/** @deprecated Use cacheReadStale instead. Remove if no callers exist by next cleanup cycle. */
export function cacheRead<T>(...) { ... }
```

**Step 3: Commit**

```bash
git add src/utils/asyncStorageCache.ts
git commit -m "cleanup: remove unused cacheRead export from asyncStorageCache"
```

---

## Group D — Screens (run in parallel)

### Task D1: `src/screens/HomeScreen.tsx`

**Files:**
- Modify: `src/screens/HomeScreen.tsx`

**Step 1: Merge fragmented imports from `'../hooks'` (~lines 4–6)**

```ts
// BEFORE:
import { useIPOList, useMarketIndices } from '../hooks'
import { useIPOFiltering } from '../hooks'
import { useDynamicSpacing } from '../hooks'

// AFTER:
import { useIPOList, useMarketIndices, useIPOFiltering, useDynamicSpacing } from '../hooks'
```

**Step 2: Hoist `filters` array to module scope**

```ts
// BEFORE (inside component body):
const filters = ['upcoming', 'ongoing', 'allotted', 'listed']

// AFTER (at module scope, above the component):
const FILTERS = ['upcoming', 'ongoing', 'allotted', 'listed'] as const
```

Update all references from `filters` → `FILTERS` inside the component.

**Step 3: Replace ungated `console.log` with `devLog` (~line 52)**

```ts
// BEFORE:
console.log('📋 IPO Card Navigation:', ipo.name, ipo.id)

// AFTER:
devLog('IPO Card Navigation:', ipo.name, ipo.id)
```

Import `devLog` from `'../utils/logger'`.

**Step 4: Commit**

```bash
git add src/screens/HomeScreen.tsx
git commit -m "cleanup: merge imports, hoist filters constant, gate console.log in HomeScreen"
```

---

### Task D2: `src/screens/IPODetailsScreen.tsx`

**Files:**
- Modify: `src/screens/IPODetailsScreen.tsx`

**Step 1: Remove unused imports (~line 4)**

```ts
// Remove from the lucide-react-native import list:
CheckCircle
ImageIcon  (imported as "Image as ImageIcon")
PlayCircle  // only referenced inside commented-out block
```

**Step 2: Delete the commented-out YouTube video block (~lines 439–455)**

The 17-line JSX block for the video player is commented out. Delete it entirely.

```tsx
// DELETE the entire block:
{/* {ipo.videoId ? (
  <Pressable onPress={...}>
    ...
  </Pressable>
) : null} */}
```

If this feature is desired in future, it should be tracked as a GitHub issue, not dead JSX in the file.

**Step 3: Remove redundant `ipo` variable alias (~line 72)**

```ts
// BEFORE:
const ipo: DisplayIPO | null = fetchedIPO

// AFTER — use fetchedIPO directly, or rename at destructuring:
const { data: ipo, loading, error } = useIPODetails(ipoId)
// (exact form depends on hook return shape — adjust accordingly)
```

**Step 4: Fix `isLast` no-op in `TimelineItem` (~line 46)**

```tsx
// BEFORE:
<HStack className={`pl-0 py-3 ${isLast ? '' : ''} items-start`}>

// AFTER (remove the useless ternary):
<HStack className="pl-0 py-3 items-start">
```

Also remove `isLast` from the destructured props since it now serves no purpose.

**Step 5: Add proper `interface` for `TimelineItem` props (~line 45)**

```tsx
// BEFORE:
const TimelineItem = ({ title, date, isActive, showInfo, color = '#00b386' }: any) => (

// AFTER:
interface TimelineItemProps {
  title: string
  date: string | null | undefined
  isActive: boolean
  showInfo?: boolean
  color?: string
}
const TimelineItem = ({ title, date, isActive, showInfo, color = '#00b386' }: TimelineItemProps) => (
```

**Step 6: Fix trailing spaces in style height values (~lines 330–333)**

```ts
// BEFORE:
if (listingDate && today >= listingDate) return '100% ';
if (allotmentDate && today >= allotmentDate) return '75% ';
if (closeDate && today >= closeDate) return '50% ';
if (openDate && today >= openDate) return '25% ';

// AFTER (remove trailing space in each string):
if (listingDate && today >= listingDate) return '100%'
if (allotmentDate && today >= allotmentDate) return '75%'
if (closeDate && today >= closeDate) return '50%'
if (openDate && today >= openDate) return '25%'
```

**Step 7: Use destructured `useRef` instead of `React.useRef` (~line 77)**

```ts
// BEFORE:
const scrollY = React.useRef(new Animated.Value(0)).current

// AFTER (add useRef to the React import at top of file):
const scrollY = useRef(new Animated.Value(0)).current
```

**Step 8: Commit**

```bash
git add src/screens/IPODetailsScreen.tsx
git commit -m "cleanup: remove unused imports, dead JSX, fix any props, trailing spaces in IPODetailsScreen"
```

---

### Task D3: `src/screens/InvestmentsScreen.tsx`

**Files:**
- Modify: `src/screens/InvestmentsScreen.tsx`

**Step 1: Delete commented-out import (~line 10)**

```ts
// DELETE:
// import { StockCard } from '../components/stocks/StockCard' // Removed unused import
```

**Step 2: Fix `any` navigation prop type (~line 13)**

```ts
// BEFORE:
export default function InvestmentsScreen({ navigation }: any) {

// AFTER:
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation.types'

type InvestmentsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Investments'>

export default function InvestmentsScreen({ navigation }: { navigation: InvestmentsNavigationProp }) {
```

Check `navigation.types.ts` for the exact param list type name — adjust `RootStackParamList` if different.

**Step 3: Hoist mock `funds` data to module scope (~lines 16–21)**

```ts
// BEFORE (inside component body):
const funds = [
  { name: 'Quant Small Cap Fund', price: 245.60, ... },
  ...
]

// AFTER (at module scope, clearly marked as placeholder):
// TODO: Replace with real API data when investments endpoint is available
const PLACEHOLDER_FUNDS = [
  { name: 'Quant Small Cap Fund', price: 245.60, ... },
  ...
]
```

**Step 4: Delete TODO design comments (~lines 62–63)**

```ts
// DELETE:
// Reusing StockCard styles but potentially different layout if desired
// For now, listing them horizontally or vertically
```

**Step 5: Add comment on no-op `activeTab` state (~line 14)**

Rather than deleting working tab UI (which is visible), add a note:

```ts
// TODO: activeTab does not yet filter content — wire to data source when investments API is integrated
const [activeTab, setActiveTab] = useState('Popular')
```

**Step 6: Commit**

```bash
git add src/screens/InvestmentsScreen.tsx
git commit -m "cleanup: remove commented import, fix any nav prop, hoist mock data in InvestmentsScreen"
```

---

### Task D4: `src/screens/ProfileScreen.tsx`

**Files:**
- Modify: `src/screens/ProfileScreen.tsx`

**Step 1: Add TODO comment on no-op `darkMode` state (~line 12)**

The dark mode toggle is wired to UI but applies no actual styling change. Do not delete the UI (it's a visible feature stub). Mark it explicitly:

```ts
// TODO: darkMode state is not yet applied to theme — wire to ThemeContext or Gluestack mode prop
const [darkMode, setDarkMode] = useState(false)
```

**Step 2: Add TODO on hardcoded user data (~lines 77–81)**

```tsx
{/* TODO: Replace with real authenticated user data */}
<Text ...>John Doe</Text>
<Text ...>john.doe@example.com</Text>
```

**Step 3: Commit**

```bash
git add src/screens/ProfileScreen.tsx
git commit -m "cleanup: mark no-op darkMode and placeholder user data with TODO comments in ProfileScreen"
```

---

## Group E — Components (run in parallel)

### Task E1: `src/components/common/AppNavigator.tsx`

**Files:**
- Modify: `src/components/common/AppNavigator.tsx`

**Step 1: Remove dead `tabBarStyle` and `tabBarShowLabel` options (~lines 36–39)**

When a custom `tabBar` prop is provided, the default renderer is replaced entirely. These options have no effect:

```ts
// BEFORE:
screenOptions={{
  headerShown: false,
  tabBarStyle: { display: 'none' },
  tabBarShowLabel: false,
}}

// AFTER:
screenOptions={{
  headerShown: false,
}}
```

**Step 2: Commit**

```bash
git add src/components/common/AppNavigator.tsx
git commit -m "cleanup: remove dead tabBarStyle options that have no effect with custom tabBar"
```

---

### Task E2: `src/components/common/BottomNavigation.tsx`

**Files:**
- Modify: `src/components/common/BottomNavigation.tsx`

**Step 1: Replace `any` prop types with proper React Navigation types (~lines 10–13)**

```ts
// BEFORE:
interface BottomNavigationProps {
  state: any,
  descriptors: any,
  navigation: any
}

// AFTER:
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'

// Replace entire interface with the library type:
// The component signature becomes:
export function BottomNavigation({ state, descriptors, navigation }: BottomTabBarProps) {
```

Verify `@react-navigation/bottom-tabs` is already in `package.json` (it should be if bottom tabs are used).

**Step 2: Commit**

```bash
git add src/components/common/BottomNavigation.tsx
git commit -m "cleanup: replace any prop types with BottomTabBarProps in BottomNavigation"
```

---

### Task E3: `src/components/ipo/IPOCard.tsx`

**Files:**
- Modify: `src/components/ipo/IPOCard.tsx`

**Step 1: Merge duplicate `react-native` imports (~lines 1–3)**

```ts
// BEFORE:
import { Pressable } from 'react-native'
import { Image as RNImage } from 'react-native'

// AFTER:
import { Pressable, Image as RNImage } from 'react-native'
```

**Step 2: Replace inline `__DEV__` guard with `devLog` (~line 67)**

```ts
// BEFORE:
if (__DEV__) console.log('Failed to load logo for:', ipo.name)

// AFTER:
devLog('Failed to load logo for:', ipo.name)
```

Import `devLog` from `'../../utils/logger'` (adjust relative path as needed).

**Step 3: Commit**

```bash
git add src/components/ipo/IPOCard.tsx
git commit -m "cleanup: merge react-native imports, use devLog in IPOCard"
```

---

### Task E4: `src/components/ipo/IPOSection.tsx`

**Files:**
- Modify: `src/components/ipo/IPOSection.tsx`

**Step 1: Remove vacuous `useMemo` (~lines 34–36)**

```ts
// BEFORE:
const displayIPOs = useMemo(() => {
  return ipos
}, [ipos])

// AFTER:
const displayIPOs = ipos
```

Remove the `useMemo` import if it becomes unused after this change.

**Step 2: Remove `onToggleShowMore` from props interface (~line 81)**

The prop is declared but never called inside the component.

```ts
// BEFORE (in interface):
onToggleShowMore: () => void

// AFTER:
// Delete the prop from the interface and from destructuring
```

Search for callers of `IPOSection` that pass `onToggleShowMore` — remove the prop from those call sites too.

**Step 3: Commit**

```bash
git add src/components/ipo/IPOSection.tsx
git commit -m "cleanup: remove vacuous useMemo and unused onToggleShowMore prop in IPOSection"
```

---

### Task E5: `src/components/ipo/IPOStockCard.tsx`

**Files:**
- Modify: `src/components/ipo/IPOStockCard.tsx`

**Step 1: Collapse excessive `useMemo` style arrays (~lines 280–298)**

Six `useMemo` calls each wrap a two-element style array merge. These are cheap to compute and all depend on the same `statusConfig` memo. Inline them directly:

```ts
// BEFORE:
const glowDotStyle = useMemo(() => [styles.glowDot, { backgroundColor: statusConfig.dotColor, ... }], [statusConfig])
const innerDotStyle = useMemo(() => [styles.innerDot, { backgroundColor: statusConfig.dotColor }], [statusConfig])
// ... four more

// AFTER — inline in JSX or compute as plain objects:
const glowDotStyle    = [styles.glowDot,    { backgroundColor: statusConfig.dotColor, ...glowExtras }]
const innerDotStyle   = [styles.innerDot,   { backgroundColor: statusConfig.dotColor }]
// ... same pattern for remaining four
```

Remove any `useMemo` imports that become unused after this change.

**Step 2: Commit**

```bash
git add src/components/ipo/IPOStockCard.tsx
git commit -m "cleanup: remove excessive useMemo wrappers for style arrays in IPOStockCard"
```

---

### Task E6: `src/components/home/HomeHeader.tsx`

**Files:**
- Modify: `src/components/home/HomeHeader.tsx`

**Step 1: Fix `Pressable` with no `onPress` handler (~lines 57–59)**

The `Grid` icon sits inside a `Pressable` that has no `onPress`. It appears tappable but does nothing:

```tsx
// BEFORE:
<Pressable>
  <Icon as={Grid} size="xl" className="h-6 w-6" color={growwColors.text} />
</Pressable>

// AFTER — remove Pressable wrapper until a handler is implemented:
<Icon as={Grid} size="xl" className="h-6 w-6" color={growwColors.text} />
```

Also remove the `Grid` icon import from lucide if it becomes unused, and remove `Pressable` import if no other usage exists.

**Step 2: Commit**

```bash
git add src/components/home/HomeHeader.tsx
git commit -m "cleanup: remove non-functional Pressable wrapper from Grid icon in HomeHeader"
```

---

### Task E7: `src/components/home/PopularIPOsSection.tsx`

**Files:**
- Modify: `src/components/home/PopularIPOsSection.tsx`

**Step 1: Delete unused `styles.skeletonRow` style entry (~lines 216–219)**

```ts
// DELETE from StyleSheet.create({}):
skeletonRow: {
  flexDirection: 'row',
  gap: CARD_GAP,
},
```

Verify no JSX references `styles.skeletonRow` before deleting.

**Step 2: Commit**

```bash
git add src/components/home/PopularIPOsSection.tsx
git commit -m "cleanup: remove unused skeletonRow style in PopularIPOsSection"
```

---

## Group F — Cross-Cutting (after Groups A-E complete)

### Task F1: Verify duplicate status-colour logic (analysis only — no breaking change)

**Files:**
- Read: `src/utils/dataTransformers.ts`
- Read: `src/utils/formatters.ts`
- Read: `src/components/ipo/IPOCard.tsx`
- Read: `src/components/ipo/IPOStockCard.tsx`

Status colour mapping currently exists in **three** places. Full consolidation requires touching many files and is a separate refactor. In this task:

**Step 1:** Add a `// TODO: consolidate status colour mapping into design-system tokens` comment at the top of `formatters.ts` and `dataTransformers.ts`.

**Step 2:** Commit this marker:

```bash
git add src/utils/formatters.ts src/utils/dataTransformers.ts
git commit -m "cleanup: mark duplicate status-colour logic for future consolidation"
```

---

### Task F2: Verify TypeScript after all changes

**Step 1:** Run type check:

```bash
npx tsc --noEmit 2>&1
```

**Step 2:** Fix any new errors introduced by the cleanup tasks (removed props, changed types, etc.).

**Step 3:** If errors pre-existed before this cleanup (noted in AGENTS.md as a known `tsconfig`/`moduleResolution` mismatch), do NOT fix those — only fix regressions introduced by the cleanup tasks.

**Step 4:** Commit any type-error fixes:

```bash
git add <files>
git commit -m "fix: resolve type errors after cleanup"
```

---

## Execution Summary

| Group | Tasks | Can Run In Parallel |
|-------|-------|---------------------|
| A — Hooks | A1, A2, A3, A4 | Yes (all 4 in parallel) |
| B — Services | B1 | Run after A |
| C — Utils | C1, C2 | Yes (both in parallel) |
| D — Screens | D1, D2, D3, D4 | Yes (all 4 in parallel) |
| E — Components | E1, E2, E3, E4, E5, E6, E7 | Yes (all 7 in parallel) |
| F — Cross-cutting | F1, F2 | F2 must run last |

**Total tasks:** 19
**Estimated commits:** 19 (one per task)

---

## What This Cleanup Does NOT Do

- Does not change any user-visible behavior
- Does not remove the `src/debug/` files (they are intentionally dev-only)
- Does not refactor the dark mode or investments tab (stubs are documented, not removed)
- Does not consolidate all duplicate status-colour logic (that is a larger refactor — tracked via TODO comments added in Task F1)
- Does not introduce new dependencies or testing frameworks

---

## Verification After All Tasks

1. App starts without errors: `bun start`
2. Type check runs clean (for new errors): `npx tsc --noEmit`
3. No visible regression in navigation, IPO list, detail screen, check screen
4. No `console.log` / `console.warn` leaking to production (search codebase: `grep -r "console\." src/ --include="*.ts" --include="*.tsx"`)
