# Dropbox 프로바이더 + 세션 범위 양방향 자동 동기화 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dropbox를 CloudProvider로 추가하고, 로그인된 세션 동안 편집 시 자동 push + 앱 열 때 자동 pull 하는 양방향 자동 동기화를 붙인다.

**Architecture:** 기존 `CloudProvider` 인터페이스에 `DropboxProvider`를 추가(Google/OneDrive 미러). 세션 범위 in-memory 싱글톤(`activeProvider`)이 로그인된 프로바이더를 앱 전역에 노출한다. `sync-engine`이 디바운스 push와 pull을 담당하고, `Providers.tsx`가 TanStack Query `MutationCache`를 구독해 todo 변경 시 디바운스 push를, 마운트 시 pull을 호출한다. 자동 동기화는 고정 파일 `motivation-sync.json` 하나를 last-write-wins로 덮어쓴다.

**Tech Stack:** Next.js 16 / React 19, TanStack Query v5, Dexie(IndexedDB), Dropbox HTTP API v2, Vitest.

## Global Constraints

- 런타임/패키지 매니저: **Bun** (`bun test`, `bun run build`, `bun run lint`).
- 새 의존성 추가 금지 — Dropbox는 `fetch`로 직접 호출(기존 google/onedrive와 동일).
- OAuth는 implicit grant(`response_type=token`) + 기존 팝업 흐름(`lib/auth.ts initiateOAuth`) 재사용. 토큰은 세션 메모리만, 영속 저장 금지.
- 자동 pull은 `importData('merge')`(additive)만 사용 — `overwrite`는 자동 경로에서 절대 금지.
- 자동 동기화 대상 파일명 상수: `motivation-sync.json`.
- 테스트는 기존 `lib/cloud/__tests__/google.test.ts` 패턴(`global.fetch = vi.fn()`)을 따른다.
- 한국어 사용자 문구 유지(toast 메시지 등).

---

### Task 1: DropboxProvider

**Files:**
- Create: `lib/cloud/dropbox.ts`
- Test: `lib/cloud/__tests__/dropbox.test.ts`

**Interfaces:**
- Consumes: `CloudProvider`, `CloudProviderType`, `CloudFile` from `./types`; `SyncData` from `@/lib/types`.
- Produces: `export class DropboxProvider implements CloudProvider` with constructor `(token?: string)`, methods `isAuthenticated()`, `login()`, `logout()`, `setToken(token)`, `upload(data, filename='motivation-sync.json'): Promise<string>`, `download(fileId: string): Promise<SyncData>`, `list(): Promise<CloudFile[]>`. `name='Dropbox'`, `type='dropbox'`.

> NOTE: `'dropbox'`는 아직 `CloudProviderType`에 없다. Task 6에서 `lib/cloud/types.ts`의 union에 추가한다. 이 타입 추가를 Task 1에서 같이 해도 되지만, 타입 변경은 UI 작업과 함께 Task 6에 둔다. **Task 1 구현 시 임시로** `lib/cloud/types.ts`의 `CloudProviderType`에 `| 'dropbox'`를 먼저 추가하라(아래 Step 0).

- [ ] **Step 0: `CloudProviderType`에 `'dropbox'` 추가**

`lib/cloud/types.ts` 3번째 줄을 수정:

```typescript
export type CloudProviderType = 's3' | 'google' | 'onedrive' | 'filesystem' | 'dropbox'
```

- [ ] **Step 1: 실패하는 테스트 작성**

Create `lib/cloud/__tests__/dropbox.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { DropboxProvider } from '../dropbox'
import { SyncData } from '@/lib/types'

global.fetch = vi.fn()

const mockData = { metadata: { deviceId: 'test' }, todos: [], settings: {} } as unknown as SyncData

describe('DropboxProvider', () => {
  let provider: DropboxProvider

  beforeEach(() => {
    provider = new DropboxProvider('fake-token')
    vi.clearAllMocks()
  })

  it('is authenticated when token is provided', () => {
    expect(provider.isAuthenticated()).toBe(true)
  })

  it('uploads to the Dropbox content endpoint with overwrite mode', async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'id:abc', name: 'motivation-sync.json' }),
    })

    const id = await provider.upload(mockData)

    expect(id).toBe('id:abc')
    const [url, init] = (global.fetch as Mock).mock.calls[0]
    expect(url).toBe('https://content.dropboxapi.com/2/files/upload')
    expect(init.method).toBe('POST')
    expect(init.headers.Authorization).toBe('Bearer fake-token')
    expect(JSON.parse(init.headers['Dropbox-API-Arg'])).toMatchObject({
      path: '/motivation-sync.json',
      mode: 'overwrite',
    })
  })

  it('lists files newest first', async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        entries: [
          { '.tag': 'file', id: 'id:1', name: 'old.json', server_modified: '2024-01-01T00:00:00Z' },
          { '.tag': 'file', id: 'id:2', name: 'motivation-sync.json', server_modified: '2024-06-01T00:00:00Z' },
        ],
      }),
    })

    const files = await provider.list()
    expect(files).toHaveLength(2)
    expect(files[0].name).toBe('motivation-sync.json') // newest first
  })

  it('throws with the status code on a failed upload (for 401 detection)', async () => {
    (global.fetch as Mock).mockResolvedValue({ ok: false, status: 401, statusText: 'Unauthorized' })
    await expect(provider.upload(mockData)).rejects.toThrow(/401/)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `bun test dropbox`
Expected: FAIL — `Cannot find module '../dropbox'`.

- [ ] **Step 3: 최소 구현 작성**

Create `lib/cloud/dropbox.ts`:

```typescript
import { CloudProvider, CloudProviderType, CloudFile } from './types'
import { SyncData } from '@/lib/types'

interface DropboxEntry {
  '.tag': string
  id: string
  name: string
  server_modified: string
}

export class DropboxProvider implements CloudProvider {
  name = 'Dropbox'
  type: CloudProviderType = 'dropbox'
  private accessToken: string | null = null

  constructor(token?: string) {
    this.accessToken = token || null
  }

  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  async login(): Promise<void> {
    throw new Error('Login should be handled by UI component')
  }

  async logout(): Promise<void> {
    this.accessToken = null
  }

  setToken(token: string) {
    this.accessToken = token
  }

  async upload(data: SyncData, filename: string = 'motivation-sync.json'): Promise<string> {
    if (!this.accessToken) throw new Error('Not authenticated')

    const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Dropbox-API-Arg': JSON.stringify({ path: `/${filename}`, mode: 'overwrite', mute: true }),
        'Content-Type': 'application/octet-stream',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Dropbox upload failed: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    return result.id
  }

  async list(): Promise<CloudFile[]> {
    if (!this.accessToken) throw new Error('Not authenticated')

    const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: '' }),
    })

    if (!response.ok) throw new Error(`Dropbox list failed: ${response.status}`)

    const result = await response.json()
    return (result.entries as DropboxEntry[])
      .filter((e) => e['.tag'] === 'file')
      .map((e) => ({ id: e.id, name: e.name, updatedAt: e.server_modified }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) // newest first
  }

  async download(fileId: string): Promise<SyncData> {
    if (!this.accessToken) throw new Error('Not authenticated')

    const response = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Dropbox-API-Arg': JSON.stringify({ path: fileId }),
      },
    })

    if (!response.ok) throw new Error(`Dropbox download failed: ${response.status}`)
    return await response.json()
  }
}
```

> 구현 검증 노트: Dropbox 앱은 "App folder" 권한 + scope `files.content.write files.content.read`로 설정해야 `path: ''`(앱 폴더 루트)와 `/motivation-sync.json`이 동작한다. download의 `path`는 list가 준 `id:...` 형식을 그대로 받는다. 엔드포인트는 구현 시 https://www.dropbox.com/developers/documentation/http/documentation 로 최종 확인.

- [ ] **Step 4: 테스트 통과 확인**

Run: `bun test dropbox`
Expected: PASS (4 tests).

- [ ] **Step 5: 커밋**

```bash
git add lib/cloud/dropbox.ts lib/cloud/__tests__/dropbox.test.ts lib/cloud/types.ts
git commit -m "feat(cloud): add DropboxProvider"
```

---

### Task 2: sync.ts — SyncData를 직접 받는 importSyncData 노출

엔진의 pull이 File 래핑 없이 SyncData를 merge할 수 있게 한다. 기존 `importData(file, strategy)`는 이 함수를 재사용하도록 리팩터.

**Files:**
- Modify: `lib/sync.ts` (`importData` 부근)
- Test: `lib/__tests__/sync-import.test.ts` (Create)

**Interfaces:**
- Produces: `export async function importSyncData(data: SyncData, strategy: SyncStrategy = 'merge'): Promise<void>` — `data.metadata` 존재 + `Array.isArray(data.todos)` 검증 후 strategy에 따라 `applySyncData`/`mergeSyncData` 호출.
- `importData(file, strategy)`는 내부적으로 `JSON.parse(text)` 후 `importSyncData(data, strategy)` 호출하도록 변경.

- [ ] **Step 1: 실패하는 테스트 작성**

Create `lib/__tests__/sync-import.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'

// lib/db는 브라우저(IndexedDB) 의존이므로 모킹한다.
const bulkSaveTodos = vi.fn()
const setSetting = vi.fn()
const getAllTodos = vi.fn(async () => [])
vi.mock('../db', () => ({
  getAllTodos: (...a: unknown[]) => getAllTodos(...a),
  bulkSaveTodos: (...a: unknown[]) => bulkSaveTodos(...a),
  setSetting: (...a: unknown[]) => setSetting(...a),
  getSetting: vi.fn(),
  deleteSetting: vi.fn(),
}))

import { importSyncData } from '../sync'
import type { SyncData } from '../types'

const data = {
  metadata: { deviceId: 'd1', deviceName: 'x', lastSyncAt: 't', version: 1 },
  todos: [{ id: '1', date: 'today', title: 't', content: 'c', createdAt: 'now' }],
  settings: {},
} as unknown as SyncData

describe('importSyncData', () => {
  it('merges remote todos that are not local', async () => {
    getAllTodos.mockResolvedValueOnce([])
    await importSyncData(data, 'merge')
    expect(bulkSaveTodos).toHaveBeenCalledWith(data.todos)
  })

  it('rejects malformed data', async () => {
    await expect(importSyncData({} as SyncData, 'merge')).rejects.toThrow(/Invalid/)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `bun test sync-import`
Expected: FAIL — `importSyncData` is not exported.

- [ ] **Step 3: 최소 구현 — `lib/sync.ts` 수정**

기존 `importData` 함수를 다음으로 교체(검증 로직을 `importSyncData`로 추출):

```typescript
export async function importSyncData(data: SyncData, strategy: SyncStrategy = 'merge'): Promise<void> {
  if (!data.metadata || !Array.isArray(data.todos)) {
    throw new Error('Invalid sync file format')
  }

  if (strategy === 'overwrite') {
    await applySyncData(data)
  } else {
    await mergeSyncData(data)
  }
}

export async function importData(file: File, strategy: SyncStrategy = 'merge'): Promise<void> {
  const text = await file.text()
  const data = JSON.parse(text) as SyncData
  await importSyncData(data, strategy)
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `bun test sync-import`
Expected: PASS (2 tests).

- [ ] **Step 5: 커밋**

```bash
git add lib/sync.ts lib/__tests__/sync-import.test.ts
git commit -m "refactor(sync): expose importSyncData(SyncData) for the sync engine"
```

---

### Task 3: activeProvider 세션 싱글톤

**Files:**
- Create: `lib/cloud/activeProvider.ts`
- Test: `lib/cloud/__tests__/activeProvider.test.ts`

**Interfaces:**
- Produces: `setActiveProvider(p: CloudProvider): void`, `getActiveProvider(): CloudProvider | null`, `clearActiveProvider(): void`. 모듈 레벨 in-memory 변수(영속 X).

- [ ] **Step 1: 실패하는 테스트 작성**

Create `lib/cloud/__tests__/activeProvider.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { setActiveProvider, getActiveProvider, clearActiveProvider } from '../activeProvider'
import type { CloudProvider } from '../types'

const fake = { name: 'Fake', type: 'dropbox' } as unknown as CloudProvider

describe('activeProvider singleton', () => {
  beforeEach(() => clearActiveProvider())

  it('starts null', () => {
    expect(getActiveProvider()).toBeNull()
  })

  it('stores and clears the active provider', () => {
    setActiveProvider(fake)
    expect(getActiveProvider()).toBe(fake)
    clearActiveProvider()
    expect(getActiveProvider()).toBeNull()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `bun test activeProvider`
Expected: FAIL — module not found.

- [ ] **Step 3: 최소 구현 작성**

Create `lib/cloud/activeProvider.ts`:

```typescript
import type { CloudProvider } from './types'

// ponytail: 세션 범위 in-memory 싱글톤. 토큰 영속은 의도적으로 안 함(implicit OAuth,
// 만료 시 재로그인). 영속이 필요해지면 여기에 sessionStorage 백업을 추가한다.
let active: CloudProvider | null = null

export function setActiveProvider(provider: CloudProvider): void {
  active = provider
}

export function getActiveProvider(): CloudProvider | null {
  return active
}

export function clearActiveProvider(): void {
  active = null
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `bun test activeProvider`
Expected: PASS (2 tests).

- [ ] **Step 5: 커밋**

```bash
git add lib/cloud/activeProvider.ts lib/cloud/__tests__/activeProvider.test.ts
git commit -m "feat(cloud): session-scoped activeProvider singleton"
```

---

### Task 4: sync-engine (디바운스 push + pull + 401 처리)

**Files:**
- Create: `lib/sync-engine.ts`
- Test: `lib/__tests__/sync-engine.test.ts`

**Interfaces:**
- Consumes: `getActiveProvider`, `clearActiveProvider` from `./cloud/activeProvider`; `exportData`, `importSyncData` from `./sync`; `showError` from `./toast`.
- Produces:
  - `export const SYNC_FILENAME = 'motivation-sync.json'`
  - `export function schedulePush(): void` — 3초 디바운스 후 `runPush()`.
  - `export async function runPush(): Promise<void>` — in-flight 락 + dirty 재실행. 활성 프로바이더 없으면 no-op. 401 시 `clearActiveProvider()` + toast.
  - `export async function pullOnce(): Promise<void>` — 활성 프로바이더 없으면 no-op. `list()` → `SYNC_FILENAME` 파일(없으면 첫 항목) `download` → `importSyncData(data, 'merge')`.
  - `export const PUSH_DEBOUNCE_MS = 3000`

- [ ] **Step 1: 실패하는 테스트 작성**

Create `lib/__tests__/sync-engine.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

const exportData = vi.fn(async () => ({ metadata: {}, todos: [], settings: {} }))
const importSyncData = vi.fn(async () => {})
vi.mock('../sync', () => ({
  exportData: (...a: unknown[]) => exportData(...a),
  importSyncData: (...a: unknown[]) => importSyncData(...a),
}))

const showError = vi.fn()
vi.mock('../toast', () => ({ showError: (...a: unknown[]) => showError(...a) }))

import { setActiveProvider, clearActiveProvider } from '../cloud/activeProvider'
import { schedulePush, runPush, pullOnce, PUSH_DEBOUNCE_MS, SYNC_FILENAME } from '../sync-engine'
import type { CloudProvider } from '../cloud/types'

function makeProvider(over: Partial<CloudProvider> = {}): CloudProvider {
  return {
    name: 'Fake', type: 'dropbox',
    isAuthenticated: () => true,
    login: async () => {}, logout: async () => {},
    upload: vi.fn(async () => 'id:1'),
    download: vi.fn(async () => ({ metadata: {}, todos: [], settings: {} }) as never),
    list: vi.fn(async () => [{ id: 'id:1', name: SYNC_FILENAME, updatedAt: 't' }]),
    ...over,
  } as CloudProvider
}

describe('sync-engine', () => {
  beforeEach(() => { clearActiveProvider(); vi.clearAllMocks(); vi.useRealTimers() })

  it('schedulePush coalesces rapid calls into one upload', async () => {
    vi.useFakeTimers()
    const p = makeProvider()
    setActiveProvider(p)

    schedulePush(); schedulePush(); schedulePush()
    expect(p.upload).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(PUSH_DEBOUNCE_MS)
    expect(p.upload).toHaveBeenCalledTimes(1)
    expect((p.upload as ReturnType<typeof vi.fn>).mock.calls[0][1]).toBe(SYNC_FILENAME)
  })

  it('runPush is a no-op when no provider is connected', async () => {
    await runPush() // no throw
    expect(exportData).not.toHaveBeenCalled()
  })

  it('clears the provider and toasts on a 401 upload error', async () => {
    const p = makeProvider({ upload: vi.fn(async () => { throw new Error('Dropbox upload failed: 401') }) })
    setActiveProvider(p)

    await runPush()

    const { getActiveProvider } = await import('../cloud/activeProvider')
    expect(getActiveProvider()).toBeNull()
    expect(showError).toHaveBeenCalled()
  })

  it('pullOnce downloads the canonical file and merges it', async () => {
    const p = makeProvider()
    setActiveProvider(p)
    await pullOnce()
    expect(p.download).toHaveBeenCalledWith('id:1')
    expect(importSyncData).toHaveBeenCalledWith(expect.anything(), 'merge')
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `bun test sync-engine`
Expected: FAIL — module not found.

- [ ] **Step 3: 최소 구현 작성**

Create `lib/sync-engine.ts`:

```typescript
import { getActiveProvider, clearActiveProvider } from './cloud/activeProvider'
import { exportData, importSyncData } from './sync'
import { showError } from './toast'

export const SYNC_FILENAME = 'motivation-sync.json'
export const PUSH_DEBOUNCE_MS = 3000

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let inFlight = false
let dirty = false

export function schedulePush(): void {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    void runPush()
  }, PUSH_DEBOUNCE_MS)
}

export async function runPush(): Promise<void> {
  const provider = getActiveProvider()
  if (!provider) return

  if (inFlight) {
    dirty = true // 업로드 중이면 끝난 뒤 한 번 더
    return
  }

  inFlight = true
  try {
    const data = await exportData()
    await provider.upload(data, SYNC_FILENAME)
  } catch (err) {
    if (err instanceof Error && /401|unauthor/i.test(err.message)) {
      clearActiveProvider()
      showError('클라우드 재연결 필요', '세션이 만료되었습니다. 설정에서 다시 로그인해주세요.')
    } else {
      console.error('[sync-engine] push 실패:', err)
    }
  } finally {
    inFlight = false
    if (dirty) {
      dirty = false
      void runPush()
    }
  }
}

export async function pullOnce(): Promise<void> {
  const provider = getActiveProvider()
  if (!provider) return

  try {
    const files = await provider.list()
    if (files.length === 0) return
    const target = files.find((f) => f.name === SYNC_FILENAME) ?? files[0]
    const data = await provider.download(target.id)
    await importSyncData(data, 'merge')
  } catch (err) {
    console.error('[sync-engine] pull 실패:', err)
  }
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `bun test sync-engine`
Expected: PASS (4 tests).

- [ ] **Step 5: 커밋**

```bash
git add lib/sync-engine.ts lib/__tests__/sync-engine.test.ts
git commit -m "feat(sync): debounced push + pull engine with 401 handling"
```

---

### Task 5: Providers 배선 — MutationCache 구독으로 자동 push + 마운트 pull

**Files:**
- Modify: `components/Providers.tsx`
- Modify: `hooks/useTodos.ts` (네 mutation에 `mutationKey: ['todos']` 추가)
- Create: `lib/__tests__/shouldSyncMutation.test.ts`
- Create: `lib/sync-trigger.ts` (구독 필터 순수 함수)

**Interfaces:**
- Consumes: `schedulePush`, `pullOnce` from `@/lib/sync-engine`.
- Produces: `export function shouldSyncMutation(event): boolean` in `lib/sync-trigger.ts` — `MutationCache` 이벤트가 "성공한 todo mutation"이면 true.

- [ ] **Step 1: 실패하는 테스트 작성**

Create `lib/__tests__/shouldSyncMutation.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { shouldSyncMutation } from '../sync-trigger'

const ev = (over: Record<string, unknown>) => ({
  type: 'updated',
  mutation: { options: { mutationKey: ['todos'] }, state: { status: 'success' } },
  ...over,
}) as never

describe('shouldSyncMutation', () => {
  it('true for a successful todo mutation update', () => {
    expect(shouldSyncMutation(ev({}))).toBe(true)
  })
  it('false when status is not success', () => {
    expect(shouldSyncMutation(ev({ mutation: { options: { mutationKey: ['todos'] }, state: { status: 'pending' } } }))).toBe(false)
  })
  it('false for non-todo mutation keys', () => {
    expect(shouldSyncMutation(ev({ mutation: { options: { mutationKey: ['other'] }, state: { status: 'success' } } }))).toBe(false)
  })
  it('false for events without a mutationKey', () => {
    expect(shouldSyncMutation(ev({ mutation: { options: {}, state: { status: 'success' } } }))).toBe(false)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `bun test shouldSyncMutation`
Expected: FAIL — module not found.

- [ ] **Step 3: 순수 필터 구현**

Create `lib/sync-trigger.ts`:

```typescript
import type { MutationCacheNotifyEvent } from '@tanstack/react-query'

// MutationCache 이벤트가 "성공한 todo mutation"인지 판별. todo 쓰기는 모두
// mutationKey ['todos', ...]를 달고 있다(hooks/useTodos.ts).
export function shouldSyncMutation(event: MutationCacheNotifyEvent): boolean {
  if (event.type !== 'updated') return false
  const key = event.mutation.options.mutationKey
  if (!Array.isArray(key) || key[0] !== 'todos') return false
  return event.mutation.state.status === 'success'
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `bun test shouldSyncMutation`
Expected: PASS (4 tests).

- [ ] **Step 5: todo mutation에 mutationKey 부여**

`hooks/useTodos.ts`의 네 `useMutation` 호출 각각에 `mutationKey: todoKeys.all`을 추가한다. 예 — `createMutation`:

```typescript
  const createMutation = useMutation({
    mutationKey: todoKeys.all,
    mutationFn: async ({ content, specialEvent }: UseDailyTodoParams) => {
```

`useSaveTodo`, `useDeleteTodo`, `useClearTodos`의 `useMutation`에도 동일하게 첫 옵션으로 `mutationKey: todoKeys.all` 추가. (`todoKeys.all`은 `['todos']`)

- [ ] **Step 6: Providers에 구독 + pull 배선**

`components/Providers.tsx`를 수정 — import 추가:

```typescript
import { schedulePush, pullOnce } from '@/lib/sync-engine'
import { shouldSyncMutation } from '@/lib/sync-trigger'
```

기존 seedContent useEffect를 다음으로 교체:

```typescript
  // 앱 시작 시 콘텐츠 시드 + (연결돼 있으면) 원격 변경 pull
  useEffect(() => {
    seedContent('ko').catch((err) => console.error('[ContentSeed] 시드 실패:', err))
    void pullOnce()
  }, [])

  // todo 변경 시 디바운스 push (활성 프로바이더 없으면 엔진이 no-op)
  useEffect(() => {
    const unsub = queryClient.getMutationCache().subscribe((event) => {
      if (shouldSyncMutation(event)) schedulePush()
    })
    return unsub
  }, [queryClient])
```

- [ ] **Step 7: 전체 테스트 + 빌드 확인**

Run: `bun test && bun run build`
Expected: 모든 테스트 PASS, build ✓ (타입 에러 없음).

- [ ] **Step 8: 커밋**

```bash
git add components/Providers.tsx hooks/useTodos.ts lib/sync-trigger.ts lib/__tests__/shouldSyncMutation.test.ts
git commit -m "feat(sync): auto-push on todo mutations + pull on app open"
```

---

### Task 6: Dropbox OAuth 설정 + SyncSettings Dropbox 탭 + 로그인 시 setActiveProvider

**Files:**
- Modify: `lib/auth.ts` (`OAUTH_CONFIG`, `initiateOAuth` 시그니처)
- Modify: `components/SyncSettings.tsx` (Dropbox 탭, 로그인 핸들러, setActiveProvider, iCloud 문구)

**Interfaces:**
- Consumes: `DropboxProvider` from `@/lib/cloud/dropbox`; `setActiveProvider` from `@/lib/cloud/activeProvider`; `pullOnce` from `@/lib/sync-engine`.
- Produces: `OAUTH_CONFIG.dropbox`; `initiateOAuth`가 `'dropbox'`도 받도록 union 확장.

- [ ] **Step 1: auth.ts에 Dropbox OAuth 추가**

`lib/auth.ts` 수정 — `OAUTH_CONFIG`에 dropbox 추가, `initiateOAuth`/`OAUTH_CONFIG` 관련 타입 union에 `'dropbox'` 추가:

```typescript
export const OAUTH_CONFIG = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scope: 'https://www.googleapis.com/auth/drive.file',
  },
  onedrive: {
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    scope: 'Files.ReadWrite.AppFolder User.Read',
  },
  dropbox: {
    authUrl: 'https://www.dropbox.com/oauth2/authorize',
    scope: 'files.content.write files.content.read',
  },
}

export function initiateOAuth(provider: 'google' | 'onedrive' | 'dropbox', clientId: string): Promise<string> {
```

함수 본문은 그대로(implicit flow `response_type=token` 재사용). `prompt=consent`는 google 전용 분기라 변경 불필요.

- [ ] **Step 2: SyncSettings — import + Dropbox 상태**

`components/SyncSettings.tsx` import 추가:

```typescript
import { DropboxProvider } from '@/lib/cloud/dropbox'
import { setActiveProvider } from '@/lib/cloud/activeProvider'
import { pullOnce } from '@/lib/sync-engine'
```

상태 추가(`oneDriveClientId` 근처):

```typescript
  const [dropboxClientId, setDropboxClientId] = useState('')
```

`useEffect`의 client id 로드부에 추가:

```typescript
    setDropboxClientId(localStorage.getItem('dropbox_client_id') || '')
```

- [ ] **Step 3: handleOAuthLogin을 dropbox까지 확장 + setActiveProvider**

`handleOAuthLogin` 시그니처와 본문 수정:

```typescript
  const handleOAuthLogin = async (provider: 'google' | 'onedrive' | 'dropbox') => {
    const clientId =
      provider === 'google' ? googleClientId
      : provider === 'onedrive' ? oneDriveClientId
      : dropboxClientId
    if (!clientId) {
      return showError('Client ID 필요', '설정에서 Client ID를 입력해주세요.')
    }

    try {
      setIsLoading(true)
      const token = await initiateOAuth(provider, clientId)

      localStorage.setItem(`${provider}_client_id`, clientId)

      let newProvider: CloudProvider
      if (provider === 'google') newProvider = new GoogleDriveProvider(token)
      else if (provider === 'onedrive') newProvider = new OneDriveProvider(token)
      else newProvider = new DropboxProvider(token)

      setActiveProvider(newProvider)   // 앱 전역 싱글톤 — 자동 동기화가 사용
      setActiveProviderState(newProvider)
      showSuccess('로그인 성공', `${newProvider.name}와 연결되었습니다.`)
      void pullOnce()                  // 로그인 직후 원격 변경 가져오기
    } catch (error) {
      showError('로그인 실패', error instanceof Error ? error.message : '인증 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }
```

> NOTE: 기존 컴포넌트 state `activeProvider`/`setActiveProvider`는 이름이 싱글톤과 충돌한다. 컴포넌트의 `useState` 이름을 `activeProviderState`/`setActiveProviderState`로 바꾸고, 싱글톤 import를 `setActiveProvider`로 둔다. 파일 내 `activeProvider` 참조(탭의 `activeProvider?.type === ...`, `handleCloudBackup`/`handleCloudRestore`의 `activeProvider`)를 모두 `activeProviderState`로 치환한다. `<Tabs onValueChange={() => setActiveProvider(null)}>`는 `setActiveProviderState(null)`로.

- [ ] **Step 4: Dropbox 탭 추가**

`TabsList`의 `grid-cols-2 md:grid-cols-4`를 `md:grid-cols-5`로 바꾸고 트리거 추가:

```tsx
              <TabsTrigger value="dropbox" className="text-sm font-bold">Dropbox</TabsTrigger>
```

onedrive `TabsContent` 다음에 Dropbox 탭 추가(OneDrive 탭 미러, provider 명/placeholder만 변경):

```tsx
            <TabsContent value="dropbox" className="py-8 text-center space-y-6">
              <div className="flex flex-col items-center gap-6">
                <div className="p-6 bg-muted/40 rounded-full">
                  <Cloud className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-xl">Dropbox 연동</h3>

                <div className="w-full max-w-md space-y-3 text-left">
                  <label htmlFor="dropbox-client-id" className="text-sm font-medium text-muted-foreground ml-1">Dropbox App Key</label>
                  <Input
                    id="dropbox-client-id"
                    placeholder="xxxxxxxxxxxxxxx"
                    value={dropboxClientId}
                    onChange={(e) => setDropboxClientId(e.target.value)}
                    className="h-12 text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    * Dropbox App Console에서 발급한 App key가 필요합니다. (App folder 권한)
                  </p>
                </div>

                {activeProviderState?.type === 'dropbox' ? (
                  <div className="space-y-6 w-full max-w-md">
                    <div className="flex items-center justify-center gap-2 text-green-500 bg-green-500/10 p-3 rounded-xl text-sm font-bold">
                      <Check className="h-5 w-5" />
                      연결됨 · 편집 시 자동 동기화
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button onClick={handleCloudBackup} disabled={isLoading} className="h-12 text-sm font-bold bg-amber-500 text-stone-950 hover:bg-amber-400">지금 백업</Button>
                      <Button variant="outline" onClick={handleCloudRestore} disabled={isLoading} className="h-12 text-sm font-bold border-border text-foreground hover:bg-muted/50">지금 복원</Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleOAuthLogin('dropbox')}
                    disabled={isLoading || !dropboxClientId}
                    className="w-full max-w-md h-12 bg-amber-500 text-stone-950 hover:bg-amber-400 text-sm font-bold rounded-full"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Dropbox 로그인
                  </Button>
                )}
              </div>
            </TabsContent>
```

- [ ] **Step 5: iCloud 탭 문구 보강(수동/네이티브 명시)**

iCloud `TabsContent`의 설명 `<p>`를 다음으로 교체:

```tsx
                <p className="text-base text-muted-foreground max-w-sm leading-relaxed">
                  iCloud는 웹앱이 직접 접근할 수 없습니다. <strong>&apos;내보내기&apos;</strong>로
                  파일을 <strong>iCloud Drive</strong> 폴더에 저장하면 모든 Apple 기기에서 열 수 있습니다.
                  (자동 동기화는 Dropbox/Google/OneDrive를 사용하세요.)
                </p>
```

- [ ] **Step 6: 빌드 + 수동 검증**

Run: `bun run build`
Expected: build ✓, 타입 에러 없음.

수동 검증(dev): `bun dev` → `/settings` → Dropbox 탭이 보이고 App key 입력 시 "Dropbox 로그인" 활성화. (실제 OAuth는 Dropbox App key 필요 — 없으면 UI 렌더까지만 확인.)

- [ ] **Step 7: 커밋**

```bash
git add lib/auth.ts components/SyncSettings.tsx
git commit -m "feat(sync): Dropbox OAuth + settings tab, wire active provider"
```

---

## Self-Review

**Spec coverage:**
- Dropbox 프로바이더 → Task 1 ✓
- 세션 범위 싱글톤 → Task 3 ✓
- 디바운스 push + pull + 401 → Task 4 ✓
- 양방향(push on edit / pull on open) → Task 4(pull) + Task 5(구독, 마운트 pull) + Task 6(로그인 후 pull) ✓
- MutationCache 구독 트리거 → Task 5 ✓
- 고정 파일 last-write-wins → Task 4 `SYNC_FILENAME` + Task 1 upload `mode:overwrite` ✓
- 수동 날짜별 백업 분리 유지 → 기존 `downloadSyncFile`/S3 dated 경로 미변경(건드리지 않음) ✓
- 데이터 손실 방지(merge만) → Task 4 `pullOnce`는 `'merge'` 고정 ✓
- iCloud 수동/네이티브 명시 → Task 6 Step 5 ✓
- 범위 밖(③/refresh/settings sync) → 어느 task도 건드리지 않음 ✓

**Placeholder scan:** 모든 step에 실제 코드/명령/기대출력 포함. TBD 없음.

**Type consistency:** `SYNC_FILENAME`(Task 4)을 Task 1 upload 기본값/Task 4에서 일관 사용. `setActiveProvider`(싱글톤, Task 3) vs 컴포넌트 state `setActiveProviderState`(Task 6) 이름 충돌을 Task 6 Step 3 NOTE에서 명시 해소. `shouldSyncMutation`(Task 5) 시그니처 일치. `importSyncData`(Task 2) → Task 4 소비 일치.

**잠재 리스크(구현자 주의):**
- Dropbox 엔드포인트/implicit grant 허용 여부는 구현 시 공식 문서로 확정(Task 1 NOTE).
- `MutationCacheNotifyEvent` 타입 import 경로는 `@tanstack/react-query` v5 기준. 빌드 시 타입 안 맞으면 `event: { type: string; mutation: { options: { mutationKey?: unknown }; state: { status: string } } }`로 좁혀 사용.
