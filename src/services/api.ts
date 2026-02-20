import { APIResponse } from '../types'
import { API_CONFIG } from '../config/environment'
import { devError, devLog } from '../utils/logger'

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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const isRetryableStatusCode = (statusCode: number) => statusCode >= 500 || statusCode === 429

const isRetryableError = (error: APIError) => {
  if (isRetryableStatusCode(error.statusCode)) {
    return true
  }

  return error.code === 'TIMEOUT' || error.code === 'NETWORK_ERROR'
}

const toAPIError = (error: unknown, method: string, url: string): APIError => {
  if (error instanceof APIError) {
    return error
  }

  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return new APIError('Request timeout', 408, 'TIMEOUT')
    }

    if (error.message.includes('Network request failed')) {
      devError(`❌ Network Error: ${method} ${url}`)
      devError('💡 Check if backend is running and accessible')
      devError('💡 Current API URL:', API_CONFIG.baseURL)
    }

    return new APIError(error.message, 500, 'NETWORK_ERROR')
  }

  return new APIError('Unknown error occurred', 500, 'UNKNOWN')
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
    const url = `${API_CONFIG.baseURL}${endpoint}`
    
    devLog(`🌐 API Request: ${method} ${url}`)

    for (let attempt = 0; attempt <= API_CONFIG.retryAttempts; attempt++) {
      try {
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

        const response = await fetch(url, config)
        const data = await response.json()

        if (!response.ok) {
          throw new APIError(data.message || 'Request failed', response.status, data.code)
        }

        devLog(`✅ API Response: ${method} ${url} - ${response.status}`)

        return { success: true, data }
      } catch (error) {
        const normalizedError = toAPIError(error, method, url)
        const hasAttemptsLeft = attempt < API_CONFIG.retryAttempts

        if (hasAttemptsLeft && isRetryableError(normalizedError)) {
          const nextDelay = API_CONFIG.retryDelay * Math.pow(API_CONFIG.retryBackoffMultiplier, attempt)
          const boundedDelay = Math.min(nextDelay, API_CONFIG.maxRetryDelay)
          await delay(boundedDelay)
          continue
        }

        throw normalizedError
      }
    }

    throw new APIError('Retry attempts exhausted', 500, 'RETRY_EXHAUSTED')
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
