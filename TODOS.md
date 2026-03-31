# TODOS

## Phase 2: 서버리스 푸시 알림 대안 조사
- **무엇:** 서버 없이 PWA에서 신뢰할 수 있는 예약 알림 구현 방법 조사
- **왜:** 클라이언트 setTimeout은 탭 닫으면 사라짐. ADHD 사용자에게 아침 알림은 가장 가치 있는 기능이지만 현재 기술적 한계 존재.
- **조사 대상:**
  - Chrome Notification Triggers API (origin trial)
  - Web Push + VAPID (서버 최소화 가능?)
  - Background Sync / Periodic Background Sync
- **컨텍스트:** Phase 1 eng review에서 setTimeout 기반 알림을 제거하기로 결정. 서버를 쓰지 않는 제약 하에서 가장 현실적인 대안 필요.
- **Depends on:** Phase 1 (StartScreen + UX) 완료 후
- **Added:** 2026-03-30
