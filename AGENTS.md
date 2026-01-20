# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router routes, layouts, and API handlers (e.g., `app/api`, `app/history`, `app/todo/[id]`).
- `components/`: UI and feature components; shared UI primitives live in `components/ui/`.
- `hooks/`: React hooks (name with `useX`). Custom hooks for TanStack Query queries.
- `lib/`: core logic and utilities (`lib/db.ts`, `lib/store.ts`, `lib/utils.ts`, `lib/types.ts`, `lib/validation.ts`, `lib/toast.ts`).
- `public/`: static assets and PWA files (`public/icons`, `public/content`, `manifest.webmanifest`).

## Build, Test, and Development Commands
- `bun dev` or `npm run dev`: start Next.js dev server at `http://localhost:3000`.
- `bun run build` or `npm run build`: production build.
- `bun start` or `npm start`: serve the production build.
- `bun run lint` or `npm run lint`: run Next.js ESLint rules (ESLint 9 flat config).
- **Automated Tests**: Vitest is configured for unit/integration tests.
  - Run all tests: `npx vitest run`
  - Run single test file: `npx vitest run path/to/file.test.ts`
  - Watch mode: `npx vitest`
- **Manual/Browser Tests**: For features requiring browser interaction (PWA, Service Workers, UI flows):
  - Refer to `BROWSER_TEST_GUIDE.md` for the full manual checklist.
  - Key areas: Service Worker registration, XSS prevention, Toast notifications, Offline mode.

## Coding Style & Naming Conventions
- **TypeScript**: Strict mode enabled. Always use types/interfaces; never use `any`, `@ts-ignore`, or `@ts-expect-error`.
- **Indentation**: 2 spaces (no tabs).
- **Quotes**: Single quotes for strings/imports in TS/TSX files.
- **Component Filenames**: PascalCase (e.g., `MainScreen.tsx`, `TodoCard.tsx`).
- **Hook Filenames**: camelCase with `use` prefix (e.g., `useContent.ts`, `useTodos.ts`).
- **Imports**: Use `@/` path alias for project-root imports. Group imports: 1) React/Next.js, 2) External libraries, 3) Internal components, 4) Types/interfaces.
- **Exports**: Use named exports for components/functions. Use default export only for page components in `app/`.

## Component Patterns
- **UI Components** (`components/ui/`): Use `React.forwardRef` for composability. Set `displayName`. Use `cn()` from `lib/utils.ts` for className merging (Tailwind + clsx + tailwind-merge).
- **Feature Components**: Define props as interfaces. Keep presentational logic separate from business logic.
- **Accessibility**: Add `aria-hidden="true"` to decorative icons. Use semantic HTML. Add skip links in layout.

## State Management
- **Client State**: Zustand store in `lib/store.ts`. Actions should be async if they touch IndexedDB. Initialize store on app mount.
- **Server State**: TanStack Query (React Query) via custom hooks in `hooks/`.
  - Use query key factories (e.g., `todoKeys.all`, `todoKeys.list`, `todoKeys.detail`).
  - See `USAGE.md` for exact query key structures and caching strategies.
- **Optimistic Updates**: Use `onMutate`/`onError`/`onSettled` in mutations for immediate UI feedback.

## Data Persistence & Cloud Sync
- **Local-First**: Primary storage is IndexedDB (Dexie.js) in `lib/db.ts`.
- **Cloud Sync**: Supports AWS S3, Google Drive, OneDrive via `lib/cloud/`.
  - Sync logic resides in `lib/sync.ts`.
  - Credentials managed via client-side settings (no backend database).
- **Validation**: All external data (API/DB) must be validated with Zod schemas in `lib/validation.ts`.

## API Routes
- Location: `app/api/[route]/route.ts`.
- Set `export const runtime = 'nodejs'` for Node.js runtime.
- Use `export const dynamic = 'force-static'` and `export const revalidate = N` for static caching.
- Validate path parameters (e.g., locale whitelist `['ko', 'en']`) to prevent path traversal.
- Return `NextResponse.json()` with appropriate headers (Cache-Control, Content-Type).

## Error Handling & Notifications
- Use `try/catch` for async operations. Log errors with `console.error`.
- Toast notifications via `lib/toast.ts` functions: `showSuccess`, `showError`, `showInfo`, `showWarning`, `showConfirm`, `showLoading`.
- User-facing errors should use toasts, not alerts.

## Styling
- Tailwind CSS v4 utility classes. Group related classes for readability.
- Use semantic color tokens: `text-primary`, `text-secondary`, `bg-surface`, `bg-surface-muted`, `border-border`, `text-brand-500`.
- Avoid inline styles. Use `className` with Tailwind classes.
- Responsive design: Mobile-first approach (base styles → `sm:` → `md:` → `lg:` breakpoints).

## Security
- Validate all user inputs with Zod schemas. XSS prevention in `lib/validation.ts` (`SpecialEventSchema`).
- API routes: Whitelist allowed values for dynamic path segments.
- Never expose sensitive data in client-side code.

## Project Conventions
- **Locale Whitelist**: `['ko', 'en']` in API routes. Keep in sync with `public/content/` files.
- **PWA**: Assets in `public/`. Service Worker registered in `components/ServiceWorkerRegister.tsx`.
- **Icons**: Lucide React. Import named components (e.g., `import { Coffee, Eye } from 'lucide-react'`).
- **Intl**: Use `toLocaleDateString`/`toLocaleTimeString` with `'ko-KR'` for Korean date formatting.

## Common Patterns
```typescript
// Query key factory for TanStack Query (from USAGE.md)
export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  detail: (id: string) => [...todoKeys.all, 'detail', id] as const,
}

// Custom hook with query
export function useContent(locale: string = 'ko') {
  return useQuery({
    queryKey: contentKeys.locale(locale),
    queryFn: () => fetchContent(locale),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
  })
}

// Validate before saving to IndexedDB
export async function saveTodo(todo: TodoData): Promise<string> {
  const validated = TodoDataSchema.parse(todo)
  return await getDB().todos.put(validated)
}

// Async error handling with toast
const handleCreateTodo = async () => {
  try {
    const todo = await createDailyTodo()
    router.push(`/todo/${todo.id}`)
  } catch {
    showError('To-do 생성 중 오류가 발생했습니다', '다시 시도해주세요.')
  }
}
```

## Performance Guidelines
- **Lighthouse Targets**: Performance > 90, Accessibility > 95, PWA > 90.
- Use TanStack Query for caching (1 hour for content, 5 min for todos).
- Optimize package imports in Next.js config (lucide-react already configured).
- Use `React.memo` or `useMemo` for expensive computations.
- Implement code splitting with dynamic imports for large components.

## Accessibility Guidelines
- All interactive elements must be keyboard accessible.
- Use semantic HTML (button, nav, main, header, footer).
- Add ARIA labels to icon-only buttons.
- Ensure color contrast meets WCAG AA standards.
- Test with screen readers when adding complex components.

## Commit & Pull Request Guidelines
- **Commit Messages**: Short, imperative subject line (e.g., "Fix API route path validation"). Describe what changed, not why.
- **PRs**: Include summary, verification steps (`npx vitest run` + manual checklist from `BROWSER_TEST_GUIDE.md`), and screenshots for UI changes.

## Configuration Notes
- **Next.js**: v16.1.1 with Turbopack enabled. `next.config.ts` sets `reactStrictMode: true`, `poweredByHeader: false`.
- **TypeScript**: `tsconfig.json` with `strict: true`, path alias `@/*` pointing to root.
- **ESLint**: Flat config using `eslint.config.mjs`. Extends `next/core-web-vitals` and `next/typescript`.
- **Tailwind CSS**: v4.1. Configuration in `tailwind.config.ts`.
