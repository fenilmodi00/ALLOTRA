import { ipoService } from '../services/ipoService'

export const ipoRepository = {
  getActiveFeed: () => ipoService.getActiveIPOsWithGMP(),
  getById: (id: string, includeGMP = true) => {
    if (includeGMP) {
      return ipoService.getIPOByIdWithGMP(id)
    }

    return ipoService.getIPOById(id)
  },
}
