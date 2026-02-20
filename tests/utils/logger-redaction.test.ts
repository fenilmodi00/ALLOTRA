import { describe, expect, it } from 'vitest'
import { redactSensitive } from '../../src/utils/logger'

describe('redactSensitive', () => {
  it('redacts PAN-like values', () => {
    const output = redactSensitive({ pan: 'ABCDE1234F' })
    expect(output).toContain('[REDACTED]')
    expect(output).not.toContain('ABCDE1234F')
  })
})
