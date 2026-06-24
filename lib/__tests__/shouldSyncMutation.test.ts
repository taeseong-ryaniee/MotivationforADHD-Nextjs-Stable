import { describe, it, expect } from 'vitest'
import { shouldSyncMutation } from '../sync-trigger'

const ev = (over: Record<string, unknown>) => ({
  type: 'updated',
  mutation: { options: { mutationKey: ['todos'] }, state: { status: 'success' } },
  ...over,
}) as never

describe('shouldSyncMutation', () => {
  it('true for a successful todo mutation update', () => {
    expect(shouldSyncMutation(ev({}))).toBe(true)
  })
  it('false when status is not success', () => {
    expect(shouldSyncMutation(ev({ mutation: { options: { mutationKey: ['todos'] }, state: { status: 'pending' } } }))).toBe(false)
  })
  it('false for non-todo mutation keys', () => {
    expect(shouldSyncMutation(ev({ mutation: { options: { mutationKey: ['other'] }, state: { status: 'success' } } }))).toBe(false)
  })
  it('false for events without a mutationKey', () => {
    expect(shouldSyncMutation(ev({ mutation: { options: {}, state: { status: 'success' } } }))).toBe(false)
  })
})
