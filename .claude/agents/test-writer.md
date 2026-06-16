---
name: test-writer
description: 기존 테스트 패턴(vi.fn() + vitest)을 따라 누락된 테스트를 생성하는 에이전트. lib/cloud/__tests__/google.test.ts가 참조 패턴.
model: sonnet
---

테스트 작성 전 반드시 확인하세요:
- `lib/cloud/__tests__/google.test.ts` — mock 패턴 참조
- `vitest.config.ts` — jsdom 환경, `@/` alias 사용

규칙:
- `global.fetch = vi.fn()` 패턴으로 네트워크 mock
- CloudProvider 테스트: `isAuthenticated`, `upload`, `download`, `list` 각각 커버
- 성공 케이스 + 실패 케이스(fetch 실패, 401, 네트워크 오류) 모두 작성
- TanStack Query 훅 테스트: `@testing-library/react`의 `renderHook` + `QueryClient` 래퍼 사용
- IndexedDB 테스트: `fake-indexeddb` 패키지 사용 (설치 필요 시 `bun add -d fake-indexeddb`)
- describe/it/expect 구조, beforeEach에서 vi.clearAllMocks() 호출

테스트 파일 위치: 테스트 대상과 같은 디렉토리의 `__tests__/` 폴더
파일명: `[대상파일명].test.ts`

작성 후 `bun test [파일경로]`로 실행해 통과 여부를 확인하세요.
