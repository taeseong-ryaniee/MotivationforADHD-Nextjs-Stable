import type { CloudProvider } from './types'

// ponytail: 세션 범위 in-memory 싱글톤. 토큰 영속은 의도적으로 안 함(implicit OAuth,
// 만료 시 재로그인). 영속이 필요해지면 여기에 sessionStorage 백업을 추가한다.
let active: CloudProvider | null = null

export function setActiveProvider(provider: CloudProvider): void {
  active = provider
}

export function getActiveProvider(): CloudProvider | null {
  return active
}

export function clearActiveProvider(): void {
  active = null
}
