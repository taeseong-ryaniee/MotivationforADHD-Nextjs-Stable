import type { TodoData } from './types'

/**
 * 정렬·월별 집계용 단일 타임스탬프(epoch ms)를 반환한다.
 *
 * `createdAt`은 표시 전용 한국어 문자열("2026. 6. 23. 오후 5:46:35")이라
 * `new Date(createdAt)`로 파싱하면 Invalid Date가 된다. 그래서 기계용 숫자
 * 타임스탬프 `createdAtMs`를 날짜 연산의 단일 진실원(source of truth)으로 쓴다.
 *
 * 신규 레코드는 쓰기 시점에 `createdAtMs`를 채운다. createdAtMs가 없는
 * 레거시 레코드(스키마 v4 이전에 저장됨)는 fallback으로 보정한다.
 */
export function getTodoTimestamp(
  todo: { createdAtMs?: number; createdAt?: string; date?: string },
): number {
  // 0/음수는 "미설정" 센티넬로 취급한다 — 2026년 출시 앱에서 epoch 0(1970)은
  // 실제 생성시각일 수 없고, 스텁 단계 백필이 굳힌 값일 뿐이므로 재도출한다.
  if (typeof todo.createdAtMs === 'number' && Number.isFinite(todo.createdAtMs) && todo.createdAtMs > 0) {
    return todo.createdAtMs
  }

  // createdAtMs가 없는 레거시 레코드: 표시용 `date` 문자열에서 연·월·일을 파싱한다.
  // "2026년 6월 23일 화요일" → new Date(2026, 5, 23). 시:분:초는 버린다(날짜만 사용).
  const m = todo.date?.match(/(\d+)\s*년\s*(\d+)\s*월\s*(\d+)\s*일/)
  if (m) {
    const [, year, month, day] = m
    return new Date(Number(year), Number(month) - 1, Number(day)).getTime()
  }

  // 파싱 실패 시: "실패 없는 UX"(DESIGN.md) — 기록이 1970으로 사라지지 않도록 현재 시각으로 본다.
  return Date.now()
}

/** TodoData에 createdAtMs를 보장해서 반환한다(쓰기 경로 안전망). */
export function withTimestamp<T extends Partial<TodoData> & { createdAtMs?: number }>(
  todo: T,
): T & { createdAtMs: number } {
  return { ...todo, createdAtMs: getTodoTimestamp(todo) }
}
