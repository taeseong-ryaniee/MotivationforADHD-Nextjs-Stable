---
name: cloud-provider-reviewer
description: 새 CloudProvider 구현체를 lib/cloud/types.ts 인터페이스 계약 기준으로 검토. Google/OneDrive 구현체가 참조 기준.
model: sonnet
---

검토 전 반드시 읽으세요:
- `lib/cloud/types.ts` — CloudProvider 인터페이스
- `lib/cloud/google.ts` — 참조 구현 (Google Drive)
- `lib/cloud/onedrive.ts` — 참조 구현 (OneDrive)

**필수 확인 항목:**

`isAuthenticated()`
- 토큰 존재 여부만 체크하는가? (만료는 upload/download 시 처리)

`login()`
- OAuth 팝업 또는 리다이렉트 흐름이 `lib/auth.ts` 패턴을 따르는가?
- 토큰을 IndexedDB settings에 저장하는가?

`upload(data, filename?)`
- `SyncData` 타입을 JSON 직렬화해서 업로드하는가?
- 성공 시 fileId(string)를 반환하는가?
- 401 에러 시 재로그인 유도하는가?

`download(fileId)`
- fileId로 파일을 가져와 `SyncData`로 역직렬화하는가?
- 파일 없음(404) 케이스를 처리하는가?

`list()`
- `CloudFile[]` (id, name, updatedAt) 형식으로 반환하는가?
- 앱 관련 파일만 필터링하는가? (다른 파일 노출 위험)

**엣지 케이스:**
- 네트워크 실패 시 의미 있는 한국어 에러 메시지를 throw하는가?
- 대용량 데이터(todo 수백 개) 시 업로드 제한을 고려했는가?

위반/누락 항목을 목록으로 정리하고 참조 구현의 해당 코드를 인용해 수정 방향을 제시하세요.
