# components/feature/CLAUDE.md

Scope: this directory only. Every file here is a screen-level component mounted
by exactly one `app/` route via the shell pattern (see `app/CLAUDE.md`) — except
`PwaInstallPrompt` and `ThemeToggle`, which are small standalone widgets embedded
inside other screens/`AppShell`, not routed pages of their own.

## Where the "today" screen logic actually lives

`DashboardView` (mounted by `app/page.tsx`) is not a dumb wrapper — it's the
one place that decides which screen the user sees:

- `todayTodo` loading → spinner (deliberately covers both `isLoadingTodayTodo`
  and `isLoadingContent` together, to avoid a StartScreen→TodayTodoView flash)
- `todayTodo` exists → renders `TodayTodoView`
- otherwise → renders `StartScreen`

There's no separate route for "todo created today" vs. "not yet" — it's one
URL (`/`) with client-side conditional rendering. If you're looking for where
"create a todo" transitions into "view today's todo," it's this if/else in
`DashboardView`, not a router transition.

## Reuse, not duplication

`TodoDetailView` (mounted by `app/todo/[id]/page.tsx`) renders the *same*
`TodayTodoView` component `DashboardView` uses for today's todo — it just feeds
it a todo fetched by ID (`useTodo(id)`) instead of today's. Don't add a second
todo-editing UI here; extend `TodayTodoView`'s props instead.
