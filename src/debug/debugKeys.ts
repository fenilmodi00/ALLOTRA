// Debug utility to check for duplicate keys
export const checkForDuplicateKeys = (items: any[], keyExtractor: (item: any, index: number) => string, context: string) => {
  if (!__DEV__) return
  
  const keys = items.map(keyExtractor)
  const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index)
  
  if (duplicates.length > 0) {
    console.warn(`🚨 Duplicate keys found in ${context}:`, duplicates)
  } else {
    console.log(`✅ No duplicate keys in ${context} (${keys.length} items)`)
  }
}

// Debug utility to log key generation
export const logKeyGeneration = (filter: string, ipos: any[]) => {
  if (!__DEV__) return
  
  const keys = ipos.slice(0, 3).map((ipo, index) => {
    const uniqueId = ipo.id || ipo.name?.replace(/\s+/g, '') || `unknown-${index}`
    return `${filter}-${uniqueId}-${index}`
  })
  console.log(`🔑 Sample keys for ${filter}:`, keys)
  
  // Check for potential duplicates in the full list
  const allKeys = ipos.map((ipo, index) => {
    const uniqueId = ipo.id || ipo.name?.replace(/\s+/g, '') || `unknown-${index}`
    return `${filter}-${uniqueId}-${index}`
  })
  
  const duplicates = allKeys.filter((key, index) => allKeys.indexOf(key) !== index)
  if (duplicates.length > 0) {
    console.warn(`🚨 Potential duplicate keys in ${filter}:`, duplicates)
  }
}

// Generate unique key for IPO items
export const generateUniqueIPOKey = (ipo: any, index: number, prefix: string = 'ipo'): string => {
  const uniqueId = ipo.id || ipo.name?.replace(/\s+/g, '') || `unknown-${index}`
  const timestamp = Date.now()
  return `${prefix}-${uniqueId}-${index}-${timestamp}`
}