# hooks/CLAUDE.md

Scope: this directory only. See root `CLAUDE.md` ("State Management Strategy",
"Query Key Factories") for the general TanStack Query convention.

- `use-mobile.ts` is unrelated to persistent state — it's a plain
  `matchMedia` breakpoint hook (`useIsMobile`, 768px), same shape as shadcn's
  standard hook. It lives here because it's a hook, not because it fits the
  TanStack Query pattern the other two files follow.
- `useContent.ts` and `useTodos.ts` each keep their own query key factory
  (`contentKeys`, `todoKeys`) — they don't share one, so don't assume adding a
  key to one touches the other.
- Content seeding happens in **two** places, not one: `Providers.tsx` seeds on
  app open, but `useContent.ts`'s `fetchContentFromDB` *also* seeds inline
  (`seedContent(locale)`) if IndexedDB has no record yet for that locale. If
  you're debugging why content loads even when the app-open seed hasn't run
  (e.g. a locale added after first load), this fallback is why.
- `useTodos.ts` (`useDailyTodo` etc.) only imports from `lib/db.ts` and
  `lib/content-utils.ts` — it holds no screen logic itself. The "does today
  have a todo yet" branching lives in `components/feature/DashboardView.tsx`,
  not here.
