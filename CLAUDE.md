# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**산만이의 아침 (Motivation for ADHD)** - A daily motivation app for ADHD users built with Next.js 16.1.1. The app generates daily motivational messages, manages to-do lists, and provides practical tips tailored for ADHD users. Data is stored locally using IndexedDB with optional multi-cloud sync (AWS S3, Google Drive, OneDrive).

## Development Commands

```bash
bun dev          # Start dev server (http://localhost:3000)
bun run build    # Build for production
bun start        # Start production server
bun run lint     # Run ESLint
bun test         # Run Vitest tests
bun test --watch # Run tests in watch mode
```

This project uses **Bun** as the runtime and package manager. Replace all `npm`/`yarn` commands with `bun`.

## Architecture Overview

### State Management Strategy

This app uses a **hybrid state management approach**:

1. **TanStack Query** - Server state and IndexedDB operations
   - All data fetching, caching, and synchronization
   - Todo CRUD with optimistic updates
   - See `hooks/useTodos.ts` and `hooks/useContent.ts`

2. **Zustand** - UI state and business logic
   - Local UI state (special events, creation flags)
   - Business logic for generating daily todos
   - See `lib/store.ts`

**When to use what:**
- TanStack Query hooks → Any IndexedDB operations or API calls
- Zustand store → UI state, derived state, business logic without persistence
- Never directly call `lib/db.ts` → Always go through TanStack Query hooks

### Data Flow Architecture

```
User Action → Component
    ↓
TanStack Query Hook (useTodos, useContent)
    ↓
StorageAdapter (via StorageManager) OR API Route
    ↓
TanStack Query Cache
    ↓
Component Re-render
```

### Storage Adapter Pattern (Phase 5)

The app uses a pluggable storage system via the Adapter pattern:

```
lib/storage/
├── types.ts           # StorageAdapter interface
├── StorageManager.ts  # Singleton manager for adapter access
└── adapters/
    └── LocalDexieAdapter.ts  # Default IndexedDB implementation
```

**StorageAdapter interface** (`lib/storage/types.ts`):
- `getTodos()`, `saveTodo()`, `deleteTodo()`, `bulkSaveTodos()`
- `getSetting<T>()`, `saveSetting()`, `deleteSetting()`
- Optional: `sync()`, `backup()`, `restore()`

Access storage through: `storage.getAdapter()` from `lib/storage/StorageManager.ts`

### Cloud Sync Architecture

Multi-cloud sync support with OAuth integration:

```
lib/
├── auth.ts          # OAuth popup flow (Google, OneDrive)
├── sync.ts          # S3 upload/download, file import/export
└── cloud/
    ├── types.ts     # CloudProvider interface
    ├── google.ts    # Google Drive provider
    └── onedrive.ts  # OneDrive provider
```

**CloudProvider interface** (`lib/cloud/types.ts`):
- `isAuthenticated()`, `login()`, `logout()`
- `upload(data, filename)`, `download(fileId)`, `list()`

OAuth callback handled at `app/oauth/callback/page.tsx` → `/oauth/callback`

### Key Files

- **`lib/storage/StorageManager.ts`** - Singleton access to storage adapter
- **`lib/db.ts`** - Legacy IndexedDB (Dexie.js), use StorageAdapter instead
- **`lib/store.ts`** - Zustand store for UI state and business logic
- **`lib/sync.ts`** - Data export/import and S3 integration
- **`lib/auth.ts`** - OAuth configuration and popup flow
- **`hooks/useTodos.ts`** - TanStack Query hooks with query key factory
- **`hooks/useContent.ts`** - Motivation content fetching

### Component Organization

- **`app/`** - Next.js App Router pages
  - `settings/page.tsx` - Settings with cloud sync configuration
  - `oauth/callback/page.tsx` - OAuth redirect handler
  - `todo/[id]/page.tsx` - Individual todo detail
  - `history/page.tsx` - Todo history list
  - `api/content/[locale]/route.ts` - Content API

- **`components/`** - React components
  - `Providers.tsx` - TanStack Query + ThemeProvider setup
  - `ui/` - shadcn/ui components (button, card, input, tabs, etc.)

### TanStack Query Configuration

Global defaults in `components/Providers.tsx`:
- **Stale Time**: 5 minutes | **GC Time**: 10 minutes
- **Refetch on Window Focus**: Enabled
- Content-specific: Stale 1 hour, GC 24 hours

### IndexedDB Schema

```typescript
// Database: MotivationForADHD
todos: { id, date, title, content, createdAt }
settings: { key, value }
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

Locales via `public/content/{locale}.json`. API route validates against whitelist (`ko`, `en`) to prevent path traversal.

## PWA Support

- Service worker: `components/ServiceWorkerRegister.tsx`
- Manifest: `public/manifest.webmanifest`
- Offline fallback: `public/offline.html`

## Testing

Tests use Vitest with React Testing Library. Test files in `__tests__/` directories:
- `lib/cloud/__tests__/google.test.ts`
- `lib/cloud/__tests__/onedrive.test.ts`

```bash
bun test                    # Run all tests
bun test google            # Run tests matching "google"
bun test --coverage        # Run with coverage
```

## Adding New Features

### Adding a Cloud Provider
1. Implement `CloudProvider` interface in `lib/cloud/`
2. Add OAuth config to `lib/auth.ts` if needed
3. Register in settings UI at `app/settings/page.tsx`
4. Add tests in `lib/cloud/__tests__/`

### Adding New Todo Logic
1. Business logic → `lib/store.ts`
2. Persistence → Implement in `StorageAdapter`
3. Wrap with TanStack Query → `hooks/useTodos.ts`

### Adding UI Components
Use shadcn/ui CLI: `bunx shadcn@latest add [component]`
Components installed to `components/ui/`
