import { apiClient } from './api'
import type {
  IPO,
  IPOWithGMP,
  AllotmentResult,
  MarketIndex,
  PaginatedResponse,
  DisplayIPO,
  GMPHistoryPoint,
  GMPHistoryRawPoint,
  GMPHistoryResponse,
} from '../types'
import { transformIPOData, transformIPOList } from '../utils/dataTransformers'
import { mapAllotmentStatus } from './mappers/allotmentMapper'

const normalizeGMPHistory = (rows: GMPHistoryRawPoint[]): GMPHistoryPoint[] => {
  return rows
    .map((row) => ({
      date: row.date ?? row.timestamp ?? row.time ?? '',
      gmpValue: Number(row.gmp_value ?? row.gmp ?? row.value ?? Number.NaN),
      timestamp: Date.parse(row.date ?? row.timestamp ?? row.time ?? ''),
      ipoPrice: Number(row.ipo_price ?? row.ipoPrice ?? Number.NaN),
      listingPercent: Number(row.listing_percent ?? row.listingPercent ?? Number.NaN),
    }))
    .filter((row) => row.date && Number.isFinite(row.gmpValue) && Number.isFinite(row.timestamp))
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(({ date, gmpValue, ipoPrice, listingPercent }) => {
      const point: GMPHistoryPoint = { date, gmpValue }

      if (Number.isFinite(ipoPrice)) {
        point.ipoPrice = ipoPrice
      }

      if (Number.isFinite(listingPercent)) {
        point.listingPercent = listingPercent
      }

      return point
    })
}

const getGMPHistoryRows = (payload: GMPHistoryResponse | GMPHistoryRawPoint[] | null | undefined): GMPHistoryRawPoint[] => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (!payload) {
    return []
  }

  if (Array.isArray(payload.chart)) {
    return payload.chart
  }

  if (Array.isArray(payload.chart_data)) {
    return payload.chart_data
  }

  if (Array.isArray(payload.history)) {
    return payload.history
  }

  if (Array.isArray(payload.points)) {
    return payload.points
  }

  return []
}

// IPO Service - All IPO-related API calls
export const ipoService = {
  // Get all IPOs with optional filters
  async getIPOs(params?: { status?: string; page?: number; limit?: number }): Promise<DisplayIPO[]> {
    const query = new URLSearchParams()
    if (params?.status && params.status !== 'all') {
      query.append('status', params.status)
    }
    
    const queryString = query.toString()
    const endpoint = `/ipos${queryString ? `?${queryString}` : ''}`
    
    const response = await apiClient.get<{ data: IPO[], success: boolean }>(endpoint)
    return transformIPOList(response.data.data || [])
  },

  // Get active IPOs with GMP data (recommended for main feed)
  async getActiveIPOsWithGMP(): Promise<DisplayIPO[]> {
    const response = await apiClient.get<{ data: IPOWithGMP[], success: boolean }>('/ipos/active-with-gmp')
    return transformIPOList(response.data.data || [])
  },

  // Get active IPOs only
  async getActiveIPOs(): Promise<DisplayIPO[]> {
    const response = await apiClient.get<{ data: IPO[], success: boolean }>('/ipos/active')
    return transformIPOList(response.data.data || [])
  },

  // Get single IPO by ID
  async getIPOById(id: string): Promise<DisplayIPO> {
    const response = await apiClient.get<{ data: IPO, success: boolean }>(`/ipos/${id}`)
    return transformIPOData(response.data.data)
  },

  // Get single IPO with GMP data by ID
  async getIPOByIdWithGMP(id: string): Promise<DisplayIPO> {
    const response = await apiClient.get<{ data: IPOWithGMP, success: boolean }>(`/ipos/${id}/with-gmp`)
    return transformIPOData(response.data.data)
  },

  // Get IPOs by status with filtering
  async getIPOsByStatus(status: 'UPCOMING' | 'LIVE' | 'CLOSED' | 'LISTED'): Promise<DisplayIPO[]> {
    return this.getIPOs({ status: status.toLowerCase() })
  },

  // Get live/ongoing IPOs (alias for active)
  async getLiveIPOs(): Promise<DisplayIPO[]> {
    return this.getActiveIPOs()
  },

  // Get upcoming IPOs
  async getUpcomingIPOs(): Promise<DisplayIPO[]> {
    return this.getIPOsByStatus('UPCOMING')
  },

  // Get closed IPOs (allotment pending or done)
  async getClosedIPOs(): Promise<DisplayIPO[]> {
    return this.getIPOsByStatus('CLOSED')
  },

  // Get listed IPOs
  async getListedIPOs(): Promise<DisplayIPO[]> {
    return this.getIPOsByStatus('LISTED')
  },

  // Check allotment status
  async checkAllotment(ipoId: string, pan: string): Promise<AllotmentResult> {
    const response = await apiClient.post<{
      data: {
        status: string
        ipo_id: string
        pan_hash: string
        shares_allotted: number
        application_number: string
        timestamp: string
      }
      success: boolean
    }>('/check', { 
      ipo_id: ipoId, 
      pan 
    })
    
    // Transform backend response to frontend format
    const data = response.data.data
    return {
      status: mapAllotmentStatus(data.status),
      ipoId: data.ipo_id,
      ipoName: '', // You might need to fetch this separately
      pan: data.pan_hash, // Note: backend returns hashed PAN
      sharesApplied: 0, // Not available in backend response
      sharesAllotted: data.shares_allotted,
      applicationNumber: data.application_number,
      message: data.status,
      checkedAt: data.timestamp
    }
  },

  // Get market indices
  async getMarketIndices(): Promise<MarketIndex[]> {
    const response = await apiClient.get<{ data: MarketIndex[], success: boolean }>('/market/indices')
    return response.data.data || []
  },

  // Get IPO GMP data separately (if needed)
  async getIPOGMP(ipoId: string) {
    const response = await apiClient.get<{
      data: {
        gmp_value: number
        estimated_listing: number
        gain_percent: number
      }
      success: boolean
    }>(`/ipos/${ipoId}/gmp`)
    
    const data = response.data.data
    return {
      gmp: data.gmp_value,
      expectedListing: data.estimated_listing,
      gainPercent: data.gain_percent
    }
  },

  // Get GMP history for charting
  async getGMPHistory(stockId: string): Promise<GMPHistoryPoint[]> {
    const response = await apiClient.get<{ data: GMPHistoryResponse | GMPHistoryRawPoint[]; success: boolean }>(
      `/gmp/history/${stockId}/chart`
    )

    const rows = getGMPHistoryRows(response.data.data)

    return normalizeGMPHistory(rows)
  },

  // Get performance metrics (for debugging/monitoring)
  async getPerformanceMetrics() {
    return apiClient.get('/performance/metrics')
  },

  // Warm up cache (call on app startup)
  async warmupCache() {
    return apiClient.post('/performance/cache/warmup', {})
  }
}

// Export individual functions for tree-shaking
export const { 
  getIPOs, 
  getActiveIPOsWithGMP,
  getActiveIPOs,
  getIPOById, 
  getIPOByIdWithGMP,
  getLiveIPOs, 
  getUpcomingIPOs,
  getClosedIPOs,
  getListedIPOs,
  checkAllotment, 
  getMarketIndices,
  getIPOGMP,
  getGMPHistory,
} = ipoService
