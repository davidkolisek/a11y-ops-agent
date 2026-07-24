import { createHttpScanClient } from './httpScanClient'
import { createMockScanClient } from './mockScanClient'
import type { ScanClient } from './types'

/**
 * Default: HTTP scan API (Netlify Function in production / `netlify dev`).
 * Set `VITE_USE_MOCK_SCAN=true` for offline UI work without the function.
 */
export function createScanClient(): ScanClient {
  if (import.meta.env.VITE_USE_MOCK_SCAN === 'true') {
    return createMockScanClient()
  }
  return createHttpScanClient()
}
