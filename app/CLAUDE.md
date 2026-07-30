# app/CLAUDE.md

Scope: this directory only. See root `CLAUDE.md` for routing/SSR rules in general.

## The shell pattern

Every route file here (except `oauth/callback/page.tsx`, see below) is a thin,
identically-shaped wrapper — nothing else belongs in a `page.tsx`:

```tsx
'use client'
import dynamic from 'next/dynamic'
const XView = dynamic(() => import('@/components/feature/XView').then((m) => m.XView), { ssr: false })
export default function XPage() { return <XView /> }
```

`page.tsx` → `DashboardView`, `history/page.tsx` → `HistoryView`,
`todo/[id]/page.tsx` → `TodoDetailView`, `settings/page.tsx` → `SyncSettings`
(from `components/`, not `components/feature/` — settings isn't a "feature view").
`{ ssr: false }` is load-bearing, not boilerplate: every one of these screens
touches IndexedDB through TanStack Query hooks on mount, and IndexedDB doesn't
exist during SSR. Adding a route without this shape will break at build/render
time the moment it touches `useTodos`/`useContent`.

## The one exception

`oauth/callback/page.tsx` has its real logic inline — no `components/feature/`
counterpart. It's a throwaway popup page: parse the token out of the redirect
URL, `postMessage` it to `window.opener`, close itself. There's nothing here
worth extracting into a shared component.

## Special Next.js files

- `error.tsx` — global error boundary (Next.js convention, not project-specific).
  Currently only `console.error`s; the "send to error tracking service" branch
  is commented out as a TODO, not wired to anything.
- `layout.tsx` — provider/shell nesting order is
  `Providers > ServiceWorkerRegister > Toaster > AppShell`. It also injects a
  Figma capture `<script>` tag, gated to non-production only — this is
  temporary design-sync tooling (see the `TEMP(dev-only)` comment above it),
  not permanent app infrastructure. Safe to delete once that capture workflow
  is no longer needed.
