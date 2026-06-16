---
name: pwa-checklist
description: PWA 배포 전 manifest, 서비스 워커, 오프라인 기능 체크리스트. 코드 변경 후 PWA 회귀 방지.
---

배포 전 PWA 체크리스트:

**Manifest (`public/manifest.webmanifest`)**
- [ ] `start_url` 설정 (보통 `/`)
- [ ] `display: "standalone"` 설정 (홈화면 추가 시 앱처럼 보임)
- [ ] 192x192, 512x512 아이콘 존재 (`public/` 하위)
- [ ] `theme_color`가 DESIGN.md 기준: `#f59e0b` (amber) 또는 `#0a0a0a` (zinc-950)
- [ ] `background_color` 설정
- [ ] `name`, `short_name` 한국어 적용 ("산만이의 아침")

**서비스 워커 (`components/ServiceWorkerRegister.tsx`)**
- [ ] 등록 성공/실패 로그 있는가?
- [ ] 캐시 전략이 `public/content/ko.json` 파일을 포함하는가?
- [ ] 서비스 워커 업데이트 시 사용자에게 새로고침 안내하는가?

**오프라인 폴백 (`public/offline.html`)**
- [ ] 오프라인 시 친절한 한국어 메시지 표시
- [ ] IndexedDB 데이터는 오프라인에서도 접근 가능 (Dexie는 브라우저 로컬이므로 OK)
- [ ] 네트워크 필요한 기능(클라우드 동기화)은 오프라인 시 비활성화 UI

**테스트 방법:**
```
1. bun dev 실행
2. Chrome DevTools → Application → Service Workers
3. "Offline" 체크박스 활성화
4. 새로고침 → 오프라인 폴백 확인
5. Application → Manifest → "Add to home screen" 검증
```

**Lighthouse 기준 (기존 리포트: lighthouse-report-final.report.html):**
- PWA 점수 유지 여부 확인
- `bun run build && bun start` 후 Lighthouse 재실행으로 비교

**주의:** 서비스 워커 캐시가 오래된 콘텐츠를 서빙하는 경우
→ `content-seed.ts` 버전 업데이트 + 서비스 워커 캐시 버전 bump
