// PAN Card validation
export const validatePAN = (pan: string): { isValid: boolean; error?: string } => {
  if (!pan) {
    return { isValid: false, error: 'PAN is required' }
  }

  const trimmedPAN = pan.trim().toUpperCase()

  if (trimmedPAN.length !== 10) {
    return { isValid: false, error: 'PAN must be 10 characters' }
  }

  // PAN format: AAAAA9999A (5 letters, 4 digits, 1 letter)
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  
  if (!panRegex.test(trimmedPAN)) {
    return { isValid: false, error: 'Invalid PAN format' }
  }

  // Fourth character indicates holder type
  const fourthChar = trimmedPAN[3]
  const validTypes = ['P', 'C', 'H', 'F', 'A', 'T', 'B', 'L', 'J', 'G']
  
  if (!validTypes.includes(fourthChar)) {
    return { isValid: false, error: 'Invalid PAN type' }
  }

  return { isValid: true }
}

// Format PAN as user types (uppercase)
export const formatPANInput = (input: string): string => {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)
}

// Email validation
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' }
  }

  return { isValid: true }
}

// Phone number validation (Indian)
export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' }
  }

  // Remove spaces and dashes
  const cleanPhone = phone.replace(/[\s-]/g, '')
  
  // Indian mobile: 10 digits starting with 6-9
  const phoneRegex = /^[6-9]\d{9}$/
  
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'Invalid phone number' }
  }

  return { isValid: true }
}

// Application number validation
export const validateApplicationNumber = (appNum: string): { isValid: boolean; error?: string } => {
  if (!appNum) {
    return { isValid: false, error: 'Application number is required' }
  }

  // Basic validation - alphanumeric, 8-20 characters
  const appNumRegex = /^[A-Z0-9]{8,20}$/i
  
  if (!appNumRegex.test(appNum)) {
    return { isValid: false, error: 'Invalid application number' }
  }

  return { isValid: true }
}

// Demat account validation
export const validateDematAccount = (demat: string): { isValid: boolean; error?: string } => {
  if (!demat) {
    return { isValid: false, error: 'Demat account is required' }
  }

  // NSDL: IN followed by 14 digits, CDSL: 16 digits
  const nsdlRegex = /^IN\d{14}$/
  const cdslRegex = /^\d{16}$/
  
  if (!nsdlRegex.test(demat) && !cdslRegex.test(demat)) {
    return { isValid: false, error: 'Invalid Demat account number' }
  }

  return { isValid: true }
}
