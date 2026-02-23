# IPO App API Redesign — Frontend Implementation Plan

## Overview

This document outlines the complete frontend changes required to migrate from the current v1 API to the optimized v2 API endpoints. The goal is to reduce payload size by 55-60%, eliminate waterfall requests, and remove dead code.

---

## Current State Analysis

### Endpoints Currently Used by Frontend

| # | Endpoint | HTTP | Purpose | Fields Returned | Fields Actually Used | Waste |
|---|---------|------|---------|-----------------|---------------------|-------|
| 1 | `/ipos` | GET | Home list | ~25 | 10 | 60% |
| 2 | `/ipos/active` | GET | Live filter | ~25 | 10 | 60% |
| 3 | `/ipos/active-with-gmp` | GET | Main feed | ~30 | 10 | 67% |
| 4 | `/ipos/:id` | GET | Detail (no GMP) | ~25 | 19 | 24% |
| 5 | `/ipos/:id/with-gmp` | GET | Detail (with GMP) | ~30 | 19 | 37% |
| 6 | `/ipos/:id/gmp` | GET | Standalone GMP | 3 | 3 | 0% |
| 7 | `/gmp/history/:stockId/chart` | GET | GMP chart | lean | all | 0% |
| 8 | `/check` | POST | Allotment check | 6 | 4 | 33% |
| 9-13 | `/market/stocks/*` (5 routes) | GET | **DEAD CODE** | - | - | 100% |

### Fields Transformed But Never Consumed

These fields travel from backend → transformer → DisplayIPO but are never rendered:

1. `companyName` (duplicate of `name`)
2. `companyCode`
3. `symbol`
4. `listingGain`
5. `about`
6. `strengths[]`
7. `risks[]`
8. `gmp.estimatedListing`
9. `gmp.lastUpdated`
10. `gmp.listingGain`
11. `gmp.dataSource`

---

## New API Endpoints (v2)

### Endpoint 1: `GET /api/v2/ipos/feed`

**Replaces**: `/ipos`, `/ipos/active`, `/ipos/active-with-gmp`

**Query Parameters**:
- `status`: `all` | `live` | `upcoming` | `closed` | `listed` (default: `all`)

**Response** (12 fields per IPO):

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-123",
      "stock_id": "hexaware-tech",
      "name": "Hexaware Technologies",
      "logo_url": "https://cdn.example.com/logos/hexaware.png",
      "status": "LIVE",
      "category": "mainboard",
      "price_band_low": 674,
      "price_band_high": 708,
      "open_date": "2026-02-12",
      "close_date": "2026-02-14",
      "listing_date": "2026-02-19",
      "gmp": {
        "value": 45,
        "gain_percent": 6.36
      }
    }
  ]
}
```

**Frontend Impact**:
- Replace 3 service calls with 1
- Update `ipoService.getActiveIPOsWithGMP()` to call `/v2/ipos/feed?status=all`
- Update `ipoService.getActiveIPOs()` to call `/v2/ipos/feed?status=live`
- Update `ipoService.getUpcomingIPOs()` to call `/v2/ipos/feed?status=upcoming`

---

### Endpoint 2: `GET /api/v2/ipos/:id`

**Replaces**: `/ipos/:id`, `/ipos/:id/with-gmp`, `/ipos/:id/gmp`

**Response** (19 fields):

```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "stock_id": "hexaware-tech",
    "name": "Hexaware Technologies",
    "logo_url": "https://cdn.example.com/logos/hexaware.png",
    "status": "LIVE",
    "category": "mainboard",
    "registrar": "Link Intime India Pvt Ltd",
    "price_band_low": 674,
    "price_band_high": 708,
    "min_investment": 14868,
    "lot_size": 21,
    "issue_size": "2508000000.00",
    "subscription_status": "2.5x",
    "open_date": "2026-02-12",
    "close_date": "2026-02-14",
    "allotment_date": "2026-02-17",
    "listing_date": "2026-02-19",
    "description": "Hexaware Technologies is a global IT services company...",
    "gmp": {
      "value": 45,
      "gain_percent": 6.36,
      "subscription_status": "2.5x"
    }
  }
}
```

**Frontend Impact**:
- Replace 3 service calls with 1
- Update `ipoService.getIPOById()` to call `/v2/ipos/:id`
- Update `ipoService.getIPOByIdWithGMP()` to call `/v2/ipos/:id` (GMP always included)
- Remove `ipoService.getIPOGMP()` (merged into detail endpoint)

---

### Endpoint 3: `POST /api/v2/allotment/check`

**Replaces**: `/check`

**Request**:
```json
{
  "ipo_id": "uuid-123",
  "pan": "ABCDE1234F"
}
```

**Response** (4 fields):
```json
{
  "success": true,
  "data": {
    "status": "ALLOTTED",
    "shares_applied": 21,
    "shares_allotted": 21,
    "message": "Congratulations! Shares have been allotted."
  }
}
```

**Frontend Impact**:
- Update `ipoService.checkAllotment()` to call `/v2/allotment/check`
- Simplify response handling (fewer fields)

---

### Endpoints Kept As-Is

| Endpoint | Reason |
|----------|--------|
| `GET /gmp/history/:stockId/chart` | Already lean, all fields used |
| External `nifty-proxy.../all` | External service, cannot modify |

---

## Implementation Tasks

### Phase 1: Update Types

#### Task 1.1: Update `src/types/ipo.types.ts`

**Changes**:

1. **Rename** `DisplayIPO` fields to match new v2 response:
   - `priceRange.min` → `price_band_low`
   - `priceRange.max` → `price_band_high`
   - `dates.open` → `open_date`
   - `dates.close` → `close_date`
   - `dates.allotment` → `allotment_date`
   - `dates.listing` → `listing_date`
   - `lotSize` → `lot_size`
   - `minInvestment` → `min_investment`
   - `gmp.value` → `gmp.value`
   - `gmp.gainPercent` → `gmp.gain_percent`
   - `gmp.subscriptionStatus` → `gmp.subscription_status`

2. **Remove unused fields** from `DisplayIPO`:
   - `companyName` (never used)
   - `companyCode` (never used)
   - `symbol` (never used)
   - `listingGain` (never used)
   - `about` (never used)
   - `strengths[]` (never used)
   - `risks[]` (never used)
   - `gmp.estimatedListing` (never used)
   - `gmp.lastUpdated` (never used)
   - `gmp.listingGain` (never used)
   - `gmp.dataSource` (never used)

3. **Add `category`** field (was computed client-side, now server-provided)

**New DisplayIPO type**:

```typescript
export interface DisplayIPO {
  id: string
  stock_id: string
  name: string
  logo_url?: string
  status: IPOStatus
  category: 'mainboard' | 'sme'
  registrar?: string
  price_band_low: number
  price_band_high: number
  min_investment?: number
  lot_size?: number
  issue_size?: string
  subscription_status?: string
  open_date?: string
  close_date?: string
  allotment_date?: string
  listing_date?: string
  description?: string
  gmp?: {
    value?: number
    gain_percent?: number
    subscription_status?: string
  }
}
```

4. **Simplify `IPO` and `IPOWithGMP` types** (backend models) to match v2 responses.

---

### Phase 2: Update Service Layer

#### Task 2.1: Update `src/services/ipoService.ts`

**Changes**:

1. **Update endpoint constants**:
```typescript
const API_ENDPOINTS = {
  IPO_FEED_V2: '/v2/ipos/feed',
  IPO_DETAIL_V2: '/v2/ipos',
  ALLOTMENT_CHECK_V2: '/v2/allotment/check',
  // Keep old endpoints for backward compatibility during migration
  IPO_LIST: '/ipos',
  IPO_ACTIVE: '/ipos/active',
  IPO_ACTIVE_WITH_GMP: '/ipos/active-with-gmp',
  IPO_DETAIL: '/ipos',
  IPO_DETAIL_WITH_GMP: '/ipos/with-gmp',
  IPO_GMP: '/ipos',
  GMP_HISTORY: '/gmp/history',
  ALLOTMENT_CHECK: '/check',
}
```

2. **Update service methods**:

```typescript
// New v2 methods
async getFeedV2(status?: string): Promise<DisplayIPO[]> {
  const query = status && status !== 'all' ? `?status=${status}` : ''
  const response = await apiClient.get<{ data: DisplayIPO[], success: boolean }>(
    `${API_ENDPOINTS.IPO_FEED_V2}${query}`
  )
  return response.data.data || []
}

async getDetailV2(id: string): Promise<DisplayIPO> {
  const response = await apiClient.get<{ data: DisplayIPO, success: boolean }>(
    `${API_ENDPOINTS.IPO_DETAIL_V2}/${id}`
  )
  return response.data.data
}

async checkAllotmentV2(ipoId: string, pan: string): Promise<AllotmentResult> {
  const response = await apiClient.post<AllotmentAPIResponse>(
    API_ENDPOINTS.ALLOTMENT_CHECK_V2,
    { ipo_id: ipoId, pan }
  )
  return response.data.data
}
```

3. **Deprecate old methods** (mark with @deprecated):
```typescript
/** @deprecated Use getFeedV2 instead */
async getIPOs(params?: {...}) { ... }

/** @deprecated Use getDetailV2 instead */
async getIPOById(id: string) { ... }
```

4. **Remove dead methods**:
- Remove `getIPOGMP()` (merged into detail endpoint)

---

### Phase 3: Update Repository Layer

#### Task 3.1: Update `src/repositories/ipoRepository.ts`

```typescript
// Update to use v2 endpoints
export const ipoRepository = {
  async getActiveFeed(): Promise<DisplayIPO[]> {
    return ipoService.getFeedV2('all')
  },
  
  async getById(id: string, _includeGMP = true): Promise<DisplayIPO> {
    // GMP is always included in v2, ignore includeGMP param
    return ipoService.getDetailV2(id)
  },
}
```

---

### Phase 4: Update Data Transformers

#### Task 4.1: Update `src/utils/dataTransformers.ts`

**Changes**:

1. **Simplify `transformIPOData()`** — fewer fields to map since backend sends only needed fields:

```typescript
export const transformIPOData = (ipo: any): DisplayIPO => {
  return {
    id: ipo.id,
    stock_id: ipo.stock_id,
    name: ipo.name,
    logo_url: ipo.logo_url,
    status: normalizeIPOStatus(ipo.status),
    category: ipo.category, // Server-computed now!
    registrar: ipo.registrar,
    price_band_low: ipo.price_band_low || 0,
    price_band_high: ipo.price_band_high || 0,
    min_investment: ipo.min_investment,
    lot_size: ipo.lot_size,
    issue_size: ipo.issue_size,
    subscription_status: ipo.subscription_status,
    open_date: ipo.open_date,
    close_date: ipo.close_date,
    allotment_date: ipo.allotment_date,
    listing_date: ipo.listing_date,
    description: ipo.description,
    gmp: ipo.gmp ? {
      value: ipo.gmp.value,
      gain_percent: ipo.gmp.gain_percent,
      subscription_status: ipo.gmp.subscription_status,
    } : undefined,
  }
}
```

2. **Remove `determineIPOCategory()`** — logic moved to server.

3. **Simplify `transformMarketIndices()`** — stays the same, this endpoint wasn't changed.

---

### Phase 5: Remove Dead Code

#### Task 5.1: Delete `src/services/stockService.ts`

**Action**: Delete entire file. Stock endpoints are dead code, never called by any screen.

#### Task 5.2: Delete `src/hooks/useStockData.ts`

**Action**: Delete entire file containing:
- `useMostTradedStocks()`
- `useGainersLosers()`
- `useStockSearch()`

#### Task 5.3: Delete `src/components/ipo/StockCard.tsx`

**Action**: Delete entire file. Component is never mounted by any screen.

#### Task 5.4: Update `src/types/ipo.types.ts`

**Action**: Remove `Stock` interface (was used only by stockService).

#### Task 5.5: Update `src/services/ipoService.ts`

**Action**: Remove `getPerformanceMetrics()` method (internal debugging only).

---

### Phase 6: Update Screens (If Needed)

#### Task 6.1: Update `HomeScreen.tsx`

**Changes**:
- Update hook calls to use new v2 methods (via repository)
- No breaking changes expected — data shape is similar, just leaner

#### Task 6.2: Update `IPODetailsScreen.tsx`

**Changes**:
- Update `useIPODetails` hook call
- No breaking changes — GMP is now included in main response
- Remove separate GMP fetch call (waterfall eliminated)

#### Task 6.3: Update `CheckScreen.tsx`

**Changes**:
- Update allotment check to use v2 endpoint
- Handle new response shape (fewer fields)

---

### Phase 7: Testing & Validation

#### Task 7.1: Manual Testing Checklist

- [ ] Home screen loads IPO list correctly
- [ ] Filter tabs work (live, upcoming, closed, listed)
- [ ] IPO detail screen shows all data
- [ ] GMP data displays on detail screen
- [ ] Allotment check returns correct status
- [ ] No console errors on any screen

#### Task 7.2: Payload Size Validation

- [ ] Compare network request size: v1 vs v2 for IPO list (50 items)
- [ ] Verify 55-60% payload reduction

---

## File Change Summary

| File | Action | Lines Changed |
|------|--------|---------------|
| `src/types/ipo.types.ts` | Update types | ~50 lines |
| `src/services/ipoService.ts` | Add v2 methods, deprecate old | ~80 lines |
| `src/services/stockService.ts` | **DELETE** | -148 lines |
| `src/repositories/ipoRepository.ts` | Update to v2 | ~10 lines |
| `src/utils/dataTransformers.ts` | Simplify transformers | ~30 lines |
| `src/hooks/useStockData.ts` | **DELETE** | -~100 lines |
| `src/components/ipo/StockCard.tsx` | **DELETE** | -~80 lines |
| `src/screens/HomeScreen.tsx` | Minor updates | ~5 lines |
| `src/screens/IPODetailsScreen.tsx` | Minor updates | ~5 lines |
| `src/screens/CheckScreen.tsx` | Minor updates | ~5 lines |

**Net change**: ~-300 lines (code removal, cleaner codebase)

---

## Rollout Plan

### Step 1: Backend First
1. Deploy v2 endpoints alongside v1
2. Verify v2 responses match spec

### Step 2: Frontend Development
1. Implement all Phase 1-5 tasks
2. Test against v2 endpoints (or mock)

### Step 3: Staging Testing
1. Deploy frontend to staging
2. Verify all screens work with v2

### Step 4: Production Rollout
1. Push frontend update to production
2. Monitor for errors
3. Remove v1 endpoints after 30 days

---

## Backward Compatibility Notes

During migration, both v1 and v2 endpoints will work:

- Frontend calls v2 → backend responds with lean data
- If v2 fails, fallback to v1 (optional, not required)

The `DisplayIPO` type will have slight differences between old/new:
- Old: `priceRange: { min, max }`
- New: `price_band_low`, `price_band_high` (flat)

Handle this in the transformer layer — keep backward-compatible field mapping for the transition period.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Payload reduction (list) | 55-60% |
| Payload reduction (detail) | 37% |
| Round trips for detail | 1 (from 2-3) |
| Dead code removed | 100% |
| Client-side category parsing | Eliminated |

---

*Generated: February 2026*
*Part of: IPO App API Redesign Project*
