const PAN_REGEX = /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g

export const redactSensitive = (value: unknown): string => {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value)
  return (serialized ?? String(value)).replace(PAN_REGEX, '[REDACTED]')
}

export const devLog = (message: string, payload?: unknown) => {
  if (!__DEV__) return
  if (payload === undefined) {
    console.log(message)
    return
  }

  console.log(message, redactSensitive(payload))
}

export const devError = (message: string, payload?: unknown) => {
  if (!__DEV__) return
  if (payload === undefined) {
    console.error(message)
    return
  }

  console.error(message, redactSensitive(payload))
}
