import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../src/config/environment', () => ({
  API_CONFIG: {
    baseURL: 'http://localhost:8080/api/v1',
    timeout: 100,
    retryAttempts: 3,
    retryDelay: 1,
    retryBackoffMultiplier: 2,
    maxRetryDelay: 10,
  },
}))

describe('apiClient retry', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('retries transient 5xx then succeeds', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({ message: 'busy' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [], success: true }),
      })

    vi.stubGlobal('fetch', fetchMock)
    const { apiClient } = await import('../../src/services/api')
    const result = await apiClient.get('/ipos')

    expect(result.success).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
