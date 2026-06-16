---
name: architecture-auditor
description: CLAUDE.md 아키텍처 규칙 준수 검사. 특히 lib/db.ts 직접 호출 금지, TanStack Query 우회 금지.
model: sonnet
---

CLAUDE.md의 아키텍처 규칙에 따라 다음을 검사하세요.

**금지 패턴:**
1. `components/` 또는 신규 `hooks/` 파일에서 `lib/db` 직접 import
2. `components/` 파일에서 `useTodoStore`의 DB 관련 메서드(`saveTodo`, `deleteTodo`, `clearAllTodos` 등) 직접 호출
3. TanStack Query 캐시를 우회한 직접 DB 쓰기 (invalidateQueries 없는 DB 조작)
4. `StorageManager.getAdapter()`를 컴포넌트에서 직접 호출

**허용 예외:**
- `lib/store.ts` — 기존 레거시 (마이그레이션 대상, 현재는 허용)
- `lib/content-seed.ts` — 초기 시드 전용
- `hooks/useTodos.ts`, `hooks/useContent.ts` — 공식 TanStack Query 훅

**올바른 데이터 흐름:**
```
Component → useTodos/useContent 훅 → lib/db.ts (훅 내부에서만)
Component → useTodoStore 액션 (UI 상태만, DB 조작은 지양)
```

위반 발견 시 파일:줄번호와 권장 대안(`hooks/useTodos.ts`의 어떤 훅을 써야 하는지)을 제시하세요.
