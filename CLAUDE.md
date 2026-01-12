# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**산만이의 아침 (Motivation for ADHD)** - A daily motivation app for ADHD users built with Next.js 16.1.1. The app generates daily motivational messages, manages to-do lists, and provides practical tips tailored for ADHD users. All data is stored locally using IndexedDB with no backend server.

## Development Commands

### Essential Commands
```bash
# Start development server (http://localhost:3000)
bun dev

# Build for production
bun run build

# Start production server
bun start

# Run linter
bun run lint
```

### Using Bun
This project uses Bun as the runtime and package manager. All `npm` or `yarn` commands should be replaced with `bun`.

## Architecture Overview

### State Management Strategy

This app uses a **hybrid state management approach**:

1. **TanStack Query (React Query)** - Server state and IndexedDB operations
   - Handles all data fetching, caching, and synchronization
   - Manages todo CRUD operations with optimistic updates
   - Caches API responses for motivation content
   - See `hooks/useTodos.ts` and `hooks/useContent.ts`

2. **Zustand** - UI state and business logic
   - Manages local UI state (special events, creation flags)
   - Contains business logic for generating daily todos
   - Orchestrates multiple data sources
   - See `lib/store.ts`

**When to use what:**
- Use TanStack Query hooks for any IndexedDB operations or API calls
- Use Zustand store for UI state, derived state, and business logic that doesn't require persistence
- Never directly call `lib/db.ts` functions - always go through TanStack Query hooks

### Data Flow Architecture

```
User Action → Component
    ↓
TanStack Query Hook (useTodos, useContent)
    ↓
IndexedDB (via lib/db.ts) OR API Route
    ↓
TanStack Query Cache
    ↓
Component Re-render
```

### Key Files and Their Roles

- **`lib/db.ts`** - IndexedDB schema and helper functions using Dexie.js
  - SSR-safe with lazy initialization
  - Two tables: `todos` and `settings`
  - Includes localStorage migration logic

- **`lib/store.ts`** - Zustand store for UI state
  - Contains business logic for daily todo generation
  - Manages special event advice generation
  - Coordinates between TanStack Query and UI state

- **`hooks/useTodos.ts`** - TanStack Query hooks for todo operations
  - Query key factory pattern for cache management
  - Optimistic updates for mutations
  - Automatic cache invalidation

- **`hooks/useContent.ts`** - TanStack Query hook for motivation content
  - Long stale time (1 hour) since content rarely changes
  - Fetches from API route with aggressive caching

- **`app/api/content/[locale]/route.ts`** - API route for content
  - Security: locale whitelist prevents path traversal
  - Static generation with revalidation
  - Fallback to default content on error

### Component Organization

- **`app/`** - Next.js App Router pages
  - `page.tsx` - Main screen
  - `todo/[id]/page.tsx` - Individual todo detail view
  - `history/page.tsx` - Todo history list
  - `api/content/[locale]/route.ts` - Content API

- **`components/`** - React components
  - `Providers.tsx` - TanStack Query provider with global config
  - `MainScreen.tsx` - Main application interface
  - `TodayTodoView.tsx` - Daily todo display
  - `ui/` - Reusable UI components (buttons, spinners, etc.)

### TanStack Query Configuration

Global defaults in `components/Providers.tsx`:
- **Stale Time**: 5 minutes (data considered fresh)
- **GC Time**: 10 minutes (cache kept in memory)
- **Refetch on Window Focus**: Enabled (keeps data current)
- **Refetch on Mount**: Disabled if data is fresh (performance)

Content-specific overrides:
- **Stale Time**: 1 hour (motivation content changes infrequently)
- **GC Time**: 24 hours (aggressive caching)

### IndexedDB Schema

```typescript
// Database: MotivationForADHD
todos: {
  id: string (primary key)
  date: string (indexed)
  title: string
  content: string
  createdAt: string (indexed)
}

settings: {
  key: string (primary key)
  value: any
}
```

## Important Patterns

### Query Key Factories

Always use query key factories to ensure consistent cache management:

```typescript
// In hooks/useTodos.ts
export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters?: string) => [...todoKeys.lists(), { filters }] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
  byDate: (date: string) => [...todoKeys.all, 'date', date] as const,
}
```

### Optimistic Updates

Mutations use optimistic updates for instant UI feedback:

```typescript
onMutate: async (newTodo) => {
  await queryClient.cancelQueries({ queryKey: todoKeys.lists() })
  const previousTodos = queryClient.getQueryData(todoKeys.lists())
  queryClient.setQueryData(todoKeys.lists(), (old) => [...old, newTodo])
  return { previousTodos }
}
```

### SSR Safety

IndexedDB is browser-only. The `lib/db.ts` getDB() function checks:
```typescript
if (typeof window === 'undefined') {
  throw new Error('IndexedDB can only be used in browser environment')
}
```

All IndexedDB operations must be in client components or wrapped in `typeof window !== 'undefined'` checks.

### Content Localization

The app supports multiple locales via `public/content/{locale}.json`. The API route validates locales against a whitelist to prevent path traversal attacks:

```typescript
const ALLOWED_LOCALES = ['ko', 'en'] as const
```

## PWA and Offline Support

- Service worker registration in `components/ServiceWorkerRegister.tsx`
- Manifest file at `public/manifest.webmanifest`
- Offline page at `public/offline.html`
- App icons in `public/icons/`

## Security Considerations

1. **Path Traversal Protection**: API routes validate locale parameter against whitelist
2. **SSR Safety**: IndexedDB operations guarded with `typeof window` checks
3. **Type Safety**: Strict TypeScript configuration throughout
4. **Header Security**: `poweredByHeader: false` in next.config.ts

## Accessibility

- IconButtons require `aria-label` props
- Target WCAG 2.1 AA compliance
- Use semantic HTML and proper ARIA attributes

## Common Tasks

### Adding a New Query
1. Create hook in `hooks/` directory
2. Use query key factory pattern
3. Configure appropriate stale/cache times
4. Handle loading and error states

### Adding New Todo Logic
1. Business logic goes in `lib/store.ts`
2. Persistence layer goes in `lib/db.ts`
3. Wrap with TanStack Query in `hooks/useTodos.ts`
4. Use the hook in components

### Modifying Content Structure
1. Update TypeScript types in `lib/types.ts`
2. Update JSON files in `public/content/`
3. Update API route if needed
4. Update consuming components

## Migration Context

This project was migrated from Vue.js to Next.js 16.1.1:
- Vue/Pinia → React/Zustand/TanStack Query
- localStorage → IndexedDB (Dexie.js)
- Vue Router → Next.js App Router
- Vite → Next.js (Turbopack enabled)

The migration maintains feature parity while improving performance, type safety, and developer experience.
