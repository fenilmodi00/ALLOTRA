---
name: bolt-expo-performance-reviewer
description:
  Expo- and React Native–specific performance optimization skill for Bolt ⚡.
  Applies measured, single-step improvements using Expo best practices.
license: MIT
metadata:
  author: your-team
  version: '1.0.0'
---

## Purpose

Enhance Bolt’s performance optimization workflow with Expo- and React Native–
specific rules focused on real-world mobile bottlenecks.

## Sources of Truth

- vercel-react-native-skills
- Expo performance guidelines
- Bolt optimization philosophy

## Optimization Constraints

- One optimization per run
- No new dependencies without approval
- No architectural changes
- Must be measurable

## Expo Performance Eligibility Checklist

A rule may be applied ONLY if:

- The affected code is on a hot path (render, list, animation, navigation)
- There is evidence of:
  - unnecessary re-renders
  - dropped frames
  - slow list scrolling
  - excessive memory usage
- The change:
  - is < 50 LOC
  - does not introduce new dependencies
  - does not modify package.json or tsconfig.json

## Bolt Optimization Type Mapping

| Bolt Optimization Type    | Expo Rule(s)                                                |
| ------------------------- | ----------------------------------------------------------- |
| Prevent re-renders        | `list-performance-item-memo`, `list-performance-callbacks`  |
| Reduce render cost        | `list-performance-inline-objects`, `rendering-no-falsy-and` |
| Improve scroll FPS        | `list-performance-virtualize`, `list-performance-images`    |
| Offload work to UI thread | `animation-gpu-properties`, `animation-derived-value`       |
| Avoid JS overhead         | `navigation-native-navigators`, `ui-native-modals`          |
| Reduce layout cost        | `ui-measure-views`, `ui-safe-area-scroll`                   |

## Expo-Specific Selector Logic

If the project uses Expo or React Native:

- Prefer Expo-specific rules over generic React optimizations
- Prioritize CRITICAL and HIGH rules from:
  - List Performance
  - Animation
  - Navigation
- Apply ONLY ONE rule per PR

## Expo / React Native Profiling Signals

- FlatList without getItemLayout or FlashList
- Inline styles or callbacks inside list items
- Animations mutating layout properties (width, height, top)
- Images rendered with Image instead of expo-image
- Pressable replaced by TouchableOpacity
- Reanimated values computed inside render
- Navigation using JS stack instead of native stack

## Comment Template

Every Expo optimization Bolt applies should follow this comment template:

```ts
// ⚡ Bolt Performance Optimization
// Rule: list-performance-item-memo
// Why: Prevents unnecessary re-renders of list items during scroll
// Impact: ~30–50% fewer renders in long lists (measured via React DevTools)
```

## Expo Context in PR Template

Extend the PR description format:

```md
### 📱 Expo Context
- Platform: iOS / Android / Both
- Affected path: List / Animation / Navigation / UI
- Rule applied: list-performance-virtualize
```
