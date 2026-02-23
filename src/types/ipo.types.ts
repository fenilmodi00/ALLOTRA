// IPO Status Types (matching backend)
export type IPOStatus = 'LIVE' | 'UPCOMING' | 'CLOSED' | 'LISTED' | 'UNKNOWN'

// Allotment Status Types
export type AllotmentStatus = 'ALLOTTED' | 'NOT_ALLOTTED' | 'PENDING' | 'NOT_APPLIED'

// Backend IPO Data Model (matches API response)
export interface IPO {
  id: string
  stock_id: string
  name: string
  company_code: string
  symbol?: string
  registrar: string
  open_date?: string
  close_date?: string
  result_date?: string
  listing_date?: string
  price_band_low?: number
  price_band_high?: number
  issue_size?: string
  min_qty?: number
  min_amount?: number
  status: IPOStatus
  subscription_status?: string
  listing_gain?: string
  logo_url?: string
  description?: string
  about?: string
  slug?: string
  strengths: string[]
  risks: string[]
  created_at: string
  updated_at: string
  created_by?: string
}

// IPO with GMP Data (enhanced backend response)
export interface IPOWithGMP extends IPO {
  gmp_value?: number
  gain_percent?: number
  estimated_listing?: number
  gmp_last_updated?: string
  gmp_stock_id?: string
  gmp_subscription_status?: string
  gmp_listing_gain?: string
  gmp_ipo_status?: string
  gmp_data_source?: string
}

// Frontend-friendly IPO model (transformed from backend)
export interface DisplayIPO {
  id: string
  stockId?: string
  name: string
  companyName: string
  companyCode: string
  symbol?: string
  priceRange: {
    min?: number
    max?: number
  }
  status: IPOStatus
  dates: {
    open?: string
    close?: string
    allotment?: string
    listing?: string
  }
  lotSize?: number
  minInvestment?: number
  registrar: string
  logoUrl?: string
  category: 'mainboard' | 'sme'
  issueSize?: string
  subscriptionStatus?: string
  listingGain?: string
  description?: string
  about?: string
  strengths: string[]
  risks: string[]
  // GMP Data
  gmp?: {
    value?: number
    gainPercent?: number
    estimatedListing?: number
    lastUpdated?: string
    subscriptionStatus?: string
    listingGain?: string
    dataSource?: string
  }
}

export interface GMPHistoryRawPoint {
  date?: string
  time?: string
  timestamp?: string
  gmp_value?: number
  gmp?: number
  value?: number
  ipo_price?: number
  ipoPrice?: number
  listing_percent?: number
  listingPercent?: number
}

export interface GMPHistoryPoint {
  date: string
  gmpValue: number
  ipoPrice?: number
  listingPercent?: number
}

export interface GMPHistoryResponse {
  stock_id?: string
  history?: GMPHistoryRawPoint[]
  chart_data?: GMPHistoryRawPoint[]
  chart?: GMPHistoryRawPoint[]
  points?: GMPHistoryRawPoint[]
}

// Stock/Index Data Model
export interface Stock {
  id: string
  name: string
  symbol: string
  price: number
  change: number
  changePercent: number
  isPositive: boolean
  logoUrl?: string
}

export interface MarketIndex {
  id: string
  name: string
  value: number
  change: number
  change_percent: number
  is_positive: boolean
}

export interface MarketIndexAPIItem {
  symbol: string
  price: number
  change: number
  changePercent: string
  isPositive: boolean
  timestamp: string
  cached: boolean
}

export interface MarketIndicesAPIResponse {
  nifty50: MarketIndexAPIItem
  sensex: MarketIndexAPIItem
  banknifty: MarketIndexAPIItem
  niftymidcap: MarketIndexAPIItem
}

// Allotment Check Result
export interface AllotmentResult {
  status: AllotmentStatus
  ipoId: string
  ipoName: string
  pan: string
  sharesApplied: number
  sharesAllotted: number
  applicationNumber?: string
  category?: string
  message?: string
  checkedAt: string
}

// API Response Types
export interface APIResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
