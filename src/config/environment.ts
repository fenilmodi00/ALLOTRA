// Environment configuration for different platforms and scenarios

export const getApiBaseUrl = () => {
  // Check if we have an environment variable first
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL
  }

  // Platform-specific defaults
  const Platform = require('react-native').Platform
  
  if (Platform.OS === 'android') {
    // For Android emulator, use 10.0.2.2 to access host machine
    return 'http://10.0.2.2:8080/api/v1'
  } else if (Platform.OS === 'ios') {
    // For iOS simulator, localhost works
    return 'http://localhost:8080/api/v1'
  } else {
    // For web or other platforms
    return 'http://localhost:8080/api/v1'
  }
}

export const API_CONFIG = {
  baseURL: getApiBaseUrl(),
  timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '10000', 10),
  retryAttempts: 3,
  retryDelay: 1000,
}

// Development helpers
export const DEV_CONFIG = {
  enableNetworkLogging: __DEV__,
  enablePerformanceMetrics: __DEV__,
  enableCacheWarmup: true,
}

// Network troubleshooting info
export const NETWORK_TROUBLESHOOTING = {
  android: {
    emulator: '10.0.2.2:8080 (maps to host localhost)',
    device: 'Use your machine IP address (e.g., 192.168.0.103:8080)',
  },
  ios: {
    simulator: 'localhost:8080 should work',
    device: 'Use your machine IP address (e.g., 192.168.0.103:8080)',
  },
  web: {
    browser: 'localhost:8080 should work',
  }
}

export const logNetworkInfo = () => {
  if (__DEV__) {
    console.log('🌐 Network Configuration:')
    console.log('   API Base URL:', API_CONFIG.baseURL)
    console.log('   Timeout:', API_CONFIG.timeout + 'ms')
    console.log('   Platform:', require('react-native').Platform.OS)
    console.log('')
    console.log('💡 Troubleshooting:')
    Object.entries(NETWORK_TROUBLESHOOTING).forEach(([platform, config]) => {
      console.log(`   ${platform.toUpperCase()}:`)
      Object.entries(config).forEach(([type, url]) => {
        console.log(`     ${type}: ${url}`)
      })
    })
  }
}