// Quick test to verify the data transformation fix
import { ipoService } from '../services/ipoService'

export const testDataFix = async () => {
  console.log('🧪 Testing data transformation fix...')
  
  try {
    // Test 1: Get active IPOs with GMP
    console.log('📊 Testing getActiveIPOsWithGMP...')
    const activeIPOs = await ipoService.getActiveIPOsWithGMP()
    console.log(`✅ Success: Found ${activeIPOs.length} active IPOs`)
    
    if (activeIPOs.length > 0) {
      const firstIPO = activeIPOs[0]
      console.log('📋 First IPO sample:', {
        id: firstIPO.id,
        name: firstIPO.name,
        status: firstIPO.status,
        hasGMP: !!firstIPO.gmp
      })
    }
    
    // Test 2: Get market indices
    console.log('📈 Testing getMarketIndices...')
    const indices = await ipoService.getMarketIndices()
    console.log(`✅ Success: Found ${indices.length} market indices`)
    
    if (indices.length > 0) {
      const firstIndex = indices[0]
      console.log('📊 First index sample:', {
        id: firstIndex.id,
        name: firstIndex.name,
        value: firstIndex.value
      })
    }
    
    console.log('🎉 All data transformation tests passed!')
    return true
    
  } catch (error) {
    console.error('❌ Data transformation test failed:', error)
    return false
  }
}

// Run test in development
if (__DEV__) {
  setTimeout(() => {
    testDataFix()
  }, 3000) // Wait 3 seconds after app start
}