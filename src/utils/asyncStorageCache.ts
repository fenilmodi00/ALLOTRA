/**
 * Lightweight in-memory cache for data that should persist across
 * component re-mounts within the same JS session.
 *
 * NOTE: This is a runtime-only cache — data is lost when the app process
 * is killed.  For cross-session persistence add @react-native-async-storage/
 * async-storage and swap cacheWrite/cacheReadStale to use it.
 */

interface CacheEntry<T> {
  data: T
  cachedAt: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const store = new Map<string, CacheEntry<any>>()

/**
 * Write a value to the in-memory cache.
 */
export function cacheWrite<T>(key: string, data: T): void {
  store.set(key, { data, cachedAt: Date.now() })
}

/**
 * Read a cached value.  Returns `null` when absent or older than `maxAgeMs`
 * (default: 5 minutes).
 */
export function cacheRead<T>(key: string, maxAgeMs = 5 * 60 * 1000): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined
  if (!entry) return null
  if (Date.now() - entry.cachedAt > maxAgeMs) return null
  return entry.data
}

/**
 * Read a cached value regardless of age — returns whatever was last written,
 * or `null` if nothing has been written yet.  Use this when you want to
 * show stale data while a fresh network request is in flight.
 */
export function cacheReadStale<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined
  return entry ? entry.data : null
}

// Shared key constants used across hooks
export const CACHE_KEYS = {
  MARKET_INDICES: 'market_indices',
  IPO_ALL_FEED: 'ipo_all_feed',
  IPO_ACTIVE_FEED: 'ipo_active_feed',
  IPO_UPCOMING: 'ipo_upcoming',
  IPO_CLOSED: 'ipo_closed',
  IPO_LISTED: 'ipo_listed',
} as const
