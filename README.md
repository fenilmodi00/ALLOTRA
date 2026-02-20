# IPO App Frontend - API Integration Guide

## Overview
This is a React Native/Expo IPO tracking application that provides real-time IPO data, market indices, stock information, and allotment checking functionality. The app follows a clean architecture with service layers, custom hooks, and centralized state management.

## 🏗️ Architecture Overview

```
App.tsx
├── AppNavigator (Navigation)
├── Screens (UI Components)
├── Hooks (Data Fetching Logic)
├── Services (API Layer)
├── Store (State Management)
└── Types (Data Models)
```

### Architecture Decisions (ADRs)

- `docs/adr/ADR-001-typed-navigation-contracts.md`
- `docs/adr/ADR-002-api-resilience-and-redaction.md`

## 🌐 Backend API Integration

### Base URL Configuration
The app dynamically configures API endpoints based on platform:

- **Android Emulator**: `http://10.0.2.2:8080/api/v1`
- **iOS Simulator**: `http://localhost:8080/api/v1`
- **Web**: `http://localhost:8080/api/v1`
- **Environment Override**: `EXPO_PUBLIC_API_URL`

### API Client (`src/services/api.ts`)
- **HTTP Client**: Native Fetch API (not Axios despite dependency)
- **Timeout**: 10 seconds (configurable via `EXPO_PUBLIC_API_TIMEOUT`)
- **Retry Logic**: 3 attempts with 1-second delay
- **Error Handling**: Custom `APIError` class with status codes
- **Request Cancellation**: AbortController with timeout
- **Development Logging**: All requests/responses logged in dev mode

## 📊 API Endpoints & Data Flow

### IPO Service (`src/services/ipoService.ts`)

#### Core IPO Endpoints
| Method | Endpoint | Purpose | Response Type |
|--------|----------|---------|---------------|
| GET | `/ipos` | Get all IPOs with filters | `{ data: IPO[], success: boolean }` |
| GET | `/ipos/active-with-gmp` | Active IPOs with Grey Market Premium | `{ data: IPOWithGMP[], success: boolean }` |
| GET | `/ipos/active` | Active IPOs only | `{ data: IPO[], success: boolean }` |
| GET | `/ipos/{id}` | Single IPO by ID | `{ data: IPO, success: boolean }` |
| GET | `/ipos/{id}/with-gmp` | Single IPO with GMP data | `{ data: IPOWithGMP, success: boolean }` |
| GET | `/ipos/{id}/gmp` | GMP data separately | `{ data: GMPData, success: boolean }` |

#### Market Data Endpoints
| Method | Endpoint | Purpose | Response Type |
|--------|----------|---------|---------------|
| GET | `/market/indices` | Market indices (Nifty, Sensex) | `{ data: MarketIndex[], success: boolean }` |
| POST | `/check` | Allotment status check | `{ data: AllotmentResult, success: boolean }` |

#### Performance & Cache Endpoints
| Method | Endpoint | Purpose | Response Type |
|--------|----------|---------|---------------|
| GET | `/performance/metrics` | App performance metrics | `{ data: PerformanceMetrics, success: boolean }` |
| POST | `/performance/cache/warmup` | Cache warmup on startup | `{ success: boolean }` |

### Stock Service (`src/services/stockService.ts`)

#### Stock Market Endpoints
| Method | Endpoint | Purpose | Response Type |
|--------|----------|---------|---------------|
| GET | `/market/stocks/most-traded?limit={n}` | Most traded stocks | `{ data: Stock[], success: boolean }` |
| GET | `/market/stocks/gainers?category={cat}&limit={n}` | Top gainers by category | `{ data: Stock[], success: boolean }` |
| GET | `/market/stocks/losers?category={cat}&limit={n}` | Top losers by category | `{ data: Stock[], success: boolean }` |
| GET | `/market/stocks/{symbol}` | Stock by symbol | `{ data: Stock, success: boolean }` |
| GET | `/market/stocks/search?q={query}&limit={n}` | Search stocks | `{ data: Stock[], success: boolean }` |

**Categories**: `large`, `mid`, `small` (market cap based)

## 🎣 Custom Hooks & Data Consumption

### IPO Data Hooks (`src/hooks/useIPOData.ts`)

#### `useIPOList(status, includeGMP)`
- **Purpose**: Fetch IPO list with filtering
- **Parameters**: 
  - `status`: 'all' | 'LIVE' | 'UPCOMING' | 'CLOSED' | 'LISTED'
  - `includeGMP`: boolean (include Grey Market Premium data)
- **Returns**: `{ ipos, loading, error, refresh }`
- **Auto-refresh**: No
- **Used in**: HomeScreen, IPO filtering

#### `useIPODetails(ipoId, includeGMP)`
- **Purpose**: Fetch single IPO details
- **Parameters**: 
  - `ipoId`: string
  - `includeGMP`: boolean
- **Returns**: `{ ipo, loading, error, refresh }`
- **Used in**: IPODetailsScreen

#### `useAllotmentCheck()`
- **Purpose**: Check IPO allotment status
- **API Call**: `POST /check` with `{ ipo_id, pan }`
- **Returns**: `{ result, loading, error, checkAllotment, reset }`
- **Used in**: CheckScreen

#### `useMarketIndices(autoRefresh)`
- **Purpose**: Fetch market indices (Nifty, Sensex)
- **Auto-refresh**: 30 seconds (if enabled)
- **Returns**: `{ indices, loading, error, refresh }`
- **Used in**: HomeScreen (MarketIndicesSection)

### Stock Data Hooks (`src/hooks/useStockData.ts`)

#### `useMostTradedStocks(limit, autoRefresh)`
- **Purpose**: Fetch most traded stocks
- **Auto-refresh**: 60 seconds (if enabled)
- **Returns**: `{ stocks, loading, error, refresh }`
- **Used in**: HomeScreen, StockSection

#### `useGainersLosers(category, limit)`
- **Purpose**: Fetch top gainers and losers
- **Parameters**: 
  - `category`: 'large' | 'mid' | 'small'
  - `limit`: number
- **Returns**: `{ gainers, losers, loading, error }`
- **Used in**: Market analysis screens

## 🗄️ State Management (Zustand)

### IPO Store (`src/store/useIPOStore.ts`)

#### State Structure
```typescript
interface IPOState {
  // Data
  ipos: DisplayIPO[]
  indices: MarketIndex[]
  recentChecks: AllotmentResult[]
  
  // UI State
  loading: boolean
  error: string | null
  activeFilter: string
  
  // Actions & Selectors
  setIPOs, setIndices, setLoading, setError
  getIPOById, getIPOsByStatus
  addRecentCheck, clearError
}
```

#### Usage Pattern
```typescript
// In components
const { ipos, loading, error } = useIPOStore()
const setIPOs = useIPOStore(state => state.setIPOs)
```

## 🔄 Data Transformation

### Backend to Frontend Mapping (`src/utils/dataTransformers.ts`)

#### IPO Data Transformation
```typescript
// Backend Model (IPO/IPOWithGMP)
{
  id, name, company_code, symbol, registrar,
  open_date, close_date, result_date, listing_date,
  price_band_low, price_band_high, issue_size,
  min_qty, min_amount, status, logo_url,
  gmp_value?, gain_percent?, estimated_listing?
}

// Frontend Model (DisplayIPO)
{
  id, name, companyName, companyCode, symbol,
  priceRange: { min, max },
  dates: { open, close, allotment, listing },
  lotSize, minInvestment, category,
  gmp?: { value, gainPercent, estimatedListing }
}
```

#### Key Transformations
- **Price Range**: `price_band_low/high` → `priceRange.min/max`
- **Dates**: Individual date fields → `dates` object
- **Category**: Determined by `issue_size` (mainboard vs SME)
- **GMP Data**: Optional enhancement for market premium info

## 📱 Screen-Level API Usage

### HomeScreen (`src/screens/HomeScreen.tsx`)
```typescript
// Multiple data sources
const { indices, loading: indicesLoading } = useMarketIndices(true)
const { ipos: allIPOs, loading: iposLoading } = useIPOList('all', true)
const { getIPOsForFilter } = useIPOFiltering(allIPOs)

// Navigation with data
const handleIPOPress = (ipo: DisplayIPO) => {
  navigation.navigate('IPODetails', { ipo })
}
```

### IPODetailsScreen (`src/screens/IPODetailsScreen.tsx`)
```typescript
// Conditional data fetching
const { ipo: routeIPO, ipoId } = route.params || {}
const { ipo: fetchedIPO, loading, error } = useIPODetails(
  ipoId && !routeIPO ? ipoId : null, 
  true // include GMP
)
const ipo: DisplayIPO | null = routeIPO || fetchedIPO
```

### CheckScreen (`src/screens/CheckScreen.tsx`)
```typescript
// Allotment checking
const { result, loading, error, checkAllotment, reset } = useAllotmentCheck()

const handleCheck = async () => {
  await checkAllotment(ipoId, pan)
}
```

## 🚀 App Initialization & Performance

### Startup Flow (`App.tsx` → `useAppInitialization`)
1. **Font Loading**: Inter font family (400, 600, 700 weights)
2. **Cache Warmup**: `POST /performance/cache/warmup`
3. **Debug Tests** (Dev mode only):
   - Network connectivity test
   - Backend availability test
   - Data transformation test
   - IPO data fetching test

### Auto-Refresh Mechanisms
- **Market Indices**: 30-second intervals
- **Most Traded Stocks**: 60-second intervals
- **Manual Refresh**: Available via `refresh()` callbacks

## 🛡️ Error Handling & Fallbacks

### API Error Types
```typescript
class APIError extends Error {
  statusCode: number  // HTTP status
  code?: string      // Custom error code
}
```

### Error Scenarios
- **Timeout**: 408 status, 'TIMEOUT' code
- **Network**: 500 status, 'NETWORK_ERROR' code
- **Unknown**: 500 status, 'UNKNOWN' code

### Fallback Strategies
- **Stock Service**: Mock data for unavailable endpoints
- **Development Mode**: Mock IPO data if API fails
- **Graceful Degradation**: Console warnings, continue operation

## 🔧 Configuration & Environment

### Environment Variables
```bash
EXPO_PUBLIC_API_URL=http://your-api-url/api/v1
EXPO_PUBLIC_API_TIMEOUT=10000
```

### Platform-Specific URLs
- **Android Emulator**: `10.0.2.2:8080` (maps to host localhost)
- **iOS Simulator**: `localhost:8080`
- **Physical Devices**: Use machine IP (e.g., `192.168.0.103:8080`)

## 🧪 Development & Debugging

### Debug Utilities (`src/debug/`)
- **Network Test**: Connectivity verification
- **Backend Test**: API availability check
- **Data Fix Test**: Transformation validation
- **IPO Data Test**: End-to-end data flow test

### Development Logging
- All API requests/responses logged
- Network error details with troubleshooting tips
- Performance metrics tracking
- Cache warmup status

## 📦 Key Dependencies

### Core Framework
- **React Native**: 0.81.5
- **Expo**: ~54.0.30
- **React**: 19.1.0

### Navigation & UI
- **React Navigation**: v7 (Native Stack, Bottom Tabs)
- **Gluestack UI**: v1.1.73 (Component library)
- **Lucide React Native**: Icons

### State & Data
- **Zustand**: v5.0.9 (State management)
- **Axios**: v1.13.2 (Listed but not used - using Fetch)

### Development
- **TypeScript**: ~5.9.2
- **Babel**: Transform inline environment variables

## 🔍 Type Safety

### API Response Types
```typescript
interface APIResponse<T> {
  success: boolean
  data: T
}

interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
  }
}
```

### Data Models
- **IPO**: Backend model matching API response
- **IPOWithGMP**: Enhanced with Grey Market Premium
- **DisplayIPO**: Frontend-optimized model
- **Stock**: Market data model
- **MarketIndex**: Index data (Nifty, Sensex)
- **AllotmentResult**: Allotment check response

## 🚨 Security Considerations

### Current Implementation
- **No Authentication**: No API keys or bearer tokens
- **PAN Handling**: Sent in plain text (should be hashed)
- **No Request Signing**: No HMAC or signature validation

### Recommendations
- Implement API key authentication
- Hash PAN numbers before transmission
- Add request signing for sensitive operations
- Implement rate limiting on client side
- Add input validation and sanitization

## 📈 Performance Optimizations

- **Zustand**: Efficient state management with selectors
- **Lazy Loading**: Debug utilities loaded only in dev mode
- **Request Cancellation**: AbortController prevents memory leaks
- **Cache Warmup**: Preload data on app startup
- **Auto-refresh**: Intelligent intervals for real-time data
- **Fallback Data**: Graceful degradation with mock data

## 🔄 Data Flow Summary

1. **App Initialization** → Cache warmup → Font loading
2. **Screen Mount** → Custom hook → Service call → API client
3. **API Response** → Data transformation → Store update
4. **Component Re-render** → UI update with new data
5. **Auto-refresh** → Periodic data updates (indices: 30s, stocks: 60s)
6. **Error Handling** → Fallback data → User notification

This architecture provides a robust, scalable foundation for real-time IPO and market data consumption with excellent error handling and development experience.
