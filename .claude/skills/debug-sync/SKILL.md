---
name: debug-sync
description: 클라우드 동기화 문제 체계적 디버깅 — OAuth 토큰, S3, Google Drive, OneDrive 각 레이어별 접근
---

동기화 버그 디버깅 순서:

**1단계: 인증 상태 확인**
- `lib/auth.ts`에서 OAuth 팝업 흐름 코드 읽기
- `app/oauth/callback/page.tsx`에서 토큰 저장 코드 확인
- 브라우저 DevTools → Application → IndexedDB → MotivationForADHD → settings 테이블에서 토큰 키 직접 확인

**2단계: CloudProvider 격리 테스트**
- 해당 프로바이더 파일 읽기: `lib/cloud/google.ts` 또는 `lib/cloud/onedrive.ts`
- 관련 테스트 실행: `bun test google` 또는 `bun test onedrive`
- 실패하는 메서드(upload/download/list/isAuthenticated) 특정

**3단계: Zustand 스토어 추적**
- `lib/store.ts`에서 해당 액션 찾기 (uploadToS3, downloadFromS3 등)
- TanStack Query Devtools에서 관련 쿼리 캐시 상태 확인
- DB 조작 후 `queryClient.invalidateQueries` 호출 여부 확인

**4단계: StorageAdapter 확인**
- `lib/storage/StorageManager.ts`로 현재 활성 어댑터 확인
- `lib/storage/adapters/LocalDexieAdapter.ts`의 `sync()` 메서드 실행 경로 추적

**S3 전용 디버깅:**
- `.env.local`에 `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME` 존재 여부
- `lib/sync.ts`의 `uploadToS3`, `downloadFromS3` 함수에서 에러 메시지 확인

**공통 원인 TOP 3:**
1. OAuth 토큰 만료 → `isAuthenticated()` false인데 업로드 시도
2. CORS 설정 누락 → S3 버킷 CORS 정책 확인
3. 파일명 충돌 → `list()` 후 중복 파일 처리 로직 확인
