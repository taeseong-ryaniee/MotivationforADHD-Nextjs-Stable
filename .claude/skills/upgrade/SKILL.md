---
name: upgrade
description: 라이브러리 업그레이드 + 마이그레이션 가이드. /upgrade [패키지명] 으로 호출. 현재 버전 확인 → 공식 코드모드 실행 → 수동 변경 항목 리포트.
---

## 업그레이드 절차

인자로 받은 패키지명을 기준으로 다음 순서로 진행하세요.

### 1단계: 현재 상태 파악
```bash
# 현재 버전 확인
cat package.json | grep -A1 '"[패키지명]"'

# 업데이트 가능 버전 확인
bun outdated | grep [패키지명]
```

### 2단계: 공식 코드모드 실행 (있는 경우)

| 패키지 | 코드모드 명령 |
|--------|-------------|
| next / @next/* | `bunx @next/codemod@latest [transform] .` |
| tailwindcss | `bunx @tailwindcss/upgrade` |
| @tanstack/react-query | 없음 → migration-assistant 에이전트 사용 |
| dexie | 없음 → 수동 마이그레이션 |
| react | 없음 → react-codemod 참고 |

Next.js 코드모드 목록 확인:
```bash
bunx @next/codemod@latest --list-transforms
```

### 3단계: context7로 마이그레이션 가이드 조회
context7 MCP가 연결되어 있으면 다음을 조회하세요:
- `[패키지명] migration guide v[이전버전] to v[새버전]`
- `[패키지명] breaking changes changelog`

### 4단계: 이 프로젝트의 영향 범위 파악
```bash
# 패키지 사용 파일 검색
grep -r "from '[패키지명]'" --include="*.ts" --include="*.tsx" -l
grep -r "import.*[패키지명]" --include="*.ts" --include="*.tsx" -l
```

### 5단계: 업데이트 실행
```bash
# 특정 패키지만 업데이트
bun update [패키지명]

# 빌드로 에러 확인
bun run build 2>&1 | head -50

# 린트 확인
bun run lint
```

### 6단계: 수동 변경 필요 항목 리포트
빌드 에러 또는 타입 에러가 있으면:
1. 에러 메시지 분석
2. `migration-assistant` 에이전트에게 위임: "이 에러들을 [패키지명] v[버전] 마이그레이션 가이드에 따라 수정해줘"

## 이 프로젝트의 주요 패키지 업그레이드 노트

**@tanstack/react-query** (현재 v5)
- `hooks/useTodos.ts`, `hooks/useContent.ts`가 핵심 사용처
- v5에서 `onSuccess`/`onError` 콜백 제거됨 — 이미 반영됨
- 다음 메이저(v6) 시 `queryKeys` factory 패턴 영향 가능성

**next** (현재 16.x)
- `app/` 디렉토리 구조 — App Router 이미 사용 중
- `next.config.ts`에 실험적 기능 사용 여부 먼저 확인

**dexie** (현재 v4)
- `lib/db.ts`가 유일한 사용처
- StorageAdapter 패턴으로 격리되어 있어 마이그레이션 범위 제한적
