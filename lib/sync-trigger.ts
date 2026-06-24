import type { MutationCacheNotifyEvent } from '@tanstack/react-query'

// MutationCache 이벤트가 "성공한 todo mutation"인지 판별. todo 쓰기는 모두
// mutationKey ['todos', ...]를 달고 있다(hooks/useTodos.ts).
export function shouldSyncMutation(event: MutationCacheNotifyEvent): boolean {
  if (event.type !== 'updated') return false
  const key = event.mutation.options.mutationKey
  if (!Array.isArray(key) || key[0] !== 'todos') return false
  return event.mutation.state.status === 'success'
}
