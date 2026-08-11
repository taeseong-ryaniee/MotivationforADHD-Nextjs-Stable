import { describe, it, expect } from 'vitest'
import { shouldShowPrompt, PWA_REPROMPT_INTERVAL_MS } from '../pwa-utils'

const NOW = 1_800_000_000_000 // fixed instant; do not call Date.now() in tests

describe('shouldShowPrompt', () => {
  it('shows when never dismissed', () => {
    expect(shouldShowPrompt(null, NOW)).toBe(true)
  })

  it('hides right after dismissal', () => {
    expect(shouldShowPrompt(NOW, NOW)).toBe(false)
  })

  it('shows again once exactly the reprompt interval has elapsed (boundary inclusive)', () => {
    expect(shouldShowPrompt(NOW - PWA_REPROMPT_INTERVAL_MS, NOW)).toBe(true)
  })

  it('treats a corrupted (NaN) dismissedAt as never dismissed', () => {
    expect(shouldShowPrompt(Number.NaN, NOW)).toBe(true)
  })
})
