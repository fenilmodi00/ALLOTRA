import { ipoService } from '../services/ipoService'
import type { AllotmentResult } from '../types'

export const ipoRepository = {
  // V2: Optimized feed endpoint with pagination support
  getFeed: (status?: string, limit?: number, offset?: number) => 
    ipoService.getFeedV2({ status, limit, offset }),
  
  // V2: Detail always includes GMP (no waterfall)
  getById: (id: string, _includeGMP = true) => 
    ipoService.getIPOByIdWithGMP(id),
    
  // V2: Optimized allotment check
  checkAllotment: (ipoId: string, pan: string): Promise<AllotmentResult> =>
    ipoService.checkAllotmentV2(ipoId, pan),
}
