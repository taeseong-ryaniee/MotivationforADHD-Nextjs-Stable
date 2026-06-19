'use client'

import { useState, useSyncExternalStore } from 'react'
import { Share, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const DISMISS_KEY = 'pwa-install-dismissed-at'

type Banner = 'ios' | 'android' | 'none'

// beforeinstallprompt 이벤트 타입 (표준 lib.dom에 아직 없음)
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Android/Chrome이 설치 가능하다고 판단할 때 발생하는 이벤트를 모듈 스코프에 보관.
// (PwaInstallPrompt는 앱에 단 하나만 마운트되므로 싱글톤으로 다뤄도 안전)
let deferredPrompt: BeforeInstallPromptEvent | null = null

function detectPlatform(): Banner {
  if (typeof window === 'undefined') return 'none'
  const ua = window.navigator.userAgent
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  if (isStandalone) return 'none' // 이미 홈 화면에 설치됨 → 안내 불필요
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
  return 'android'
}

function readDismissedAt(): number | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(DISMISS_KEY)
  return raw ? Number(raw) : null
}

/**
 * TODO(human): shouldShowPrompt 구현
 *
 * 사용자가 마지막으로 배너를 닫은 시각(dismissedAt: epoch ms, 닫은 적 없으면 null)과
 * 현재 시각(now: epoch ms)을 받아, 지금 설치 안내 배너를 다시 보여줄지 결정한다.
 *
 * ADHD-UX 제약 (DESIGN.md):
 *   - "실패 없는 UX" + "여백은 calm signal" — 반복되는 배너는 마찰이자 압박이다.
 *   - 한 번 닫은 사용자에게 매번 다시 띄우면 죄책감/짜증을 유발한다.
 *   - 그렇다고 영원히 안 띄우면, 나중에 설치하고 싶을 때 경로가 사라진다.
 *
 * 결정해야 할 것: 한 번 닫으면 다시 안 보여줄지, 일정 기간(예: 7일/30일) 후 한 번 더
 * 보여줄지, 아니면 다른 정책을 쓸지. true면 배너 표시, false면 숨김.
 */
function shouldShowPrompt(dismissedAt: number | null, now: number): boolean {
  return false
}

// --- 외부 스토어: 브라우저 설치 상태를 SSR-안전하게 구독 ---
// beforeinstallprompt 이벤트를 구독하고, 이벤트가 오면 React에 재평가를 알린다.
function subscribe(onChange: () => void): () => void {
  const handler = (e: Event) => {
    e.preventDefault()
    deferredPrompt = e as BeforeInstallPromptEvent
    onChange()
  }
  window.addEventListener('beforeinstallprompt', handler)
  return () => window.removeEventListener('beforeinstallprompt', handler)
}

// getSnapshot은 외부(가변) 상태를 읽어 "어떤 배너를 보일지"를 안정적인 primitive로 반환.
// 외부 상태 읽기는 useSyncExternalStore의 본래 용도라 impure 읽기가 허용된다.
function getBannerSnapshot(): Banner {
  const platform = detectPlatform()
  if (platform === 'none') return 'none'
  if (!shouldShowPrompt(readDismissedAt(), Date.now())) return 'none'
  // Android는 설치 이벤트를 받은 뒤에만 안내
  if (platform === 'android' && !deferredPrompt) return 'none'
  return platform
}

const getServerSnapshot = (): Banner => 'none'

export function PwaInstallPrompt() {
  const banner = useSyncExternalStore(subscribe, getBannerSnapshot, getServerSnapshot)
  const [dismissed, setDismissed] = useState(false)

  const handleDismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setDismissed(true)
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    deferredPrompt = null
    setDismissed(true)
  }

  if (dismissed || banner === 'none') return null

  return (
    <Card className="border-amber-500/20 bg-stone-900/90 md:hidden">
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
          <Plus className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-stone-50">홈 화면에 추가하기</p>
          {banner === 'ios' ? (
            <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-stone-400">
              하단의 공유 버튼
              <Share className="inline h-3.5 w-3.5 text-stone-300" aria-hidden="true" />
              을 누르고 &lsquo;홈 화면에 추가&rsquo;를 선택하세요.
            </p>
          ) : (
            <p className="mt-1 text-xs text-stone-400">
              앱처럼 한 번의 탭으로 바로 열 수 있어요.
            </p>
          )}
          {banner === 'android' && (
            <Button
              size="sm"
              onClick={handleInstall}
              className="mt-3 rounded-full bg-amber-500 px-5 text-stone-950 hover:bg-amber-400"
            >
              홈 화면에 추가
            </Button>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="-m-1 shrink-0 rounded-md p-1 text-stone-500 hover:text-stone-300"
          aria-label="설치 안내 닫기"
        >
          <X className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  )
}
