import { ipoService } from '../services/ipoService'
import type { DisplayIPO } from '../types'

// Test utility to debug IPO data fetching
export const testIPODataFetching = async () => {
  console.log('🧪 Testing IPO data fetching...')
  
  try {
    // Test 1: Fetch active IPOs with GMP
    console.log('📊 Testing active IPOs with GMP...')
    const activeIPOs = await ipoService.getActiveIPOsWithGMP()
    console.log(`✅ Active IPOs fetched: ${activeIPOs.length} items`)
    
    if (activeIPOs.length > 0) {
      const sample = activeIPOs[0]
      console.log('📋 Sample IPO data:', {
        id: sample.id,
        name: sample.name,
        status: sample.status,
        dates: sample.dates,
        priceRange: sample.priceRange,
        hasGMP: !!sample.gmp,
        gmpValue: sample.gmp?.value
      })
    }
    
    // Test 2: Check status distribution
    const statusCounts = activeIPOs.reduce((acc, ipo) => {
      acc[ipo.status] = (acc[ipo.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log('📊 Status distribution:', statusCounts)
    
    // Test 3: Check date ranges
    const now = new Date()
    const dateAnalysis = activeIPOs.map(ipo => {
      const openDate = ipo.dates.open ? new Date(ipo.dates.open) : null
      const closeDate = ipo.dates.close ? new Date(ipo.dates.close) : null
      
      return {
        name: ipo.name,
        status: ipo.status,
        isOpenInPast: openDate ? openDate < now : null,
        isCloseInFuture: closeDate ? closeDate > now : null,
        isOngoing: openDate && closeDate ? (now >= openDate && now <= closeDate) : null
      }
    })
    
    console.log('📅 Date analysis (first 3):', dateAnalysis.slice(0, 3))
    
    return {
      success: true,
      totalIPOs: activeIPOs.length,
      statusCounts,
      sampleData: activeIPOs.slice(0, 3)
    }
    
  } catch (error) {
    console.error('❌ IPO data fetching failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Mock data for fallback when backend is not available
export const getMockIPOData = (): DisplayIPO[] => {
  return [
    {
      id: 'mock-1',
      name: 'Sample Tech IPO',
      companyName: 'Sample Tech Ltd',
      companyCode: 'SAMPLE',
      priceRange: { min: 100, max: 120 },
      status: 'LIVE',
      dates: {
        open: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        close: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      },
      lotSize: 100,
      minInvestment: 10000,
      registrar: 'Sample Registrar',
      category: 'mainboard',
      strengths: ['Strong financials', 'Market leader'],
      risks: ['Market volatility'],
      gmp: {
        value: 25,
        gainPercent: 20.83,
        estimatedListing: 145
      }
    },
    {
      id: 'mock-2',
      name: 'Future Corp IPO',
      companyName: 'Future Corp Ltd',
      companyCode: 'FUTURE',
      priceRange: { min: 200, max: 250 },
      status: 'UPCOMING',
      dates: {
        open: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        close: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
      },
      lotSize: 50,
      minInvestment: 10000,
      registrar: 'Future Registrar',
      category: 'mainboard',
      strengths: ['Innovation leader'],
      risks: ['New market'],
    },
    {
      id: 'mock-3',
      name: 'Closed Corp IPO',
      companyName: 'Closed Corp Ltd',
      companyCode: 'CLOSED',
      priceRange: { min: 150, max: 180 },
      status: 'CLOSED',
      dates: {
        open: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        close: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        listing: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      },
      lotSize: 75,
      minInvestment: 11250,
      registrar: 'Closed Registrar',
      category: 'mainboard',
      strengths: ['Established business'],
      risks: ['Competition'],
    },
    {
      id: 'mock-4',
      name: 'Listed Corp',
      companyName: 'Listed Corp Ltd',
      companyCode: 'LISTED',
      priceRange: { min: 300, max: 350 },
      status: 'LISTED',
      dates: {
        open: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
        close: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
        listing: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      },
      lotSize: 25,
      minInvestment: 7500,
      registrar: 'Listed Registrar',
      category: 'mainboard',
      strengths: ['Market presence'],
      risks: ['Valuation concerns'],
    }
  ]
}

// Run test in development mode
export const runIPODataTest = () => {
  if (__DEV__) {
    setTimeout(() => {
      testIPODataFetching()
    }, 2000)
  }
}