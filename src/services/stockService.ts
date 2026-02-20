import { apiClient } from './api'
import type { Stock } from '../types'

// Stock Service - All stock-related API calls
export const stockService = {
  // Get most traded stocks
  async getMostTradedStocks(limit = 10): Promise<Stock[]> {
    try {
      const response = await apiClient.get<{ data: Stock[], success: boolean }>(`/market/stocks/most-traded?limit=${limit}`)
      return response.data.data || []
    } catch (error) {
      console.warn('Most traded stocks API not available, using fallback data')
      // Fallback to mock data if API is not available
      return getMockStockData()
    }
  },

  // Get gainers
  async getGainers(category: 'large' | 'mid' | 'small' = 'large', limit = 10): Promise<Stock[]> {
    try {
      const response = await apiClient.get<{ data: Stock[], success: boolean }>(`/market/stocks/gainers?category=${category}&limit=${limit}`)
      return response.data.data || []
    } catch (error) {
      console.warn('Gainers API not available, using fallback data')
      return getMockGainersData(category)
    }
  },

  // Get losers
  async getLosers(category: 'large' | 'mid' | 'small' = 'large', limit = 10): Promise<Stock[]> {
    try {
      const response = await apiClient.get<{ data: Stock[], success: boolean }>(`/market/stocks/losers?category=${category}&limit=${limit}`)
      return response.data.data || []
    } catch (error) {
      console.warn('Losers API not available, using fallback data')
      return getMockLosersData(category)
    }
  },

  // Get stock by symbol
  async getStockBySymbol(symbol: string): Promise<Stock> {
    const response = await apiClient.get<{ data: Stock, success: boolean }>(`/market/stocks/${symbol}`)
    return response.data.data
  },

  // Search stocks
  async searchStocks(query: string, limit = 20): Promise<Stock[]> {
    const response = await apiClient.get<{ data: Stock[], success: boolean }>(`/market/stocks/search?q=${encodeURIComponent(query)}&limit=${limit}`)
    return response.data.data || []
  }
}

// Mock data functions for fallback
function getMockStockData(): Stock[] {
  return [
    {
      id: '1',
      name: 'VOLKSWAGEN',
      symbol: 'VOLKS',
      price: 5517.45,
      change: -103.40,
      changePercent: -1.84,
      isPositive: false,
      logoUrl: undefined
    },
    {
      id: '2',
      name: 'FORD',
      symbol: 'FORD',
      price: 613.85,
      change: -33.70,
      changePercent: -5.84,
      isPositive: false,
      logoUrl: undefined
    },
    {
      id: '3',
      name: 'DASH',
      symbol: 'DASH',
      price: 210.53,
      change: 56.21,
      changePercent: 3.845,
      isPositive: true,
      logoUrl: undefined
    },
    {
      id: '4',
      name: 'KFC',
      symbol: 'KFC',
      price: 842.65,
      change: 23.51,
      changePercent: 1.65,
      isPositive: true,
      logoUrl: undefined
    }
  ]
}

function getMockGainersData(category: string): Stock[] {
  const baseData = [
    { name: 'RELIANCE', symbol: 'RELIANCE', price: 2456.75, change: 89.25, changePercent: 3.77 },
    { name: 'TCS', symbol: 'TCS', price: 3789.50, change: 125.80, changePercent: 3.43 },
    { name: 'HDFC BANK', symbol: 'HDFCBANK', price: 1678.90, change: 45.60, changePercent: 2.79 },
    { name: 'INFOSYS', symbol: 'INFY', price: 1456.30, change: 38.75, changePercent: 2.73 },
    { name: 'ICICI BANK', symbol: 'ICICIBANK', price: 987.65, change: 24.85, changePercent: 2.58 }
  ]

  return baseData.map((stock, index) => ({
    id: `gainer-${category}-${index}`,
    name: stock.name,
    symbol: stock.symbol,
    price: stock.price,
    change: stock.change,
    changePercent: stock.changePercent,
    isPositive: true,
    logoUrl: undefined
  }))
}

function getMockLosersData(category: string): Stock[] {
  const baseData = [
    { name: 'ADANI PORTS', symbol: 'ADANIPORTS', price: 756.20, change: -28.45, changePercent: -3.63 },
    { name: 'BAJAJ FINANCE', symbol: 'BAJFINANCE', price: 6789.30, change: -198.70, changePercent: -2.84 },
    { name: 'MARUTI', symbol: 'MARUTI', price: 9876.45, change: -267.85, changePercent: -2.64 },
    { name: 'ASIAN PAINTS', symbol: 'ASIANPAINT', price: 3245.60, change: -78.90, changePercent: -2.37 },
    { name: 'TITAN', symbol: 'TITAN', price: 2987.75, change: -65.25, changePercent: -2.14 }
  ]

  return baseData.map((stock, index) => ({
    id: `loser-${category}-${index}`,
    name: stock.name,
    symbol: stock.symbol,
    price: stock.price,
    change: stock.change,
    changePercent: stock.changePercent,
    isPositive: false,
    logoUrl: undefined
  }))
}

// Export individual functions for tree-shaking
export const { 
  getMostTradedStocks,
  getGainers,
  getLosers,
  getStockBySymbol,
  searchStocks
} = stockService