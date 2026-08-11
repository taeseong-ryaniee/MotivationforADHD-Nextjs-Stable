import { migrateFromLocalStorage } from './db'

/**
 * 앱 시작 시 1회 도는 localStorage → IndexedDB 마이그레이션 진입점.
 *
 * 컴포넌트가 lib/db 를 직접 임포트하지 않도록 lib/ 층에 둔다 — Providers 가
 * seedContent() 를 부르는 것과 같은 모양이다(루트 CLAUDE.md 의 IndexedDB 접근 규칙).
 * migrateFromLocalStorage 자체가 settings.migrationComplete 로 멱등하므로
 * 여기에 별도의 실행 여부 플래그를 두지 않는다.
 */
export async function runStartupMigration(): Promise<void> {
  await migrateFromLocalStorage()
}
