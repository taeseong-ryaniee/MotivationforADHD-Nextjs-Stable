# 산만이의 아침 (Motivation for ADHD)

ADHD 사용자를 위한 매일의 동기부여 앱 - Next.js 16.1.1 버전

## 기능

- 📅 매일 동기부여 메시지 생성
- ✅ 하루를 시작하는 To-do 작성
- 📝 특별 일정 입력 및 맞춤 조언
- 🗂️ To-do 히스토리 관리
- 💾 IndexedDB를 통한 로컬 데이터 저장
- 🌙 다크 모드 지원
- 📱 PWA 지원 (오프라인 작동)

## 기술 스택

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand (UI state)
- **Server State**: TanStack Query (React Query)
- **Database**: Dexie.js (IndexedDB wrapper)
- **Icons**: Lucide React
- **PWA**: Service Worker + Manifest

## 시작하기

### 개발 서버 실행

```bash
bun dev
```

[http://localhost:3000](http://localhost:3000)에서 앱을 확인할 수 있습니다.

### 빌드

``` bash
bun run build
```

### 프로덕션 서버 실행

``` bash
bun start
```

## 프로젝트 구조

```
nextjs-migration/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── todo/[id]/         # To-do 상세 페이지
│   ├── history/           # 히스토리 페이지
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 메인 페이지
│   └── globals.css        # 전역 스타일
├── components/            # React 컴포넌트
│   ├── ui/               # 재사용 가능한 UI 컴포넌트
│   ├── MainScreen.tsx    # 메인 화면
│   ├── TodayTodoView.tsx # To-do 상세 뷰
│   └── ...
├── lib/                   # 유틸리티 및 핵심 로직
│   ├── db.ts             # IndexedDB 설정 및 헬퍼
│   ├── store.ts          # Zustand 스토어
│   ├── types.ts          # TypeScript 타입 정의
│   └── utils.ts          # 유틸리티 함수
├── public/               # 정적 파일
│   ├── content/          # 동기부여 문구 JSON
│   ├── icons/            # PWA 아이콘
│   └── manifest.webmanifest
└── next.config.ts        # Next.js 설정
```

## 데이터 관리

### TanStack Query
- **서버 상태 관리**: API 호출 및 IndexedDB 쿼리를 자동으로 캐싱
- **자동 리페칭**: 데이터가 stale 상태가 되면 자동으로 업데이트
- **낙관적 업데이트**: 사용자 경험 향상을 위한 즉각적인 UI 반영
- **React Query Devtools**: 개발 환경에서 쿼리 상태 디버깅
- 자세한 사용법은 [USAGE.md](./USAGE.md) 참고

### IndexedDB
- To-do 데이터는 모두 브라우저의 IndexedDB에 저장됩니다
- 서버 없이 로컬에서 완전히 작동합니다
- 기존 localStorage 데이터는 자동으로 마이그레이션됩니다
- TanStack Query로 캐싱 및 동기화 최적화

### API Routes
- \`/api/content/[locale]\`: 동기부여 문구를 제공하는 API
- JSON 파일을 캐싱하여 빠른 응답 제공
- TanStack Query로 1시간 캐싱

## PWA 기능

- 오프라인 지원
- 앱 설치 가능
- 백그라운드 동기화
- 푸시 알림 준비 (향후 추가 가능)

## 마이그레이션 정보

이 프로젝트는 Vue.js에서 Next.js 16.1.1로 마이그레이션되었습니다.

### 주요 변경사항

- **Framework**: Vue.js → Next.js 16.1.1 (App Router)
- **State**: Pinia → Zustand + TanStack Query
- **Storage**: localStorage → IndexedDB (Dexie.js)
- **Routing**: Vue Router → Next.js App Router
- **Build Tool**: Vite → Next.js (Turbopack)
- **Server State**: TanStack Query 추가

### 보안 개선

- ✅ API Route path traversal 방지 (locale 화이트리스트)
- ✅ IndexedDB SSR 안전 처리
- ✅ 타입 안전성 강화

### 접근성 개선

- ✅ IconButton에 필수 aria-label 추가
- ✅ WCAG 2.1 AA 준수

### 성능 최적화

- ✅ Service Worker를 통한 캐싱
- ✅ Static generation 활용
- ✅ API Routes 캐싱 전략

## 라이센스

MIT
