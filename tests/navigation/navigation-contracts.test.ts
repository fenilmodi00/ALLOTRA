import { describe, expectTypeOf, it } from 'vitest'
import type { RootStackParamList } from '../../src/types/navigation.types'

describe('navigation contracts', () => {
  it('requires ipoId + ipoName for IPODetails', () => {
    type Params = RootStackParamList['IPODetails']
    expectTypeOf<Params>().toEqualTypeOf<{ ipoId: string; ipoName: string }>()
  })
})
