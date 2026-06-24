# Task 4 Report: sync-engine (debounced push + pull + 401 handling)

## What Was Implemented

**Files created:**
- `lib/sync-engine.ts` — debounced push/pull engine module
- `lib/__tests__/sync-engine.test.ts` — 4 Vitest tests matching the brief verbatim

**Exports from `lib/sync-engine.ts`:**
- `SYNC_FILENAME = 'motivation-sync.json'`
- `PUSH_DEBOUNCE_MS = 3000`
- `schedulePush()` — 3s debounce, coalesces rapid calls
- `runPush()` — in-flight lock + dirty flag, no-op without provider, 401 → clearActiveProvider + showError
- `pullOnce()` — list → find SYNC_FILENAME (fallback first item) → download → importSyncData('merge')

## TDD RED/GREEN Evidence

### RED (Step 2)

```
$ bun test sync-engine
error: Cannot find module '../sync-engine' from '.../lib/__tests__/sync-engine.test.ts'
 0 pass / 1 fail / 1 error
```

### GREEN (Step 4)

`bunx vitest run` is the project's test runner (`bun test` invokes Bun's native runner which doesn't support `vi.advanceTimersByTimeAsync`; `bunx vitest run` is how all 11 existing test files run):

```
$ bunx vitest run --reporter=verbose lib/__tests__/sync-engine.test.ts
 ✓ sync-engine > schedulePush coalesces rapid calls into one upload 2ms
 ✓ sync-engine > runPush is a no-op when no provider is connected 0ms
 ✓ sync-engine > clears the provider and toasts on a 401 upload error 0ms
 ✓ sync-engine > pullOnce downloads the canonical file and merges it 1ms
 Test Files  1 passed (1) / Tests  4 passed (4)
```

### Full Suite (before commit)

```
$ bunx vitest run
 Test Files  12 passed (12)
      Tests  44 passed (44)
```

## Files Changed

| File | Action |
|------|--------|
| `lib/sync-engine.ts` | Created |
| `lib/__tests__/sync-engine.test.ts` | Created |

## Self-Review Findings

1. **`bun test` vs `bunx vitest run`**: The brief says `bun test sync-engine` but `bun test` runs Bun's native test runner (which has no `vi.advanceTimersByTimeAsync`). All 11 prior test files use Vitest imports; the correct command is `bunx vitest run`. This is a documentation issue in the brief, not an implementation issue.

2. **Module-level state isolation**: `inFlight`, `dirty`, and `debounceTimer` are module-level. Vitest module caching means state leaks between tests. The `beforeEach` clears the provider and mocks but does NOT reset `inFlight`/`dirty`. In the current test suite this is fine (no test leaves `inFlight=true`), but long-running dirty-flag tests could be fragile. A `resetState()` export could improve this in future.

3. **Implementation matches brief verbatim**: The implementation code in `lib/sync-engine.ts` is copied exactly from the brief's Step 3 specification. No deviations.

4. **Constraint compliance**:
   - No new dependencies added
   - `importSyncData` always called with `'merge'` strategy
   - 401 regex: `/401|unauthor/i` as specified

## Concerns

- **`bun test` incompatibility**: Brief says to use `bun test sync-engine` but `vi.advanceTimersByTimeAsync` only works under `bunx vitest`. Consider updating CLAUDE.md or the brief to clarify the test command. All tests pass under `bunx vitest run`.
- **Module state between test runs**: If future tests trigger `runPush` and leave `inFlight=true`, subsequent tests could silently skip uploads. Low risk given the current test order.

---

## Fix: Runner-Portable Debounce Test (appended)

### Problem
Under `bun test` (Bun's native runner), the coalescing test failed:
`TypeError: vi.advanceTimersByTimeAsync is not a function`
The other 3 tests passed. Total: 30 pass / 1 fail.

### Changes Made

**`lib/sync-engine.ts`** — made `delayMs` injectable with default:
```typescript
export function schedulePush(delayMs: number = PUSH_DEBOUNCE_MS): void {
```
Production callers still call `schedulePush()` with no argument.

**`lib/__tests__/sync-engine.test.ts`** — rewrote the coalescing test to use a real 10ms delay and a 40ms wait; removed `vi.useFakeTimers()`, `vi.useRealTimers()`, and `PUSH_DEBOUNCE_MS` import.

### Test Results

```
$ bun test sync-engine
bun test v1.3.14
 4 pass / 0 fail
Ran 4 tests across 1 file. [287.00ms]

$ bun test
bun test v1.3.14
 31 pass / 0 fail
Ran 31 tests across 9 files. [176.00ms]
```
