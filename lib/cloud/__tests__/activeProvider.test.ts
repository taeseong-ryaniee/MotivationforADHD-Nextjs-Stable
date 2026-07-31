import { describe, it, expect, beforeEach } from 'vitest'
import { setActiveProvider, getActiveProvider, clearActiveProvider } from '../activeProvider'
import type { CloudProvider } from '../types'

const fake = { name: 'Fake', type: 'dropbox' } as unknown as CloudProvider

describe('activeProvider singleton', () => {
  beforeEach(() => clearActiveProvider())

  it('starts null', () => {
    expect(getActiveProvider()).toBeNull()
  })

  it('stores and clears the active provider', () => {
    setActiveProvider(fake)
    expect(getActiveProvider()).toBe(fake)
    clearActiveProvider()
    expect(getActiveProvider()).toBeNull()
  })
})
