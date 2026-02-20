import { ipoService } from '../services/ipoService'
import { testNetworkConnection } from './networkTest'

export const testBackendConnection = async () => {
  console.log('🔄 Testing backend connection...')
  
  try {
    // First test basic network connectivity
    const networkTest = await testNetworkConnection()
    if (!networkTest.success) {
      return networkTest
    }
    
    // Test 2: Fetch active IPOs with GMP
    console.log('📊 Fetching active IPOs with GMP...')
    const activeIPOs = await ipoService.getActiveIPOsWithGMP()
    console.log(`✅ Found ${activeIPOs.length} active IPOs`)
    
    if (activeIPOs.length > 0) {
      const firstIPO = activeIPOs[0]
      console.log('📋 Sample IPO:', {
        name: firstIPO.name,
        status: firstIPO.status,
        priceRange: firstIPO.priceRange,
        gmp: firstIPO.gmp
      })
    }
    
    // Test 3: Fetch market indices
    console.log('📈 Fetching market indices...')
    const indices = await ipoService.getMarketIndices()
    console.log(`✅ Found ${indices.length} market indices`)
    
    // Test 4: Performance metrics (optional)
    try {
      console.log('⚡ Fetching performance metrics...')
      const metrics = await ipoService.getPerformanceMetrics()
      console.log('✅ Performance metrics available')
    } catch (err) {
      console.log('⚠️ Performance metrics not available (optional)')
    }
    
    console.log('🎉 Backend connection test completed successfully!')
    return {
      success: true,
      activeIPOs: activeIPOs.length,
      indices: indices.length
    }
    
  } catch (error) {
    console.error('❌ Backend connection test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Helper function to run test in development
export const runBackendTest = () => {
  if (__DEV__) {
    setTimeout(() => {
      testBackendConnection()
    }, 2000) // Wait 2 seconds after app start
  }
}