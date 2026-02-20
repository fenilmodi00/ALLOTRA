import { APIResponse } from '../types'
import { API_CONFIG } from '../config/environment'

// Custom error class for API errors
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// Request options type
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: Record<string, unknown>
  headers?: Record<string, string>
  timeout?: number
}

// Create abort controller with timeout
const createAbortController = (timeout: number): AbortController => {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), timeout)
  return controller
}

// Main API client
export const apiClient = {
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<APIResponse<T>> {
    const { method = 'GET', body, headers = {}, timeout = API_CONFIG.timeout } = options
    const controller = createAbortController(timeout)

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      signal: controller.signal,
    }

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body)
    }

    const url = `${API_CONFIG.baseURL}${endpoint}`
    
    if (__DEV__) {
      console.log(`🌐 API Request: ${method} ${url}`)
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new APIError(
          data.message || 'Request failed',
          response.status,
          data.code
        )
      }

      if (__DEV__) {
        console.log(`✅ API Response: ${method} ${url} - ${response.status}`)
      }

      return { success: true, data }
    } catch (error) {
      if (error instanceof APIError) throw error
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new APIError('Request timeout', 408, 'TIMEOUT')
        }
        
        // Network error - provide helpful debugging info
        if (error.message.includes('Network request failed')) {
          console.error(`❌ Network Error: ${method} ${url}`)
          console.error('💡 Check if backend is running and accessible')
          console.error('💡 Current API URL:', API_CONFIG.baseURL)
        }
        
        throw new APIError(error.message, 500, 'NETWORK_ERROR')
      }
      
      throw new APIError('Unknown error occurred', 500, 'UNKNOWN')
    }
  },

  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  },

  post<T>(endpoint: string, body: Record<string, unknown>, options?: Omit<RequestOptions, 'method'>) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body })
  },

  put<T>(endpoint: string, body: Record<string, unknown>, options?: Omit<RequestOptions, 'method'>) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body })
  },

  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  },
}
