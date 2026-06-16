---
name: new-cloud-provider
description: 새 CloudProvider 구현 시 인터페이스 체크리스트와 구현 순서 가이드
---

새 CloudProvider 추가 전 반드시 읽으세요:
1. `lib/cloud/types.ts` — CloudProvider 인터페이스 전체
2. `lib/cloud/google.ts` — OAuth 기반 참조 구현
3. `lib/auth.ts` — OAuth 팝업 흐름 설정

**구현 순서:**

1. `lib/cloud/[name].ts` 생성
   - `CloudProvider` 인터페이스 모두 구현
   - `isAuthenticated()`, `login()`, `logout()`, `upload()`, `download()`, `list()`

2. `lib/cloud/types.ts` 업데이트
   - `CloudProviderType` 유니온에 새 타입 추가

3. `lib/auth.ts` 업데이트 (OAuth 사용 시)
   - 새 OAuth 클라이언트 ID/Secret 환경변수 추가

4. `app/settings/page.tsx` 업데이트
   - UI에 새 프로바이더 선택 옵션 추가

5. `lib/cloud/__tests__/[name].test.ts` 테스트 작성
   - `test-writer` 에이전트 활용

6. `cloud-provider-reviewer` 에이전트로 최종 검토

**OAuth 콜백 처리:**
- 콜백 URL: `/oauth/callback`
- 처리 파일: `app/oauth/callback/page.tsx`
- 토큰 저장: IndexedDB `settings` 테이블

**환경변수 패턴 (`.env.local`):**
```
NEXT_PUBLIC_[NAME]_CLIENT_ID=
[NAME]_CLIENT_SECRET=
```
