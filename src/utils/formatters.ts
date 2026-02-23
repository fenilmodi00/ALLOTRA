// Currency formatter for Indian Rupees
export const formatCurrency = (amount: number, showDecimal = false): string => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimal ? 2 : 0,
    maximumFractionDigits: showDecimal ? 2 : 0,
  })
  return formatter.format(amount)
}

// Format large numbers with Indian notation (lakhs, crores)
export const formatIndianNumber = (num: number): string => {
  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(2)} Cr`
  }
  if (num >= 100000) {
    return `${(num / 100000).toFixed(2)} L`
  }
  return new Intl.NumberFormat('en-IN').format(num)
}

// Format percentage with sign
export const formatPercentage = (value: number, decimals = 2): string => {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

// Format price change
export const formatPriceChange = (change: number, decimals = 2): string => {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(decimals)}`
}

// Format date to readable string
export const formatDate = (dateString: string, format: 'short' | 'long' | 'relative' = 'short'): string => {
  const date = new Date(dateString)
  
  if (format === 'relative') {
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`
  }
  
  const options: Intl.DateTimeFormatOptions = format === 'long' 
    ? { day: 'numeric', month: 'long', year: 'numeric' }
    : { day: 'numeric', month: 'short', year: 'numeric' }
  
  return date.toLocaleDateString('en-IN', options)
}

// Format IPO date range
export const formatIPODateRange = (openDate: string, closeDate: string): string => {
  const open = new Date(openDate)
  const close = new Date(closeDate)
  
  const openStr = open.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  const closeStr = close.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  
  return `${openStr} - ${closeStr}`
}

// Format price range
export const formatPriceRange = (min: number, max: number): string => {
  if (min === max) return formatCurrency(min)
  return `${formatCurrency(min)} - ${formatCurrency(max)}`
}

// Mask PAN for display (show only last 4)
export const maskPAN = (pan: string): string => {
  if (pan.length !== 10) return pan
  return `XXXXXX${pan.slice(-4)}`
}

// Format lot size with shares
export const formatLotSize = (lotSize: number, priceMax: number): string => {
  const minInvestment = lotSize * priceMax
  return `${lotSize} shares (${formatCurrency(minInvestment)})`
}
// Format GMP value with sign
export const formatGMP = (gmpValue?: number): string => {
  if (gmpValue === undefined || gmpValue === null) return 'No GMP'
  if (gmpValue === 0) return 'At Par'
  
  const sign = gmpValue > 0 ? '+' : ''
  return `${sign}${formatCurrency(gmpValue)}`
}

// Format subscription status
export const formatSubscriptionStatus = (status?: string): string => {
  if (!status) return 'Not available'
  
  // Extract multiplier if present (e.g., "2.5x subscribed" -> "2.5x")
  const multiplierMatch = status.match(/([\d.]+)x/i)
  if (multiplierMatch) {
    const multiplier = parseFloat(multiplierMatch[1])
    return `${multiplier}x Subscribed`
  }
  
  return status
}

// Format issue size (handles string values like "₹1000 Cr")
export const formatIssueSize = (size?: string): string => {
  if (!size) return 'Not available'
  
  // If it already contains currency symbol and unit, return as is
  if (size.includes('₹') || size.includes('Cr') || size.includes('crore')) {
    return size
  }
  
  // Try to parse numeric value and format
  const numMatch = size.match(/[\d,]+/)
  if (numMatch) {
    const value = parseFloat(numMatch[0].replace(/,/g, ''))
    return formatIndianNumber(value)
  }
  
  return size
}

// Get status color and info
export const getStatusInfo = (status: string) => {
  const statusUpper = status.toUpperCase()
  
  switch (statusUpper) {
    case 'ACTIVE':
    case 'ONGOING':
      return { color: '#10B981', text: 'Active', bgColor: '#D1FAE5' }
    case 'LIVE':
      return { color: '#10B981', text: 'Live', bgColor: '#D1FAE5' }
    case 'UPCOMING':
      return { color: '#3B82F6', text: 'Upcoming', bgColor: '#DBEAFE' }
    case 'CLOSED':
      return { color: '#F59E0B', text: 'Closed', bgColor: '#FEF3C7' }
    case 'LISTED':
      return { color: '#8B5CF6', text: 'Listed', bgColor: '#EDE9FE' }
    case 'UNKNOWN':
      return { color: '#6B7280', text: 'Unknown', bgColor: '#F3F4F6' }
    default:
      return { color: '#6B7280', text: status, bgColor: '#F3F4F6' }
  }
}

// Format time remaining until IPO closes
export const formatTimeRemaining = (endDate?: string): string => {
  if (!endDate) return 'Unknown'
  
  try {
    const end = new Date(endDate)
    const now = new Date()
    const diffMs = end.getTime() - now.getTime()
    
    if (diffMs <= 0) return 'Closed'
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h ${minutes}m remaining`
    return `${minutes}m remaining`
  } catch {
    return 'Invalid date'
  }
}
