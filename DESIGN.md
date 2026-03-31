# Design System — 산만이의 아침

## Product Context
- **What this is:** ADHD 사용자를 위한 아침 시작 도우미 앱. 의자에 앉은 순간 멍한 상태를 깨뜨리고 할 일을 쓰기 시작하게 만드는 것이 핵심.
- **Who it's for:** ADHD를 가진 직장인. 매일 아침 "뭐해야되지?" 상태를 경험하는 사람.
- **Space/industry:** ADHD 웰니스/생산성 앱. Finch, Routinery, Focusmate 등이 있는 공간.
- **Project type:** 모바일 우선 웹 앱 (PWA)

## Aesthetic Direction
- **Direction:** Organic/Natural + 따뜻한 미니멀
- **Decoration level:** Intentional (입력칸 주변 micro-stimulation, 나머지는 깔끔)
- **Mood:** "아침 햇살이 들어오는 따뜻한 방." 차갑지 않은 다크 모드. 도구가 아니라 동반자 느낌. 멍한 상태에서 미세한 시각 자극으로 시선을 끌어당기되, 압박하지 않음.
- **Reference sites:** Finch (부드러운 파스텔, 스트릭 압박 없음), Routinery (타이머 기반 깔끔함)

## Typography
- **Display/Hero:** Wanted Sans ExtraBold — 한국어 최적화, 또렷하면서 부드러운 현대 고딕
- **Body:** Wanted Sans Regular/Medium — CJK 가독성 우수, 일관된 톤
- **UI/Labels:** Wanted Sans Medium
- **Data/Tables:** JetBrains Mono — tabular-nums 지원, 날짜/시간/숫자에 사용
- **Code:** JetBrains Mono
- **Loading:** self-hosted (Wanted Sans는 CDN 미제공, 직접 호스팅 필요)
- **Scale:**
  - text-xs: 12px / 0.75rem
  - text-sm: 14px / 0.875rem
  - text-base: 16px / 1rem
  - text-lg: 18px / 1.125rem
  - text-xl: 20px / 1.25rem
  - text-2xl: 24px / 1.5rem (StartScreen 입력칸)
  - text-3xl: 30px / 1.875rem
  - text-4xl: 36px / 2.25rem (히어로 제목)

## Color
- **Approach:** Restrained + warm accent
- **Background:** #0a0a0a (zinc-950) — 깊은 다크
- **Surface:** #18181b (zinc-900) — 카드/섹션 배경
- **Card:** #1c1917 (stone-900) — 약간 따뜻한 카드 배경
- **Text primary:** #fafaf9 (stone-50) — 본문
- **Text muted:** #a8a29e (stone-400) — 보조 텍스트, placeholder
- **Accent:** #f59e0b (amber-500) — 유일한 강조 색상. 버튼, 링크, glow
- **Accent glow:** #f59e0b20 (amber-500 at 12% opacity) — 입력칸 주변 미세 glow
- **Success:** #22c55e (green-500) — 투두 추가 성공 flash, 완료 상태
- **Warning:** #eab308 (yellow-500) — 경고
- **Error:** #ef4444 (red-500) — 저장 실패
- **Info:** #3b82f6 (blue-500) — 정보성 메시지
- **Dark mode:** 기본값. Light mode는 Phase 2에서 추가 검토.

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable (ADHD 사용자에게 빡빡한 UI는 압박감)
- **Scale:** 2xs(2px) xs(4px) sm(8px) md(16px) lg(24px) xl(32px) 2xl(48px) 3xl(64px)

## Layout
- **Approach:** Grid-disciplined (한 화면 한 행동 원칙)
- **Grid:** 모바일 1열, 태블릿 1열 (max-w-md 중앙), 데스크톱 기존 사이드바 + 콘텐츠
- **Max content width:** 1200px (데스크톱 AppShell 내)
- **Border radius:**
  - sm: 4px (작은 요소)
  - md: 8px (카드, 입력칸)
  - lg: 12px (큰 카드, 모달)
  - full: 9999px (chip, badge)

## Motion
- **Approach:** Intentional (시작 순간에만 집중)
- **Easing:** enter: ease-out, exit: ease-in, move: ease-in-out
- **Duration:** micro: 50-100ms, short: 150-250ms, medium: 250-400ms
- **Key animations:**
  - 투두 추가 성공: 입력칸 배경 amber glow flash (0.3s ease-out)
  - Chip 등장: slide-up + fade-in (0.2s ease-out)
  - "오늘 하루 시작!" 버튼 등장: fade-in (0.3s ease-out)
  - 토스트: Sonner 기본 애니메이션 (slide-in-from-bottom)

## ADHD-Specific Design Principles
1. **한 화면 한 행동.** 결정 포인트가 하나여야 함. 멍한 상태에서 선택지가 많으면 아무것도 안 함.
2. **스트릭 압박 없음.** 연속 기록, 놓친 날 표시 등 죄책감을 유발하는 요소 금지.
3. **실패 없는 UX.** 앱을 오래 안 열어도 "환영합니다" 느낌. "어디 갔었어요?"가 아니라 "돌아왔네요."
4. **Micro-stimulation.** 멍한 상태를 깨뜨리는 미세한 시각 자극 (amber glow, 부드러운 애니메이션). 과자극이 아닌 적절한 자극.
5. **즉각적 성취감.** 투두를 하나 적으면 바로 응원. 3초 안에 "했다!" 느낌.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-30 | 초기 디자인 시스템 생성 | /design-consultation. zinc+stone+amber 따뜻한 다크. Wanted Sans. ADHD micro-stimulation. |
| 2026-03-30 | amber accent 선택 | 따뜻한 다크에서 유일한 강조색. 아침 햇살 연상. |
| 2026-03-30 | Wanted Sans 선택 | Pretendard 대비 차별화 + 한국어 CJK 최적화 + 부드럽지만 또렷한 성격 |
| 2026-03-30 | micro-stimulation 패턴 | ADHD 앱은 보통 "침착함" 추구하지만, 멍함(under-stimulation)이 핵심 문제. 미세 자극이 필요. |
