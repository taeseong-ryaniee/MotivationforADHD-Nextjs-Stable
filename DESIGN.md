# Design System — 산만이의 아침

## Product Context
- **What this is:** ADHD 사용자를 위한 아침 시작 도우미 앱. 의자에 앉은 순간 멍한 상태를 깨뜨리고 할 일을 쓰기 시작하게 만드는 것이 핵심.
- **Who it's for:** ADHD를 가진 직장인. 매일 아침 "뭐해야되지?" 상태를 경험하는 사람.
- **Space/industry:** ADHD 웰니스/생산성 앱. Finch, Routinery, Focusmate 등이 있는 공간.
- **Project type:** 모바일 우선 웹 앱 (PWA)

---

## Aesthetic Direction
- **Direction:** Organic/Natural + 따뜻한 미니멀
- **Decoration level:** Intentional — 입력칸 주변 micro-stimulation만, 나머지는 절제
- **Mood:** "아침 햇살이 들어오는 따뜻한 방." 차갑지 않은 다크 모드. 도구가 아니라 동반자 느낌.
- **Whitespace philosophy:** 여백은 **calm signal** — 비어 있는 공간이 압박 없음을 전달. Cohere가 enterprise trust를 위해 여백을 쓰듯, 이 앱은 ADHD 불안을 낮추기 위해 여백을 씀. 채우려 하지 말 것.
- **Reference sites:** Finch (부드러운 파스텔, 스트릭 압박 없음), Routinery (타이머 기반 깔끔함)

---

## Typography

### Font Family
- **Display/Hero:** `Koddi UD On Gothic` (weight 800) — 국립국어원 범용 디자인 폰트, 가독성·접근성 최적화
- **Body/UI:** `Koddi UD On Gothic` (weight 400/700) — CJK 가독성, 일관된 톤
- **Data/Mono labels:** `JetBrains Mono` — tabular-nums, 날짜/시간/숫자/단축키 마커에 사용
- **Loading:** self-hosted `public/fonts/KoddiUDOnGothic-{Regular,Bold,ExtraBold}.woff2`

### Tracking Rules (한글 자간 원칙)
Koddi UD On Gothic은 가독성을 위해 설계된 UD 폰트이므로 자간을 공격적으로 줄이지 않는다.
- **Display (36px+):** `-0.015em` — 대형 텍스트에서만 허용되는 최소 네거티브 트래킹
- **Heading (20–35px):** `-0.01em`
- **Body/UI (≤19px):** `0` (손대지 말 것)
- **Mono labels:** `+0.02em` (가독성을 위해 약간 넓게)

### Type Scale

| Role | Size | Weight | Line Height | Letter Spacing | Use |
|------|------|--------|-------------|----------------|-----|
| Display | 36px / text-4xl | 800 | 1.0 | -0.015em | 히어로 제목 (없으면 추가 불가) |
| Heading 1 | 30px / text-3xl | 800 | 1.1 | -0.015em | 페이지 제목 |
| Heading 2 | 24px / text-2xl | 700 | 1.2 | -0.01em | 섹션 제목 |
| Heading 3 | 20px / text-xl | 700 | 1.3 | -0.01em | 카드 제목 |
| Body Large | 18px / text-lg | 400 | 1.5 | 0 | 리드 텍스트 |
| Body | 16px / text-base | 400 | 1.5 | 0 | 기본 본문 |
| UI/Button | 14px / text-sm | 700 | 1.4 | 0 | 버튼, 레이블 |
| Caption | 14px / text-sm | 400 | 1.4 | 0 | 메타데이터, 보조 텍스트 |
| Mono Label | 14px / text-sm | 400 | 1.4 | +0.02em | 날짜, 단축키, 기술적 마커 |
| Micro | 12px / text-xs | 400 | 1.4 | 0 | 폼 힌트, 최소 정보 |

### Principles
- 계층은 크기와 무게로 만든다 — 색상으로 계층을 만들지 않는다.
- 한 화면에 Display/H1은 하나만. ADHD 사용자에게 시각 경쟁은 압박이다.
- 대문자 mono label은 날짜·단축키·시스템 마커용 — 카테고리 칩에는 쓰지 않는다.

---

## Color

### Brand & Accent
| Token | Value | Role |
|-------|-------|------|
| `amber-500` | `#f59e0b` | 유일한 강조색. CTA 버튼, 링크, glow |
| `amber-400` | `#fbbf24` | 버튼 hover 상태 |
| `amber-500/10` | `#f59e0b1a` | 앰버 glow 배경 (micro-stimulation) |
| `green-500` | `#22c55e` | 투두 추가 성공, 완료 상태 |
| `green-500/15` | `#22c55e26` | 완료 chip 배경 |

### Surface & Background (다크 모드 기본)
> **전환(2026-07-30):** `.dark` 클래스 + `hsl(var(--x))` 2단 간접 대신 CSS `light-dark()` 사용. `:root`에 `color-scheme: light`, `.dark`에 `color-scheme: dark` 선언 추가 — `light-dark()` 동작의 필수 조건.

| Token | Value | Role |
|-------|-------|------|
| `zinc-950` / `#0a0a0a` | 기본 페이지 배경 (Canvas) |
| `zinc-900` / `#18181b` | 카드·섹션 표면 (Surface) |
| `stone-900` / `#1c1917` | 따뜻한 카드 배경 (Warm Card) |
| `stone-800` / `#292524` | 인풋 배경, 보조 섹션 |

### Text
| Token | Value | Role |
|-------|-------|------|
| `stone-50` / `#fafaf9` | 기본 본문 텍스트 |
| `stone-300` / `#d6d3d1` | 부제목, 중요 보조 텍스트 |
| `stone-400` / `#a8a29e` | muted 텍스트, placeholder |
| `stone-500` / `#78716c` | 최하위 힌트, 비활성 |

### Semantic
| Token | Value | Role |
|-------|-------|------|
| `red-500` / `#ef4444` | 오류, 저장 실패 |
| `yellow-500` / `#eab308` | 경고 |
| `blue-500` / `#3b82f6` | 정보성 메시지 |

### Gradient System
이 앱은 그래디언트를 UI fill로 쓰지 않는다. 그래디언트가 필요한 경우:
- ✅ 앰버 glow (radial, micro-stimulation 전용)
- ✅ `bg-gradient-to-b from-background via-background to-muted/40` (AppShell 배경 — 매우 미묘한 depth)
- ❌ 섹션 배경, 버튼, 카드 fill에 그래디언트 사용 금지

---

## Elevation & Depth

이 앱은 **flat-first** 원칙을 따른다. 깊이는 그림자 대신 표면 교체와 얇은 테두리로 표현한다.

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | 그림자 없음, `zinc-950` 배경 | 기본 페이지, 히어로 텍스트 |
| Bordered | `1px border-border/60` | 카드, 폼 섹션 |
| Surface Lift | `bg-stone-900/80` 또는 `bg-stone-900/50` | 인풋 영역, 팁 카드 |
| **Amber Glow** | `shadow-[0_0_20px_rgba(245,158,11,0.15)]` | **micro-stimulation 전용 예외.** 투두 추가 성공 flash. 다른 곳에 쓰지 말 것. |

**Amber Glow는 flat elevation 규칙의 명명된 예외**다 — 제거하지 않는다. 이 glow가 ADHD 멍함 해소의 핵심 피드백이다.

---

## Border Radius

| Token | Value | Role |
|-------|-------|------|
| inner | 4px | 중첩된 내부 요소 |
| element | 8px | 인터랙티브 컨트롤 (버튼·인풋·셀렉터) |
| container | 12px | 콘텐츠 컨테이너 (카드·패널·다이얼로그) |
| page | 28px | 페이지 레벨 컨테이너. 작은 요소에 쓰지 말 것 |
| full | 9999px | pill (배지·태그·메인 CTA) |

> Astryx 의미 네이밍으로 개명(2026-07-30). 기존 20px(`lg`)은 사라짐 — 10곳 중 9곳은 `container`(12px), 1곳(사이드바 inset 셸)은 `page`(28px)로 재배치.

메인 CTA("추가", "오늘 하루 시작!")는 반드시 `rounded-full` (pill).
완료 chip은 `rounded-full`.
일반 카드는 `rounded-container` (12px).

---

## Spacing
- **Base unit:** 4px (ADHD 사용자를 위한 comfortable density 유지 — 8px로 변경 금지)
- **Density:** Comfortable — 빡빡한 UI는 압박감을 준다
- **Scale:**

| Token | Value | Use |
|-------|-------|-----|
| 2xs | 2px | 마이크로 간격 |
| xs | 4px | 인라인 gap |
| sm | 8px | 컴포넌트 내부 패딩 |
| md | 16px | 기본 패딩 |
| lg | 24px | 섹션 내 gap |
| xl | 32px | 카드 패딩 |
| 2xl | 48px | 섹션 간 간격 |
| 3xl | 64px | 페이지 레벨 간격 |

---

## Layout
- **Approach:** Grid-disciplined (한 화면 한 행동 원칙)
- **Grid:** 모바일 1열, 태블릿 1열 (max-w-md 중앙), 데스크톱 사이드바 + 콘텐츠
- **Max content width:** 1200px (데스크톱 AppShell 내)

---

## Motion
- **Approach:** Intentional — 시작 순간의 미세 자극에만 집중
- **Easing:** enter: `ease-out` / exit: `ease-in` / move: `ease-in-out`
- **Duration:** micro: 50–100ms / short: 150–250ms / medium: 250–400ms

| Animation | Duration | Easing | Note |
|-----------|----------|--------|------|
| 앰버 glow flash | 300ms | ease-out | 투두 추가 성공. micro-stimulation 핵심. |
| Chip 등장 | 200ms | ease-out | slide-up + fade-in |
| "오늘 하루 시작!" 등장 | 300ms | ease-out | fade-in |
| 토스트 | Sonner 기본 | — | slide-in-from-bottom |

---

## Components

### button-primary
amber-500 pill CTA. 가장 중요한 단일 행동에만 사용.
```
bg-amber-500 text-stone-950 hover:bg-amber-400
rounded-full px-6 py-2 text-sm font-bold
```
예: "추가", "오늘 하루 시작!"

### button-secondary
텍스트 링크 스타일. 보조 행동에 사용. fill 없음.
```
text-stone-400 hover:text-stone-200 underline-offset-4 hover:underline
```
예: 메뉴 링크, "히스토리 보기"

### input-card
입력 영역을 감싸는 카드. micro-stimulation glow를 포함.
```
rounded-container border border-amber-500/10 p-4
bg-stone-900/50 shadow-[0_0_10px_rgba(245,158,11,0.05)]
transition-all duration-300
/* flash 상태: */
bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]
```

### todo-chip
추가된 투두를 시각화하는 성공 chip.
```
rounded-full bg-green-500/15 px-3 py-1 text-sm text-green-400
animate-in slide-in-from-bottom-2
```

### mono-label
날짜, 단축키, 시스템 마커용 인라인 레이블.
```
font-mono text-xs text-muted-foreground tracking-wide
border border-border/70 bg-muted/30 rounded px-2.5 py-1
```

### info-chip
카운트, 상태 표시용 알약 chip. amber 없이 muted 톤.
```
rounded-full border border-border/70 bg-muted/30
px-2.5 py-1 text-xs text-muted-foreground
inline-flex items-center gap-1
```

---

## ADHD-Specific Design Principles

1. **한 화면 한 행동.** 결정 포인트가 하나여야 함. 멍한 상태에서 선택지가 많으면 아무것도 안 함.
2. **스트릭 압박 없음.** 연속 기록, 놓친 날 표시 등 죄책감을 유발하는 요소 금지.
3. **실패 없는 UX.** 앱을 오래 안 열어도 "환영합니다" 느낌. "어디 갔었어요?"가 아니라 "돌아왔네요."
4. **Micro-stimulation.** 멍한 상태를 깨뜨리는 미세한 시각 자극 (amber glow, 부드러운 애니메이션). 과자극이 아닌 적절한 자극. 앰버 glow는 절대 제거하지 않는다.
5. **즉각적 성취감.** 투두를 하나 적으면 바로 응원. 3초 안에 "했다!" 느낌.
6. **여백은 calm signal.** 비어 있는 공간 = 압박 없음. 채우려 하지 말 것.

---

## Do's and Don'ts

### Do
- 따뜻한 다크(zinc-950)를 기본 표면으로 유지한다.
- CTA는 amber pill (rounded-full) 하나만. 보조 행동은 텍스트 링크.
- 카드 반경은 12px (`rounded-container`), 미디어/큰 컨테이너는 28px (`rounded-page`).
- 날짜·단축키는 JetBrains Mono mono-label 패턴으로 표시한다.
- 표면 교체와 얇은 테두리로 계층을 만든다.
- 앰버 glow를 micro-stimulation 피드백으로 반드시 유지한다.
- 완료 chip은 `rounded-full` + green-500/15 조합으로 즉각 성취감을 준다.

### Don't
- ❌ coral, blue를 넓은 표면 색상으로 사용하지 않는다. (blue는 semantic 링크만)
- ❌ UI 카드·버튼에 `drop-shadow` 또는 `box-shadow`를 추가하지 않는다. (앰버 glow 예외)
- ❌ 모든 섹션을 카드로 감싸지 않는다 — 열린 행·규칙선·여백을 활용한다.
- ❌ 앰버를 배경 fill로 쓰지 않는다. 항상 텍스트·아이콘·glow 용도로만.
- ❌ 한글 body 텍스트에 음수 자간을 적용하지 않는다.
- ❌ 스트릭, 연속 기록, "X일째" 같은 streak 요소를 추가하지 않는다.
- ❌ saturated gradient를 UI 배경으로 사용하지 않는다. (미묘한 배경 페이드만 예외)
- ❌ light mode를 먼저 디자인하지 않는다. 다크가 기본값. (Light mode는 Phase 2)

---

## Responsive Behavior

| Breakpoint | Width | Key Changes |
|------------|-------|-------------|
| Mobile | < 640px | 단일 컬럼, 사이드바 숨김, MobileNav 표시 |
| Tablet | 640–1024px | max-w-md 중앙 정렬, 사이드바 접힘 |
| Desktop | 1024px+ | AppShell 사이드바 + 콘텐츠 레이아웃 |

---

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-30 | 초기 디자인 시스템 생성 | zinc+stone+amber 따뜻한 다크. ADHD micro-stimulation. |
| 2026-03-30 | amber accent 선택 | 따뜻한 다크에서 유일한 강조색. 아침 햇살 연상. |
| 2026-03-30 | Wanted Sans 선택 → Koddi UD On Gothic 교체 | 초기: Wanted Sans (차별화 + CJK 최적화). 2026-06-16: Koddi UD On Gothic으로 변경 — 국립국어원 UD 폰트로 접근성 강화, self-hosted. |
| 2026-03-30 | micro-stimulation 패턴 | ADHD 앱은 보통 "침착함" 추구하지만, 멍함(under-stimulation)이 핵심 문제. 미세 자극이 필요. 앰버 glow는 삭제 금지. |
| 2026-06-16 | Cohere design analysis 적용 | 구조적 엄밀함(type hierarchy, flat elevation, token table, Do/Don't) 도입. 브랜드(white canvas, coral, 기업 느낌)는 유지하지 않음. 여백을 "calm signal"로 명명. |
| 2026-06-16 | 4px base unit 유지 | Cohere 8px base 미채택 — ADHD comfortable density는 명시적 설계 결정. |
| 2026-06-16 | 한글 자간 제한 | Display(-0.015em), Heading(-0.01em), Body(0). Koddi UD 가독성 보호. |
| 2026-07-30 | Astryx 토큰 일부 채용 (radius 의미 네이밍 + light-dark()) | radius 5개 중 4개 값 동일(20px→28px `page`만 변경). light-dark() 전환에 `color-scheme` 선언 필수(next-themes가 `attribute="class"`라 클래스만 토글, `color-scheme`은 안 바뀜). Astryx 패키지는 설치 안 함(`@astryxdesign/core` 0.1.9 Beta 이전 + `@stylexjs/stylex` peer dep 요구). 폰트는 Koddi UD On Gothic 유지(Figtree에 한글 글리프 없음). 죽은 토큰 7개 제거(`chart-1~5`, `sidebar-primary`, `sidebar-primary-foreground`). |
