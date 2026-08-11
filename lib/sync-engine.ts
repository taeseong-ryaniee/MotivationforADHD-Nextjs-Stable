import { getActiveProvider, clearActiveProvider } from './cloud/activeProvider'
import { exportData, importSyncData, isRemoteNewer } from './sync'
import type { CloudFile, CloudProvider } from './cloud/types'
import { showError } from './toast'

export const SYNC_FILENAME = 'motivation-sync.json'
export const PUSH_DEBOUNCE_MS = 3000

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let inFlight = false
let dirty = false

export function schedulePush(delayMs: number = PUSH_DEBOUNCE_MS): void {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    void runPush()
  }, delayMs)
}

// 원격 목록에서 쓸 파일을 고른다. pullOnce 와 pullBeforePush 가 같이 쓴다 — 선택 규칙이
// 두 곳에 복붙되면 한쪽만 고쳐지는 재발이 난다.
// 이름이 안 맞으면 첫 파일로 폴백하는 것은 출하된 pullOnce 의 동작 그대로다. 폴백이 필요한
// 상태는 가설이 아니다: lib/cloud/google.ts 와 lib/cloud/onedrive.ts 의 upload 기본 filename 이
// 'backup.json' 이라 원격 파일 이름이 motivation-sync.json 이 아닌 계정이 존재할 수 있다.
function pickSyncFile(files: CloudFile[]): CloudFile | undefined {
  return files.find((f) => f.name === SYNC_FILENAME) ?? files[0]
}

// 401 은 push·pull 두 경로에 공통이라 한 곳에서 처리한다.
// true = 인증 만료로 처리 완료. false = 그 밖의 실패이며, 추가 통지 여부는 호출부가 정한다.
function handleSyncError(err: unknown, context: 'push' | 'pull'): boolean {
  if (err instanceof Error && /401|unauthor/i.test(err.message)) {
    clearActiveProvider()
    showError('클라우드 재연결 필요', '세션이 만료되었습니다. 설정에서 다시 로그인해주세요.')
    return true
  }
  console.error(`[sync-engine] ${context} 실패:`, err)
  return false
}

// 업로드 전에 원격을 한 번 본다. 원격이 우리가 마지막으로 반영한 것보다 새로우면
// 손에 든 그 스냅샷을 기존 병합 경로로 흡수한 뒤 push 한다 — 두 기기가 근접해서
// push 할 때 나중 것이 먼저 것을 통째로 지우는 것을 막는다.
// ponytail: push 성공 시각을 따로 기록하지 않으므로, 내가 올린 파일을 다음 push 때 한 번 더
// 내려받아 병합한다(전부 로컬 id 라 무해한 no-op). 왕복이 부담이 되면 그때 기록을 도입한다.
async function pullBeforePush(provider: CloudProvider): Promise<void> {
  const files = await provider.list()
  const target = pickSyncFile(files)
  if (!target) return
  const remote = await provider.download(target.id)
  if (await isRemoteNewer(remote)) {
    await importSyncData(remote, 'merge')
  }
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
    await pullBeforePush(provider)
    const data = await exportData()
    await provider.upload(data, SYNC_FILENAME)
  } catch (err) {
    if (!handleSyncError(err, 'push')) {
      showError(
        '클라우드에 저장하지 못했어요',
        '기록은 이 기기에 그대로 있어요. 연결되면 자동으로 다시 올려요.'
      )
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
    const target = pickSyncFile(files)
    if (!target) return
    const data = await provider.download(target.id)
    await importSyncData(data, 'merge')
  } catch (err) {
    handleSyncError(err, 'pull')
  }
}
