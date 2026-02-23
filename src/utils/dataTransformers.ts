import { IPO, IPOWithGMP, DisplayIPO, MarketIndex, MarketIndicesAPIResponse } from '../types'
import type { IPOStatus } from '../types'

/**
 * Normalize backend status strings to canonical IPOStatus values.
 * The backend can return 'ACTIVE' or 'ONGOING' for live IPOs.
 */
const normalizeIPOStatus = (status: string | undefined): IPOStatus => {
  switch ((status || '').toUpperCase()) {
    case 'ACTIVE':
    case 'ONGOING':
      return 'LIVE'
    case 'LIVE':
      return 'LIVE'
    case 'UPCOMING':
      return 'UPCOMING'
    case 'CLOSED':
      return 'CLOSED'
    case 'LISTED':
      return 'LISTED'
    default:
      return 'UNKNOWN'
  }
}

/**
 * Transform backend IPO data to frontend display format
 */
export const transformIPOData = (ipo: IPO | IPOWithGMP): DisplayIPO => {
  if (!ipo) {
    console.warn('⚠️ transformIPOData received null/undefined IPO data')
    throw new Error('Invalid IPO data')
  }

  // Determine category based on issue size or other criteria
  const category = determineIPOCategory(ipo)
  
  const transformed: DisplayIPO = {
    id: ipo.id || '',
    stockId: ipo.stock_id || undefined,
    name: ipo.name || 'Unknown IPO',
    companyName: ipo.name || 'Unknown Company',
    companyCode: ipo.company_code || '',
    symbol: ipo.symbol || undefined,
    priceRange: {
      min: ipo.price_band_low || 0,
      max: ipo.price_band_high || 0,
    },
    status: normalizeIPOStatus(ipo.status),
    dates: {
      open: ipo.open_date || undefined,
      close: ipo.close_date || undefined,
      allotment: ipo.result_date || undefined,
      listing: ipo.listing_date || undefined,
    },
    lotSize: ipo.min_qty || 0,
    minInvestment: ipo.min_amount || 0,
    registrar: ipo.registrar || 'Unknown',
    logoUrl: ipo.logo_url || undefined,
    category,
    issueSize: ipo.issue_size || undefined,
    subscriptionStatus: ipo.subscription_status || undefined,
    listingGain: ipo.listing_gain || undefined,
    description: ipo.description || undefined,
    about: ipo.about || undefined,
    strengths: Array.isArray(ipo.strengths) ? ipo.strengths : [],
    risks: Array.isArray(ipo.risks) ? ipo.risks : [],
  }

  // Add GMP data if available
  if ('gmp_value' in ipo && ipo.gmp_value !== undefined) {
    transformed.gmp = {
      value: ipo.gmp_value,
      gainPercent: ipo.gain_percent || 0,
      estimatedListing: ipo.estimated_listing || 0,
      lastUpdated: ipo.gmp_last_updated || undefined,
      subscriptionStatus: ipo.gmp_subscription_status || undefined,
      listingGain: ipo.gmp_listing_gain || undefined,
      dataSource: ipo.gmp_data_source || undefined,
    }
  }

  return transformed
}

/**
 * Transform array of IPO data
 */
export const transformIPOList = (ipos: (IPO | IPOWithGMP)[] | null | undefined): DisplayIPO[] => {
  if (!ipos || !Array.isArray(ipos)) {
    console.warn('⚠️ transformIPOList received invalid data:', ipos)
    return []
  }
  return ipos.map(transformIPOData)
}

/**
 * Determine IPO category based on available data
 */
const determineIPOCategory = (ipo: IPO | IPOWithGMP): 'mainboard' | 'sme' => {
  // Logic to determine if it's mainboard or SME
  // You can adjust this based on your business logic
  
  if (ipo.issue_size) {
    try {
      // Handle different formats: "2508000000.00", "1200 Cr", "25.5 Crores", etc.
      const sizeStr = ipo.issue_size.toString().toLowerCase()
      
      // If it contains "cr" or "crore", extract the number
      if (sizeStr.includes('cr')) {
        const match = sizeStr.match(/[\d,]+\.?\d*/)
        if (match) {
          const sizeValue = parseFloat(match[0].replace(/,/g, ''))
          // SME IPOs are typically smaller (< 25 Cr in India)
          return sizeValue < 25 ? 'sme' : 'mainboard'
        }
      }
      
      // If it's a plain number (likely in rupees)
      const numericMatch = sizeStr.match(/^[\d,]+\.?\d*$/)
      if (numericMatch) {
        const sizeValue = parseFloat(numericMatch[0].replace(/,/g, ''))
        // Convert to crores (assuming the number is in rupees)
        const sizeInCrores = sizeValue / 10000000 // 1 crore = 10,000,000
        return sizeInCrores < 25 ? 'sme' : 'mainboard'
      }
    } catch (error) {
      console.warn('Error parsing issue size:', ipo.issue_size, error)
    }
  }
  
  // Default to mainboard if we can't determine
  return 'mainboard'
}

/**
 * Format price range for display
 */
export const formatPriceRange = (min?: number, max?: number): string => {
  if (!min && !max) return 'Price not available'
  if (min === max) return `₹${min}`
  if (!min) return `Up to ₹${max}`
  if (!max) return `From ₹${min}`
  return `₹${min} - ₹${max}`
}

/**
 * Format dates for display
 */
export const formatIPODate = (dateString?: string): string => {
  if (!dateString) return 'Not available'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return 'Invalid date'
  }
}

/**
 * Get status color for UI
 */
export const getStatusColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
    case 'ONGOING':
    case 'LIVE':
      return '#10B981' // Green
    case 'UPCOMING':
      return '#3B82F6' // Blue
    case 'CLOSED':
      return '#F59E0B' // Amber
    case 'LISTED':
      return '#8B5CF6' // Purple
    default:
      return '#6B7280' // Gray
  }
}

/**
 * Calculate days remaining for IPO
 */
export const getDaysRemaining = (closeDate?: string): number | null => {
  if (!closeDate) return null
  
  try {
    const close = new Date(closeDate)
    const now = new Date()
    const diffTime = close.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays > 0 ? diffDays : 0
  } catch {
    return null
  }
}

const parseChangePercent = (value: string): number => {
  const parsed = Number.parseFloat(value.replace('%', ''))
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Transform Cloudflare market indices response to app format
 */
export const transformMarketIndices = (payload: MarketIndicesAPIResponse): MarketIndex[] => {
  const entries: Array<[string, keyof MarketIndicesAPIResponse]> = [
    ['nifty50', 'nifty50'],
    ['sensex', 'sensex'],
    ['banknifty', 'banknifty'],
    ['niftymidcap', 'niftymidcap'],
  ]

  return entries.map(([id, key]) => {
    const item = payload[key]

    return {
      id,
      name: item.symbol,
      value: item.price,
      change: item.change,
      change_percent: parseChangePercent(item.changePercent),
      is_positive: item.isPositive,
    }
  })
}
