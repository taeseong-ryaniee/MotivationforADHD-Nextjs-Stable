# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router routes, layouts, and API handlers (e.g., `app/api`, `app/history`, `app/todo/[id]`).
- `components/`: UI and feature components; shared UI primitives live in `components/ui/`.
- `hooks/`: React hooks (name with `useX`).
- `lib/`: core logic and utilities (`lib/db.ts`, `lib/store.ts`, `lib/utils.ts`).
- `public/`: static assets and PWA files (`public/icons`, `public/content`, `manifest.webmanifest`).

## Build, Test, and Development Commands
- `bun dev` or `npm run dev`: start the Next.js dev server at `http://localhost:3000`.
- `bun run build` or `npm run build`: production build.
- `bun start` or `npm run start`: serve the production build.
- `bun run lint` or `npm run lint`: run Next.js ESLint rules.

## Coding Style & Naming Conventions
- TypeScript with strict mode enabled; prefer types/interfaces over `any`.
- Indentation is 2 spaces, single quotes are standard in TS/TSX.
- Components use `PascalCase` filenames (e.g., `MainScreen.tsx`); hooks use `useCamelCase`.
- Use the `@/` path alias for project-root imports (configured in `tsconfig.json`).
- Styling is Tailwind CSS; keep utility classes grouped and avoid inline styles.

## Project Conventions
- API routes live in `app/api/.../route.ts`; content is served from `app/api/content/[locale]` and reads `public/content/{locale}.json`.
- Locale inputs are whitelisted (`ko`, `en`); keep additions in sync with `public/content/`.
- Client state: UI/stateful logic lives in the Zustand store (`lib/store.ts`).
- Data storage: Todos are persisted in IndexedDB via Dexie helpers in `lib/db.ts`; keep schema changes additive.
- Server state: TanStack Query handles cached content fetching and revalidation.

## Testing Guidelines
- No automated unit/integration tests are defined yet.
- Manual browser checks are documented in `BROWSER_TEST_GUIDE.md` (security, UX, accessibility, PWA, Lighthouse).
- If you add tests, follow the framework defaults and document the command in this file.

## Commit & Pull Request Guidelines
- Current history uses short, imperative commit subjects (e.g., “Correct code block syntax in README.md”).
- Keep commits focused and describe what changed, not why.
- PRs should include: a concise summary, steps to verify (`bun dev` + manual checklist), and screenshots for UI changes.

## Configuration Notes
- PWA assets live under `public/` and are referenced in `app/layout.tsx`.
- IndexedDB schema and client storage are defined in `lib/db.ts`; keep migrations additive.
