# lib/CLAUDE.md

Scope: top-level files in this directory only. `lib/cloud/` has its own
`CLAUDE.md`; see root `CLAUDE.md` for the overall data-flow/sync architecture.

- `db.ts` lazily initializes Dexie behind a getter (`let _db`, created on first
  access) specifically to avoid touching IndexedDB during SSR/import time —
  this getter is the actual mechanism behind the "IndexedDB is browser-only"
  rule in root `CLAUDE.md`. Adding a new table means updating this getter's
  type, not just calling `db.version(n).stores(...)`.
- `sync.ts` talks to `@aws-sdk/client-s3` directly. This is the one place S3
  is handled at all in the app — there's no `CloudProvider` implementation for
  it (see `lib/cloud/CLAUDE.md`), so don't expect S3 logic to show up there.
- `sync-trigger.ts`'s `shouldSyncMutation` decides "was this a todo write" by
  checking `mutation.options.mutationKey[0] === 'todos'` — a convention set by
  `hooks/useTodos.ts`'s query key factory, not enforced by any type. A new
  mutation hook that needs to trigger auto-push must use a `['todos', ...]`
  key, or `sync-engine.ts` will silently never push it.
- `todo-utils.ts` owns the `createdAt` (display string) vs. `createdAtMs`
  (epoch, sortable) split described in root `CLAUDE.md`'s IndexedDB Schema
  section — any new date-math helper belongs here, operating on `createdAtMs`.
- `toast.ts`, `utils.ts`, `nav.ts`, `types.ts`, `validation.ts` are small,
  single-purpose files (toast wrappers, `cn`/clipboard helpers, sidebar nav
  config, shared types, zod schemas) with no cross-file surprises — read them
  directly rather than looking for hidden coupling.
