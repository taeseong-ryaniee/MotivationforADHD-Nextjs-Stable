# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**산만이의 아침 (Motivation for ADHD)** - A daily motivation app for ADHD users built with Next.js 16 (App Router). The app generates daily motivational messages, manages to-do lists, and provides practical tips tailored for ADHD users. Data is stored locally using IndexedDB with optional multi-cloud sync (AWS S3, Google Drive, OneDrive, Dropbox).

## Development Commands

```bash
bun dev          # Start dev server (http://localhost:3000)
bun run build    # Build for production
bun start        # Start production server
bun run lint     # Run ESLint
bunx vitest run  # Run tests once (canonical — reads vitest.config.ts)
bun run test     # Same, watch mode (package.json "test": "vitest")
```

> Use `bunx vitest`, **not** `bun test`. `bun test` invokes Bun's built-in
> runner, which ignores `vitest.config.ts` (jsdom env + `@` alias). It passes
> today only because every test is pure logic — any test needing jsdom or the
> `@` alias breaks silently under it.

This project uses **Bun** as the runtime and package manager. Replace all `npm`/`yarn` commands with `bun`.

## Architecture Overview

### State Management Strategy

There is no global store. State is split by where it lives:

1. **TanStack Query** — all persistent state (IndexedDB + cloud sync)
   - Data fetching, caching, optimistic todo CRUD
   - See `hooks/useTodos.ts` and `hooks/useContent.ts`

2. **React local state** — transient UI state lives in the component that owns it
   (mostly `components/feature/*`).

3. **Pure helpers** — derived/business logic (daily todo generation, event-based
   content selection) lives in stateless modules, not a store:
   `lib/todo-utils.ts`, `lib/content-utils.ts`.

**Rules:**
- Any IndexedDB read/write → go through a TanStack Query hook. Never call
  `lib/db.ts` directly from a component. (`lib/sync.ts` is the one sanctioned
  non-hook caller — the cloud-sync data layer.)
- Derived logic → a `lib/*-utils.ts` helper, not a hook.

> Note: this app previously used Zustand (`lib/store.ts`); both are now removed.
> If you find a reference to either, it is stale.

### Data Flow Architecture

```
User Action → Component
    ↓
TanStack Query Hook (useTodos, useContent)
    ↓
lib/db.ts (Dexie / IndexedDB) — local source of truth
    ↓
TanStack Query Cache → Component Re-render
```

There are no API routes (`app/api/` does not exist) — the app is fully
client/local-first. A successful todo write additionally notifies the sync
engine, which debounce-pushes to the active cloud provider (see Cloud Sync
Architecture below).

### Local Storage (local-first)

All data lives locally in IndexedDB via `lib/db.ts` (Dexie.js) — the single
source of truth. There is no central server; the cloud is an optional sync
target (see below), never the primary store.

Access storage through TanStack Query hooks (`hooks/useTodos.ts`,
`hooks/useContent.ts`). `lib/sync.ts` is the one non-hook caller — it is the
cloud-sync data layer and reads/writes `lib/db.ts` directly.

Writes are validated at the boundary: `saveTodo`/`bulkSaveTodos` run
`TodoDataSchema.parse()` before persisting (`lib/validation.ts`).

### Cloud Sync Architecture

Local-first: IndexedDB is the source of truth, the cloud an optional mirror.
Once a provider is connected, sync runs **automatically** — there is no manual
"sync now" button.

```
lib/
├── auth.ts               # OAuth popup flow (Google, OneDrive, Dropbox)
├── sync.ts               # exportData / importSyncData + S3, file import/export
├── sync-engine.ts        # debounced auto-push + pullOnce; 401 → drop provider, prompt re-login
├── sync-trigger.ts       # shouldSyncMutation — only successful todo mutations trigger a push
└── cloud/
    ├── types.ts          # CloudProvider interface
    ├── activeProvider.ts # in-memory session singleton (no token persistence)
    ├── google.ts         # Google Drive provider
    ├── onedrive.ts       # OneDrive provider
    └── dropbox.ts        # Dropbox provider
```

**Auto-sync wiring** (`components/Providers.tsx`):
- On app open → `seedContent()` + `pullOnce()` (pull remote changes if connected).
- On any successful todo mutation → `schedulePush()` (3s debounce, single-flight,
  re-runs if marked dirty mid-upload). All state serializes to one file:
  `motivation-sync.json`.

**CloudProvider interface** (`lib/cloud/types.ts`):
- `isAuthenticated()`, `login()`, `logout()`
- `upload(data, filename)`, `download(fileId)`, `list()`

Auth is implicit OAuth with **no token persistence**: `activeProvider` holds the
live provider in memory for the session; on expiry (401) the engine clears it and
asks the user to re-login. OAuth callback: `app/oauth/callback/page.tsx`.

### Key Files

- **`lib/db.ts`** - IndexedDB (Dexie.js) — local source of truth, accessed via hooks
- **`lib/sync.ts`** - `exportData`/`importSyncData`, S3 + file import/export
- **`lib/sync-engine.ts`** - debounced auto-push / pull engine
- **`lib/sync-trigger.ts`** - decides which mutations trigger a push
- **`lib/auth.ts`** - OAuth configuration and popup flow
- **`hooks/useTodos.ts`** - TanStack Query hooks with query key factory
- **`hooks/useContent.ts`** - Motivation content fetching (seed + cache)

### Component Organization

- **`app/`** - Next.js App Router pages (no API routes — client/local-first)
  - `page.tsx` - Today / morning start screen (root; `/dashboard` was merged here)
  - `settings/page.tsx` - Settings with cloud sync configuration
  - `oauth/callback/page.tsx` - OAuth redirect handler
  - `todo/[id]/page.tsx` - Individual todo detail
  - `history/page.tsx` - Todo history list

- **`components/`** - React components
  - `Providers.tsx` - TanStack Query + ThemeProvider + auto-sync wiring
  - `AppShell.tsx`, `app-sidebar.tsx`, `mobile-nav.tsx` - layout & navigation
  - `feature/` - screen-level features (StartScreen, TodayTodoView, etc.)
  - `ui/` - shadcn/ui components (button, card, input, tabs, etc.)

### TanStack Query Configuration

Global defaults in `components/Providers.tsx`:
- **Stale Time**: 5 minutes | **GC Time**: 10 minutes
- **Refetch on Window Focus**: Enabled
- Content-specific: Stale 1 hour, GC 24 hours

### IndexedDB Schema

```typescript
// Database: MotivationForADHD (Dexie, schema v4)
todos:    { id, date, title, content, createdAt, createdAtMs }  // index: [date+createdAt]
settings: { key, value }
content:  { locale, ... }  // motivation content cached from public/content/

// createdAt is a display-only ko-KR string; createdAtMs is the machine timestamp
// used for sorting and month aggregation (added in v4, backfilled on upgrade).
```

### UI Components (shadcn/ui + Tailwind CSS v4)

Uses shadcn/ui components in `components/ui/`. Theme system via `next-themes`:
- `ThemeProvider` in `Providers.tsx`
- Dark/light mode toggle in settings page
- CSS variables for theming in `app/globals.css`

## Important Patterns

### Query Key Factories

Use query key factories in `hooks/useTodos.ts` for consistent cache management:

```typescript
export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  detail: (id: string) => [...todoKeys.all, 'detail', id] as const,
  byDate: (date: string) => [...todoKeys.all, 'date', date] as const,
}
```

### SSR Safety

IndexedDB is browser-only. All storage operations must be in client components or wrapped in `typeof window !== 'undefined'` checks.

### Content Localization

Content ships as static JSON in `public/content/` (`ko.json`, `en.json`,
`quotes-ko.json`). On app open, `lib/content-seed.ts` fetches
`/content/{locale}.json`, validates it with `ContentDataSchema`
(`lib/validation.ts`), and caches it into the IndexedDB `content` table;
`hooks/useContent.ts` reads from there. There is no API route (the former
`/api/content` route was removed).

## PWA Support

- Service worker: `components/ServiceWorkerRegister.tsx`
- Manifest: `public/manifest.webmanifest`
- Offline fallback: `public/offline.html`

## Testing

Vitest + React Testing Library (jsdom). Config: `vitest.config.ts` sets the
`jsdom` environment and the `@` path alias. Test files live in `__tests__/`
dirs next to the code (`lib/__tests__/`, `lib/cloud/__tests__/`,
`lib/utils/__tests__/`).

```bash
bunx vitest run             # Run all tests once (canonical)
bun run test                # Watch mode (package.json "test" script)
bunx vitest run google      # Run files matching "google"
bunx vitest run --coverage  # With coverage
```

Run with `bunx vitest`, not `bun test` — see the note under Development Commands.

## Adding New Features

### Adding a Cloud Provider
1. Implement `CloudProvider` interface in `lib/cloud/`
2. Add OAuth config to `lib/auth.ts` if needed
3. Wire it into the UI in `components/SyncSettings.tsx` (the settings page just
   renders `<SyncSettings />`): instantiate the provider on successful login and
   call `setActiveProvider(newProvider)`.
4. **Required for auto-sync:** step 3's `setActiveProvider()` is what makes the
   sync engine see the provider (`sync-engine.ts` reads it via
   `getActiveProvider()`). Without it the provider exists but never pushes/pulls.
5. Add tests in `lib/cloud/__tests__/`

### Adding New Todo Logic
1. Persistence → add a function in `lib/db.ts` (validate writes with `TodoDataSchema`)
2. Wrap with TanStack Query → `hooks/useTodos.ts`

### Adding UI Components
Use shadcn/ui CLI: `bunx shadcn@latest add [component]`
Components installed to `components/ui/`

## gstack

For all web browsing, use the `/browse` skill from gstack. Never use `mcp__claude-in-chrome__*` tools directly.

Available gstack skills:
`/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/design-consultation`, `/design-shotgun`, `/design-html`, `/review`, `/ship`, `/land-and-deploy`, `/canary`, `/benchmark`, `/browse`, `/connect-chrome`, `/qa`, `/qa-only`, `/design-review`, `/setup-browser-cookies`, `/setup-deploy`, `/setup-gbrain`, `/retro`, `/investigate`, `/document-release`, `/document-generate`, `/codex`, `/cso`, `/autoplan`, `/plan-devex-review`, `/devex-review`, `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/gstack-upgrade`, `/learn`

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
