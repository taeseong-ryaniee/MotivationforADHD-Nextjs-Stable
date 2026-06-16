---
name: morning-flow-trace
description: 아침 시작 흐름(StartScreen → 루틴 생성 → 오늘 할 일)의 데이터 경로 추적 및 버그 위치 파악
---

아침 흐름의 전체 데이터 경로:

```
StartScreen (components/feature/StartScreen.tsx)
  ↓ 사용자 이름/날짜 표시
  ↓ [시작하기 클릭] → 라우터 이동

MainScreen (components/feature/MainScreen.tsx)
  ↓ useContent('ko') → IndexedDB content 조회
  ↓   └ 없으면 content-seed.ts seedContent() 실행
  ↓ useDailyTodo() → todoKeys.byDate(today) 쿼리
  ↓ SpecialEventInput → onUpdateSpecialEvent (Zustand)
  ↓ [루틴 만들기 클릭] → useTodoStore.createDailyTodo()
  ↓   └ lib/db.ts saveTodo() 직접 호출 (레거시)
  ↓   └ queryClient.invalidateQueries 필요

TodayTodoView (components/feature/TodayTodoView.tsx)
  ↓ useDailyTodo() 재조회 → 캐시 히트 또는 새 요청
  ↓ useSaveTodo() mutation으로 편집 저장
```

**버그 위치 파악 질문:**

"콘텐츠가 안 보여요"
→ `useContent()` 반환값 확인
→ `lib/content-seed.ts`의 `seedContent()` 에러 여부
→ IndexedDB content 테이블에 데이터 존재 여부

"루틴 생성 후 화면이 안 바뀌어요"
→ `createDailyTodo()` 후 `queryClient.invalidateQueries(todoKeys.byDate(today))` 호출 여부
→ TanStack Query Devtools에서 해당 쿼리 상태 확인

"오늘 루틴이 내일도 보여요" / "날짜 판단이 틀려요"
→ `getTodayDateString()`의 `ko-KR` locale 포맷 vs `todoKeys.byDate()` 키 포맷 일치 여부
→ 두 곳에서 같은 날짜 문자열 형식을 사용하는지 확인

"특별 이벤트가 반영 안 돼요"
→ Zustand `specialEvent` 상태가 `createDailyTodo()` 호출 시점에 올바른 값인지 확인
→ `useTodoStore.getState().specialEvent` 값 로깅

**핵심 파일:**
- `hooks/useTodos.ts` — `useDailyTodo`, `useSaveTodo`
- `hooks/useContent.ts` — `useContent`
- `lib/store.ts` — `createDailyTodo` 액션
- `lib/content-seed.ts` — 초기 콘텐츠 시드
