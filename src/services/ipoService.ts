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
  MarketIndicesAPIResponse,
  IPOV2Response,
} from '../types'
import { transformIPOData, transformIPOList, transformIPOListV2, transformMarketIndices, transformIPODataV2 } from '../utils/dataTransformers'
import { mapAllotmentStatus } from './mappers/allotmentMapper'

const MARKET_INDICES_URL = 'https://nifty-proxy.feniluvpce.workers.dev/all'

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
  // Get all IPOs with optional filters - now uses V2
  async getIPOs(params?: { status?: string; page?: number; limit?: number }): Promise<DisplayIPO[]> {
    return this.getFeedV2({ status: params?.status, limit: params?.limit, offset: params?.page ? (params.page - 1) * (params.limit || 50) : undefined })
  },

  // Get active IPOs with GMP data - now uses V2
  async getActiveIPOsWithGMP(): Promise<DisplayIPO[]> {
    return this.getFeedV2({ status: 'all' })
  },

  // Get IPO feed with V2 API (optimized, reduced payload)
  async getFeedV2(params?: { status?: string; limit?: number; offset?: number }): Promise<DisplayIPO[]> {
    const query = new URLSearchParams()
    if (params?.status && params.status !== 'all') {
      query.append('status', params.status)
    }
    if (params?.limit) {
      query.append('limit', params.limit.toString())
    }
    if (params?.offset) {
      query.append('offset', params.offset.toString())
    }
    
    const queryString = query.toString()
    const endpoint = `/v2/ipos/feed${queryString ? `?${queryString}` : ''}`
    
    const response = await apiClient.get<{ 
      data: IPOV2Response[], 
      success: boolean,
      meta?: { total: number; limit: number; offset: number; has_next: boolean }
    }>(endpoint)
    
    return transformIPOListV2(response.data.data || [])
  },

  // Get active IPOs only - now uses V2
  async getActiveIPOs(): Promise<DisplayIPO[]> {
    return this.getFeedV2({ status: 'live' })
  },

  // Get single IPO by ID - now uses V2
  async getIPOById(id: string): Promise<DisplayIPO> {
    return this.getIPOByIdWithGMP(id)
  },

  // Get single IPO with GMP data by ID (V2 API - recommended)
  async getIPOByIdWithGMP(id: string): Promise<DisplayIPO> {
    const response = await apiClient.get<{ data: IPOV2Response, success: boolean }>(`/v2/ipos/${id}`)
    return transformIPODataV2(response.data.data)
  },

  // Get IPOs by status with filtering - now uses V2
  async getIPOsByStatus(status: 'UPCOMING' | 'LIVE' | 'CLOSED' | 'LISTED'): Promise<DisplayIPO[]> {
    return this.getFeedV2({ status: status.toLowerCase() })
  },

  // Get live/ongoing IPOs - now uses V2
  async getLiveIPOs(): Promise<DisplayIPO[]> {
    return this.getFeedV2({ status: 'live' })
  },

  // Get upcoming IPOs - now uses V2
  async getUpcomingIPOs(): Promise<DisplayIPO[]> {
    return this.getFeedV2({ status: 'upcoming' })
  },

  // Get closed IPOs (allotment pending or done) - now uses V2
  async getClosedIPOs(): Promise<DisplayIPO[]> {
    return this.getFeedV2({ status: 'closed' })
  },

  // Get listed IPOs - now uses V2
  async getListedIPOs(): Promise<DisplayIPO[]> {
    return this.getFeedV2({ status: 'listed' })
  },

  // Check allotment status - now uses V2
  async checkAllotment(ipoId: string, pan: string): Promise<AllotmentResult> {
    return this.checkAllotmentV2(ipoId, pan)
  },

  // Check allotment status with V2 API (reduced response)
  async checkAllotmentV2(ipoId: string, pan: string): Promise<AllotmentResult> {
    const response = await apiClient.post<{
      data: {
        status: string
        shares_applied: number
        shares_allotted: number
        message: string
      }
      success: boolean
    }>('/v2/allotment/check', { 
      ipo_id: ipoId, 
      pan 
    })
    
    const data = response.data.data
    return {
      status: mapAllotmentStatus(data.status),
      ipoId: ipoId,
      ipoName: '',
      pan: pan,
      sharesApplied: data.shares_applied,
      sharesAllotted: data.shares_allotted,
      message: data.message,
      checkedAt: new Date().toISOString()
    }
  },

  // Get market indices
  async getMarketIndices(): Promise<MarketIndex[]> {
    const response = await apiClient.get<MarketIndicesAPIResponse>(MARKET_INDICES_URL)
    return transformMarketIndices(response.data)
  },

  // Get IPO GMP data separately (if needed) - uses V2 detail which includes GMP
  async getIPOGMP(ipoId: string) {
    const ipo = await this.getIPOByIdWithGMP(ipoId)
    return {
      gmp: ipo.gmp?.value,
      expectedListing: ipo.gmp?.estimatedListing,
      gainPercent: ipo.gmp?.gainPercent
    }
  },

  // Get GMP history for charting - uses V2 endpoint
  async getGMPHistory(stockId: string): Promise<GMPHistoryPoint[]> {
    const response = await apiClient.get<{ data: GMPHistoryResponse | GMPHistoryRawPoint[]; success: boolean }>(
      `/v2/gmp/history/${stockId}/chart`
    )

    const rows = getGMPHistoryRows(response.data.data)

    return normalizeGMPHistory(rows)
  },

  // Get performance metrics (for debugging/monitoring)
  async getPerformanceMetrics() {
    return apiClient.get('/v1/performance/metrics')
  },

  // Warm up cache (call on app startup)
  async warmupCache() {
    return apiClient.post('/v1/performance/cache/warmup', {})
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
  checkAllotmentV2,
  getMarketIndices,
  getIPOGMP,
  getGMPHistory,
  getFeedV2,
} = ipoService
