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
