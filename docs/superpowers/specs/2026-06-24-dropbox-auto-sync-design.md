# Dropbox 프로바이더 + 세션 범위 양방향 자동 동기화

**날짜:** 2026-06-24
**상태:** 설계 승인 대기 → 구현 계획(writing-plans)

## 목표

local-first + BYO-cloud 비전(앱은 에디터, 데이터는 사용자 클라우드의 파일)에서
`CloudProvider`를 "저장 위치" seam으로 키운다. 두 가지를 추가한다:

1. **Dropbox** 프로바이더 (기존 Google/OneDrive와 동형)
2. **세션 범위 양방향 자동 동기화** — 편집 시 자동 push + 앱 열 때 자동 pull

iCloud는 웹에서 직접 API가 없으므로 기존 "내보내기 → iCloud Drive 폴더 저장"
수동 경로로 남기고 문구만 명확히 한다. (진짜 매끄러운 iOS iCloud는 네이티브/
Capacitor 결정 — 이 spec 범위 밖.)

## 결정 사항 (브레인스토밍 결과)

- **자동싱크 모델 = 세션 범위.** implicit OAuth 토큰은 몇 시간 뒤 만료. 로그인한
  동안만 자동 동기화, 만료/새로고침 시 멈추고 "재연결 필요" 표시. 토큰 영속 저장
  안 함. PKCE/refresh token 흐름은 도입하지 않음(중앙서버 최소화 원칙 유지).
- **방향 = 양방향.** 편집 시 push + 앱 열 때 pull. merge는 기존 `mergeSyncData`의
  additive union(로컬에 없는 id만 추가). 같은 todo의 수정·삭제 전파는 ③(세분화
  sync 엔진) 영역이라 보류.
- **트리거 = QueryClient MutationCache 구독.** todo mutation이 흩어져 있어도 캐시
  한 곳에서 성공 이벤트를 잡아 디바운스 push. 횡단 관심사를 횡단 지점에서 처리.

## 아키텍처

```
[편집] todo mutation 성공
   → MutationCache 구독자 (Providers.tsx)
   → 디바운스 3s
   → syncEngine.push():  exportData() → activeProvider.upload(SyncData, "motivation-sync.json")
[앱 열기]
   → syncEngine.pull():  activeProvider.list() → 최신 download → importData('merge')
[로그인] SyncSettings → initiateOAuth('dropbox') → setActiveProvider(전역 싱글톤)
[만료/401] activeProvider 해제 → "재연결 필요" 표시
```

## 컴포넌트 (단위와 책임)

| 파일 | 책임 | 의존 |
|---|---|---|
| `lib/cloud/dropbox.ts` (신규) | `DropboxProvider implements CloudProvider`. upload/download/list → content.dropboxapi.com / api.dropboxapi.com. OneDrive 미러 | CloudProvider, SyncData |
| `lib/auth.ts` (변경) | `OAUTH_CONFIG.dropbox` 추가: authUrl `https://www.dropbox.com/oauth2/authorize`, scope `files.content.write files.content.read`, implicit grant(`response_type=token`) | — |
| `lib/cloud/activeProvider.ts` (신규, ~15줄) | 세션 범위 in-memory 싱글톤. `setActiveProvider/getActiveProvider/clearActiveProvider`. 영속 X | CloudProvider |
| `lib/sync-engine.ts` (신규, ~40줄) | `push()`(디바운스+in-flight 락), `pull()`, 401 시 provider 해제. exportData/importData 재사용 | sync.ts, activeProvider |
| `components/Providers.tsx` (변경) | MutationCache 구독 → todo 변경 시 `push()` 디바운스, 마운트 시 `pull()` 1회 | sync-engine |
| `components/SyncSettings.tsx` (변경) | Dropbox 탭(OneDrive 탭 미러), 로그인 시 setActiveProvider. iCloud 탭 문구 보강 | dropbox, activeProvider |

## 데이터 흐름 / 파일 모델

- 자동 동기화는 **고정 파일** `motivation-sync.json` 하나를 last-write-wins로 덮어쓴다
  (클라우드가 항상 최신 보유).
- 기존 **수동 "내보내기/백업"은 날짜별 스냅샷** 그대로 유지 — 자동 덮어쓰기가 과거
  백업을 지우지 않도록 분리. (데이터 안전, 타협 안 함)
- 동기화 대상 = todo만. `exportData`는 현재 settings를 빈 객체로 내보냄(별도 미구현).

## 에러 처리

| 상황 | 동작 |
|---|---|
| push 중 401(토큰 만료) | activeProvider 해제 → `disconnected` → "재연결 필요" 1회 표시. 재시도 큐 없음(세션 범위) |
| push 중 네트워크/5xx | provider 유지, `error` 상태. 다음 편집 때 디바운스로 자연 재시도. 무한 루프 없음 |
| 동시 push | in-flight 락 + dirty 플래그: 업로드 중이면 합치고 끝난 뒤 변경 남았으면 1회 더 |
| pull 시 provider 없음 | 조용히 skip |
| pull 중 실패 | toast 에러, 로컬 데이터 절대 안 건드림 |

**손실 방지:** pull은 `importData('merge')`만 사용(additive union) → 원격이 비어도/
깨져도 로컬 삭제 불가. `overwrite`는 자동 경로에서 절대 미사용(수동 복원 전용).

## 테스트 (vitest, `lib/cloud/__tests__` 패턴)

- `dropbox.test.ts` — `google.test.ts` 미러: fetch mock으로 upload/download/list가
  올바른 Dropbox 엔드포인트 호출·응답 파싱하는지, 401 시 throw.
- `sync-engine.test.ts` — ① 디바운스 합침(push 3연속 → 지연 후 upload 1회, fake
  timers), ② in-flight 락, ③ 401 → provider 해제. mock provider.
- activeProvider set/get은 sync-engine 테스트에 흡수.

## 범위 밖 (명시)

- ③ 세분화 충돌 해소(레코드/필드 단위 merge, tombstone, oplog)
- 토큰 영속/refresh token 흐름
- 설정(settings) 동기화 — 현재 export가 빈 객체
- iCloud 직접 API 연동(웹 불가) / 네이티브 래핑

## 미해결 기본값 (구현 시 확정)

- 디바운스 간격: 3s (편집 폭주 시 합침)
- Dropbox 토큰: 세션 메모리만. clientId(app key)는 기존 google/onedrive처럼
  localStorage 편의 저장.
