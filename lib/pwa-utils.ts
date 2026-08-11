/**
 * PWA 설치 배너 재노출 정책.
 *
 * 컴포넌트가 아니라 여기 있는 이유: 파생 로직은 lib/*-utils.ts 헬퍼에 둔다(루트 CLAUDE.md).
 * 순수 함수라 브라우저 없이 단위 테스트가 된다.
 */

/** 배너를 닫은 뒤 다시 보여주기까지의 간격. */
export const PWA_REPROMPT_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000

/**
 * 지금 설치 안내 배너를 보여줄지 결정한다.
 *
 * - 닫은 적 없음(null) → 표시
 * - 닫은 지 30일 미만 → 숨김
 * - 닫은 지 30일 이상 → 다시 1회 표시
 *
 * 30일은 DESIGN.md 의 "여백은 calm signal" 과 "경로가 사라지면 안 된다" 사이의 절충이다.
 * 한 번 닫은 사용자를 매번 찌르지 않으면서, 나중에 설치하고 싶어질 때의 진입점은 남긴다.
 *
 * localStorage 값이 깨져 NaN 이 들어오면 닫은 적 없는 것으로 본다.
 */
export function shouldShowPrompt(dismissedAt: number | null, now: number): boolean {
  if (dismissedAt === null || !Number.isFinite(dismissedAt)) return true
  return now - dismissedAt >= PWA_REPROMPT_INTERVAL_MS
}
