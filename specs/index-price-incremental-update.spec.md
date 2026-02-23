# Feature Spec: Incremental Index Price Updates With Smooth Number Animation

## 1) Overview and User Value

Index prices are updated every minute. The current behavior refreshes the full card UI, which causes visible jitter/flicker and reduces readability.

This feature updates only the changing numeric fields (index value, delta, and percent change) and animates the value transition so users perceive a stable, high-quality live feed.

Primary user value:
- Improves visual stability and trust in live market data.
- Makes minute-by-minute changes easier to notice and interpret.
- Reduces perceived lag and UI noise.

## 2) Functional Requirements (EARS)

### FR-1: Incremental Data Patch
When new index data arrives, the system shall patch only changed price-related fields in the card model instead of replacing the entire card object.

### FR-2: Update Cadence
While live updates are enabled, the system shall process incoming updates at the configured 1-minute cadence.

### FR-3: Numeric Transition Animation
When a numeric field changes, the system shall animate the old value to the new value using a short, smooth transition.

### FR-4: Directional Visual Cue
When a numeric field increases, the system shall show an up-state cue during animation; when it decreases, the system shall show a down-state cue during animation.

### FR-5: No-Change Optimization
When a newly received numeric value matches the current rendered value, the system shall not trigger animation for that field.

### FR-6: Partial Failure Resilience
If one field in an update payload is missing or invalid, the system shall keep the previous valid value for that field and continue rendering other valid fields.

### FR-7: Screen Lifecycle Behavior
When the card is not visible (background/inactive screen), the system shall pause animation work and apply the latest value on resume.

### FR-8: Initial Render Behavior
On first load, the system shall render the current value without transition animation.

## 3) Non-Functional Requirements

- Performance: Full card re-renders should be avoided on minute updates; only affected subcomponents should re-render.
- Smoothness: Number transition should complete within 200-400 ms and feel stable on mid-range devices.
- Accessibility: Animations should respect reduced-motion settings and degrade to direct value swap when required.
- Reliability: Invalid payload fields must not crash the screen.
- Maintainability: Update logic should be implemented in a reusable utility/hook for other live numeric widgets.

## 4) Acceptance Criteria (Given/When/Then)

### AC-1: Changed Value Updates Smoothly
Given the index card is visible with value `X`
When a minute update arrives with value `Y` where `Y != X`
Then only the numeric field area updates
And the number animates from `X` to `Y` within the configured duration
And the rest of the card remains visually stable.

### AC-2: Unchanged Value Does Not Animate
Given the index card currently shows value `X`
When a minute update arrives with value `X`
Then no animation is triggered
And no unnecessary re-render is observed for unaffected card sections.

### AC-3: Direction Cue Matches Movement
Given the card currently shows value `X`
When a minute update arrives with `Y > X`
Then up-state styling is shown during transition.

Given the card currently shows value `X`
When a minute update arrives with `Y < X`
Then down-state styling is shown during transition.

### AC-4: Invalid Field Handling
Given a payload where one numeric field is malformed
When the update is processed
Then the malformed field keeps its previous valid value
And valid fields still update normally
And no crash occurs.

### AC-5: Reduced Motion
Given reduced-motion is enabled on device
When a value changes
Then the value updates without animated interpolation
And readability cues remain accessible.

## 5) Error Handling Table

| Scenario | Detection | System Behavior | User Impact |
|---|---|---|---|
| Missing numeric field | `undefined`/`null` in payload | Keep last valid value for field; log in dev | No flicker; stale value for one field |
| Non-numeric payload | parse/validation fails | Ignore malformed field; continue processing | No crash; field unchanged |
| Delayed update (> expected cadence) | timestamp drift check | Render latest available value when received; no forced reset | Slightly stale data, stable UI |
| Burst updates on resume | queued/latest snapshot available | Coalesce to latest value and animate once | Smooth catch-up, no rapid jitter |
| Animation failure/runtime issue | animation callback error | Fallback to direct text update | Correct value shown without animation |

## 6) Implementation TODO Checklist

- [ ] Define/update index card view-model contract for patch-based numeric updates.
- [ ] Add field-level diffing helper (current vs incoming) for price, change, percent.
- [ ] Implement animated numeric component/hook (supports increase/decrease state).
- [ ] Gate animation by reduced-motion preference.
- [ ] Ensure first render skips animation.
- [ ] Memoize card sections so non-numeric content does not re-render on minute updates.
- [ ] Add payload validation fallback for malformed fields.
- [ ] Add dev-only instrumentation for render count and update timing.
- [ ] Add tests for diffing logic and invalid payload fallback.
- [ ] Add manual QA checklist for minute update, unchanged value, up/down transition, background resume.

## 7) Scope and Defaults Used

- Assumed update frequency is fixed at 1 minute from backend feed.
- Assumed animation target is index value + change fields within existing card UI.
- Assumed no design-system overhaul; this is a behavior/performance enhancement only.
