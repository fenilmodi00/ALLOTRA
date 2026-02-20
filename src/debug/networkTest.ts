import { API_CONFIG, logNetworkInfo } from '../config/environment'

// Create abort controller with timeout (React Native compatible)
const createAbortController = (timeout: number): AbortController => {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), timeout)
  return controller
}

// Network connectivity test utility
export const testNetworkConnection = async () => {
  console.log('🔗 Testing network connection...')
  logNetworkInfo()
  
  try {
    // Test 1: Basic connectivity
    console.log('🌐 Testing basic connectivity...')
    const controller = createAbortController(API_CONFIG.timeout)
    
    const response = await fetch(`${API_CONFIG.baseURL}/market/indices`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('✅ Network connection successful!')
    console.log('📊 Sample data received:', {
      success: data.success,
      dataCount: data.data?.length || 0,
      firstItem: data.data?.[0]?.name || 'N/A'
    })
    
    return {
      success: true,
      message: 'Network connection successful',
      data: data
    }
    
  } catch (error) {
    console.error('❌ Network connection failed:', error)
    
    // Provide helpful debugging info
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      console.log('💡 Troubleshooting tips:')
      console.log('   - Check if backend is running on', API_CONFIG.baseURL)
      console.log('   - Verify device/emulator can reach host machine')
      console.log('   - For Android emulator, try 10.0.2.2:8080 instead of localhost')
      console.log('   - For iOS simulator, localhost should work')
      console.log('   - For physical device, use machine IP address')
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown network error',
      error: error
    }
  }
}

// Quick test function for development
export const runNetworkTest = () => {
  if (__DEV__) {
    setTimeout(() => {
      testNetworkConnection()
    }, 1000)
  }
}