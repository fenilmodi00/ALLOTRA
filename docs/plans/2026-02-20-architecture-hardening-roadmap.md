# IPO App Architecture Hardening Roadmap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Strengthen type safety, navigation contracts, API resilience, and operational safety without over-engineering the current Expo app.

**Architecture:** We keep the existing layered flow (screen -> hook -> service -> API) and harden it with explicit contracts. We introduce a thin repository/mapper boundary only where type drift is currently causing risk, then improve reliability with retry/backoff and log redaction. We deliver this incrementally with small TDD loops and frequent commits.

**Tech Stack:** Expo 54, React Native 0.81, TypeScript strict mode, React Navigation v7, Zustand v5, Vitest (unit tests for pure TS modules), native fetch.

---

**Execution notes:**
- Work from a dedicated worktree.
- Skills to apply during execution: `@superpowers/using-git-worktrees`, `@superpowers/test-driven-development`, `@superpowers/verification-before-completion`, `@superpowers/requesting-code-review`.
- Keep every task DRY and YAGNI: no broad refactors outside files listed.

### Task 1: Baseline ADRs and architecture guardrails

**Files:**
- Create: `docs/adr/ADR-001-typed-navigation-contracts.md`
- Create: `docs/adr/ADR-002-api-resilience-and-redaction.md`
- Modify: `README.md`
- Test: `n/a (documentation task)`

**Step 1: Write the failing test**

```md
# Failing check (manual)
Expected: ADR folder and two ADR files exist and are linked from README.
Current: missing.
```

**Step 2: Run test to verify it fails**

Run: `ls docs/adr`
Expected: error or missing required ADR files.

**Step 3: Write minimal implementation**

```md
# ADR-001
- Decision: enforce typed navigator params and remove `any` in screen navigation props.
- Status: Accepted
- Consequences: safer route payloads, small migration effort.

# ADR-002
- Decision: add retry/backoff in API client and redact sensitive values in logs.
- Status: Accepted
- Consequences: better resilience and safer diagnostics.
```

**Step 4: Run test to verify it passes**

Run: `ls docs/adr`
Expected: `ADR-001-typed-navigation-contracts.md` and `ADR-002-api-resilience-and-redaction.md` present.

**Step 5: Commit**

```bash
git add docs/adr README.md
git commit -m "docs: add ADRs for navigation contracts and API resilience"
```

### Task 2: Make TypeScript validation runnable again

**Files:**
- Modify: `tsconfig.json`
- Test: `n/a (typecheck command is the test)`

**Step 1: Write the failing test**

```bash
npx tsc --noEmit
# current failure:
# TS5098 Option 'customConditions' can only be used when moduleResolution is node16/nodenext/bundler
```

**Step 2: Run test to verify it fails**

Run: `npx tsc --noEmit`
Expected: FAIL with TS5098.

**Step 3: Write minimal implementation**

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npx tsc --noEmit`
Expected: TS5098 removed (other genuine errors may remain and become visible).

**Step 5: Commit**

```bash
git add tsconfig.json
git commit -m "build: align tsconfig moduleResolution with Expo config"
```

### Task 3: Introduce lightweight unit test harness for pure TypeScript modules

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `tests/setup/vitest.setup.ts`
- Test: `tests/**/*.test.ts`

**Step 1: Write the failing test**

```ts
// tests/smoke/smoke.test.ts
import { describe, it, expect } from 'vitest'

describe('smoke', () => {
  it('runs test runner', () => {
    expect(true).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit`
Expected: FAIL because script and test tooling are not configured.

**Step 3: Write minimal implementation**

```json
{
  "scripts": {
    "test:unit": "vitest run",
    "test:unit:watch": "vitest"
  }
}
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    include: ['tests/**/*.test.ts'],
  },
})
```

**Step 4: Run test to verify it passes**

Run: `npm run test:unit`
Expected: PASS with 1 test.

**Step 5: Commit**

```bash
git add package.json vitest.config.ts tests/
git commit -m "test: add minimal vitest harness for architecture hardening"
```

### Task 4: Enforce typed navigation contracts end-to-end

**Files:**
- Modify: `src/types/navigation.types.ts`
- Modify: `src/components/common/AppNavigator.tsx`
- Modify: `src/screens/HomeScreen.tsx`
- Modify: `src/screens/IPODetailsScreen.tsx`
- Modify: `src/screens/CheckScreen.tsx`
- Test: `tests/navigation/navigation-contracts.test.ts`

**Step 1: Write the failing test**

```ts
// tests/navigation/navigation-contracts.test.ts
import { describe, it, expectTypeOf } from 'vitest'
import type { RootStackParamList } from '../../src/types/navigation.types'

describe('navigation contracts', () => {
  it('requires ipoId + ipoName for IPODetails', () => {
    type Params = RootStackParamList['IPODetails']
    expectTypeOf<Params>().toEqualTypeOf<{ ipoId: string; ipoName: string }>()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit tests/navigation/navigation-contracts.test.ts`
Expected: FAIL or typecheck mismatch due to current route payload usage.

**Step 3: Write minimal implementation**

```ts
// src/screens/HomeScreen.tsx
navigation.navigate('IPODetails', { ipoId: ipo.id, ipoName: ipo.name })
```

```ts
// src/screens/IPODetailsScreen.tsx
import type { IPODetailsScreenProps } from '../types/navigation.types'
export default function IPODetailsScreen({ navigation, route }: IPODetailsScreenProps) {
  const { ipoId, ipoName } = route.params
}
```

```ts
// src/components/common/AppNavigator.tsx
const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<TabParamList>()
```

**Step 4: Run test to verify it passes**

Run: `npm run test:unit tests/navigation/navigation-contracts.test.ts && npx tsc --noEmit`
Expected: PASS for test; TypeScript has no navigation-related `any` or payload mismatch errors.

**Step 5: Commit**

```bash
git add src/types/navigation.types.ts src/components/common/AppNavigator.tsx src/screens/HomeScreen.tsx src/screens/IPODetailsScreen.tsx src/screens/CheckScreen.tsx tests/navigation/navigation-contracts.test.ts
git commit -m "feat: enforce typed navigation params across IPO flow"
```

### Task 5: Remove unsafe allotment mapping and `as any`

**Files:**
- Create: `src/services/mappers/allotmentMapper.ts`
- Modify: `src/services/ipoService.ts`
- Modify: `src/types/ipo.types.ts`
- Test: `tests/services/allotment-mapper.test.ts`

**Step 1: Write the failing test**

```ts
// tests/services/allotment-mapper.test.ts
import { describe, it, expect } from 'vitest'
import { mapAllotmentStatus } from '../../src/services/mappers/allotmentMapper'

describe('mapAllotmentStatus', () => {
  it('maps known statuses safely', () => {
    expect(mapAllotmentStatus('ALLOTTED')).toBe('ALLOTTED')
    expect(mapAllotmentStatus('NOT_ALLOTTED')).toBe('NOT_ALLOTTED')
  })

  it('falls back unknown statuses to PENDING', () => {
    expect(mapAllotmentStatus('SOMETHING_NEW')).toBe('PENDING')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit tests/services/allotment-mapper.test.ts`
Expected: FAIL because mapper does not exist.

**Step 3: Write minimal implementation**

```ts
// src/services/mappers/allotmentMapper.ts
import type { AllotmentStatus } from '../../types'

const KNOWN: Record<string, AllotmentStatus> = {
  ALLOTTED: 'ALLOTTED',
  NOT_ALLOTTED: 'NOT_ALLOTTED',
  PENDING: 'PENDING',
  NOT_APPLIED: 'NOT_APPLIED',
}

export const mapAllotmentStatus = (status: string): AllotmentStatus => {
  return KNOWN[status] ?? 'PENDING'
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test:unit tests/services/allotment-mapper.test.ts && npx tsc --noEmit`
Expected: PASS; no `status as any` in `ipoService`.

**Step 5: Commit**

```bash
git add src/services/mappers/allotmentMapper.ts src/services/ipoService.ts src/types/ipo.types.ts tests/services/allotment-mapper.test.ts
git commit -m "refactor: replace unsafe allotment status cast with typed mapper"
```

### Task 6: Add retry with exponential backoff in API client

**Files:**
- Modify: `src/services/api.ts`
- Modify: `src/config/environment.ts`
- Test: `tests/services/api-retry.test.ts`

**Step 1: Write the failing test**

```ts
// tests/services/api-retry.test.ts
import { describe, it, expect, vi } from 'vitest'
import { apiClient } from '../../src/services/api'

describe('apiClient retry', () => {
  it('retries transient 5xx then succeeds', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({ message: 'busy' }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ data: [], success: true }) })

    vi.stubGlobal('fetch', fetchMock)
    const result = await apiClient.get('/ipos')

    expect(result.success).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit tests/services/api-retry.test.ts`
Expected: FAIL because client currently does not retry.

**Step 3: Write minimal implementation**

```ts
// src/services/api.ts (shape)
const shouldRetry = (status: number) => status >= 500 || status === 429

for (let attempt = 0; attempt <= API_CONFIG.retryAttempts; attempt++) {
  try {
    // fetch
    // return on success
    // throw APIError for non-retryable
  } catch (error) {
    // if retryable and attempts remain: await delay(backoff)
    // else throw
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test:unit tests/services/api-retry.test.ts`
Expected: PASS with retry count assertions.

**Step 5: Commit**

```bash
git add src/services/api.ts src/config/environment.ts tests/services/api-retry.test.ts
git commit -m "feat: add bounded retry and backoff for transient API failures"
```

### Task 7: Add log redaction for sensitive fields (PAN)

**Files:**
- Create: `src/utils/logger.ts`
- Modify: `src/services/api.ts`
- Modify: `src/hooks/useIPOData.ts`
- Modify: `src/screens/CheckScreen.tsx`
- Test: `tests/utils/logger-redaction.test.ts`

**Step 1: Write the failing test**

```ts
// tests/utils/logger-redaction.test.ts
import { describe, it, expect } from 'vitest'
import { redactSensitive } from '../../src/utils/logger'

describe('redactSensitive', () => {
  it('redacts PAN-like values', () => {
    const output = redactSensitive({ pan: 'ABCDE1234F' })
    expect(output).toContain('[REDACTED]')
    expect(output).not.toContain('ABCDE1234F')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit tests/utils/logger-redaction.test.ts`
Expected: FAIL because logger util does not exist.

**Step 3: Write minimal implementation**

```ts
// src/utils/logger.ts
const PAN_REGEX = /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g

export const redactSensitive = (value: unknown): string => {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value)
  return serialized.replace(PAN_REGEX, '[REDACTED]')
}

export const devLog = (message: string, payload?: unknown) => {
  if (!__DEV__) return
  if (payload === undefined) return console.log(message)
  return console.log(message, redactSensitive(payload))
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test:unit tests/utils/logger-redaction.test.ts && npx tsc --noEmit`
Expected: PASS and no raw PAN in client logs.

**Step 5: Commit**

```bash
git add src/utils/logger.ts src/services/api.ts src/hooks/useIPOData.ts src/screens/CheckScreen.tsx tests/utils/logger-redaction.test.ts
git commit -m "security: redact PAN-like data from development logs"
```

### Task 8: Split global store concerns (domain vs UI)

**Files:**
- Create: `src/store/useIPOUIStore.ts`
- Modify: `src/store/useIPOStore.ts`
- Modify: `src/hooks/useIPOData.ts`
- Modify: `src/screens/HomeScreen.tsx`
- Test: `tests/store/ipo-ui-store.test.ts`

**Step 1: Write the failing test**

```ts
// tests/store/ipo-ui-store.test.ts
import { describe, it, expect } from 'vitest'
import { useIPOUIStore } from '../../src/store/useIPOUIStore'

describe('useIPOUIStore', () => {
  it('updates active filter without touching IPO data', () => {
    useIPOUIStore.getState().setActiveFilter('listed')
    expect(useIPOUIStore.getState().activeFilter).toBe('listed')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit tests/store/ipo-ui-store.test.ts`
Expected: FAIL because UI store file does not exist.

**Step 3: Write minimal implementation**

```ts
// src/store/useIPOUIStore.ts
import { create } from 'zustand'

interface IPOUIState {
  activeFilter: string
  setActiveFilter: (filter: string) => void
}

export const useIPOUIStore = create<IPOUIState>((set) => ({
  activeFilter: 'ongoing',
  setActiveFilter: (activeFilter) => set({ activeFilter }),
}))
```

**Step 4: Run test to verify it passes**

Run: `npm run test:unit tests/store/ipo-ui-store.test.ts && npx tsc --noEmit`
Expected: PASS and `useIPOStore` no longer owns UI-only state.

**Step 5: Commit**

```bash
git add src/store/useIPOUIStore.ts src/store/useIPOStore.ts src/hooks/useIPOData.ts src/screens/HomeScreen.tsx tests/store/ipo-ui-store.test.ts
git commit -m "refactor: separate IPO UI state from shared domain store"
```

### Task 9: Add repository layer for IPO read paths (minimal, no overreach)

**Files:**
- Create: `src/repositories/ipoRepository.ts`
- Modify: `src/hooks/useIPOData.ts`
- Modify: `src/services/ipoService.ts`
- Test: `tests/repositories/ipo-repository.test.ts`

**Step 1: Write the failing test**

```ts
// tests/repositories/ipo-repository.test.ts
import { describe, it, expect } from 'vitest'
import { ipoRepository } from '../../src/repositories/ipoRepository'

describe('ipoRepository', () => {
  it('returns display IPOs for active feed', async () => {
    const result = await ipoRepository.getActiveFeed()
    expect(Array.isArray(result)).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit tests/repositories/ipo-repository.test.ts`
Expected: FAIL because repository does not exist.

**Step 3: Write minimal implementation**

```ts
// src/repositories/ipoRepository.ts
import { ipoService } from '../services/ipoService'

export const ipoRepository = {
  getActiveFeed: () => ipoService.getActiveIPOsWithGMP(),
  getById: (id: string) => ipoService.getIPOByIdWithGMP(id),
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test:unit tests/repositories/ipo-repository.test.ts && npx tsc --noEmit`
Expected: PASS; hooks import repository instead of direct service for read paths.

**Step 5: Commit**

```bash
git add src/repositories/ipoRepository.ts src/hooks/useIPOData.ts src/services/ipoService.ts tests/repositories/ipo-repository.test.ts
git commit -m "refactor: add thin IPO repository for stable read contracts"
```

### Task 10: Final verification, docs sync, and rollout checklist

**Files:**
- Modify: `README.md`
- Modify: `AGENTS.md`
- Create: `docs/architecture/operational-checklist.md`
- Test: `all unit tests + typecheck + app smoke run`

**Step 1: Write the failing test**

```md
Checklist must document:
- how to run unit tests
- how to run typecheck
- navigation contract rules
- redaction and retry behavior
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit && npx tsc --noEmit`
Expected: FAIL until previous tasks are complete and docs are updated.

**Step 3: Write minimal implementation**

```md
# docs/architecture/operational-checklist.md
1. Run `npm run test:unit`
2. Run `npx tsc --noEmit`
3. Start app with `npm start`
4. Verify Home -> IPO Details -> Check route payloads
5. Verify logs redact PAN values in dev mode
```

**Step 4: Run test to verify it passes**

Run: `npm run test:unit && npx tsc --noEmit && npm start`
Expected: tests PASS, typecheck PASS, Expo starts; manual smoke flow succeeds.

**Step 5: Commit**

```bash
git add README.md AGENTS.md docs/architecture/operational-checklist.md
git commit -m "docs: add architecture hardening runbook and verification checklist"
```

---

## Definition of Done

- No `any` in touched navigation and service-path files.
- `npx tsc --noEmit` passes.
- Unit tests for navigation contracts, status mapping, retries, redaction, and UI store pass.
- ADRs exist for major architecture decisions.
- Sensitive values (PAN) are redacted from logs.
- API client retries transient failures with bounded backoff.

## Rollout and Risk Mitigation

- Ship behind incremental commits; do not batch all tasks into one mega commit.
- If retry logic causes duplicated requests, reduce retry count to 1 and add idempotency notes.
- If repository abstraction feels heavy, keep it read-only scope for now (YAGNI).
