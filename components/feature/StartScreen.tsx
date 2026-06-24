'use client'

import { useRef, useState } from 'react'
import { Heart, Lightbulb, Loader2, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { showConfirm } from '@/lib/toast'

interface StartScreenProps {
  motivation: string
  cheers: string[]
  tip: { title: string; body: string } | null
  isCreating: boolean
  onStart: (items: string[]) => void | Promise<void>
}

const DEFAULT_CHEERS = [
  '좋아, 한 걸음 시작했어!',
  '시작이 반이래. 벌써 반이야!',
  '오늘도 멍함을 이겼어.',
]

const MAX_ITEM_LENGTH = 20

// 입력값 정규화: 앞뒤 공백 제거, 빈 문자열·최대 길이(20자) 초과는 거부(null).
// 중복 재확인은 부수효과(확인 토스트)라 addItem에서 처리한다.
function normalizeNewItem(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (trimmed.length > MAX_ITEM_LENGTH) return null
  return trimmed
}

export function StartScreen({ motivation, cheers, tip, isCreating, onStart }: StartScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [items, setItems] = useState<string[]>([])
  const [flash, setFlash] = useState(false)

  // 실제 칩 추가 + 피드백. amber glow flash는 DESIGN.md flat-first의 명명된 예외이자
  // micro-stimulation 핵심(ADHD 멍함 해소 피드백)이라 절대 제거하지 않는다.
  const commitItem = (text: string) => {
    setItems((prev) => [...prev, text])
    setValue('')

    setFlash(true)
    setTimeout(() => setFlash(false), 300)

    const messages = cheers.length > 0 ? cheers : DEFAULT_CHEERS
    toast.success(messages[Math.floor(Math.random() * messages.length)])

    inputRef.current?.focus()
  }

  const addItem = () => {
    const next = normalizeNewItem(value)
    if (next === null) return

    // 중복이면 바로 넣지 않고 재확인 (의도적 중복 입력은 허용)
    if (items.includes(next)) {
      showConfirm('이미 적은 항목이에요. 또 추가할까요?', () => commitItem(next), {
        description: '같은 내용이 한 번 더 들어갑니다.',
        confirmLabel: '추가',
      })
      return
    }

    commitItem(next)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault()
      addItem()
    }
  }

  // 단일 CTA: 아직 "추가" 안 한 입력값도 함께 반영해 생성 (typed-but-not-added 손실 방지)
  const handleStart = () => {
    const pending = normalizeNewItem(value)
    const finalItems = pending && !items.includes(pending) ? [...items, pending] : items
    onStart(finalItems)
  }

  return (
    <div className="flex flex-1 flex-col justify-center gap-8 py-2 md:py-6">
      {/* 1. 오늘의 격려 + 멍함 탈출 팁 (흐름상 함께) */}
      <div className="mx-auto w-full max-w-md space-y-4 text-center">
        {motivation && (
          <>
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-amber-500">
              <Heart className="h-4 w-4" aria-hidden="true" />
              오늘의 격려
            </div>
            <p className="text-balance break-keep text-2xl font-bold leading-relaxed text-stone-50 sm:text-3xl">
              {motivation}
            </p>
          </>
        )}
        {tip && (
          <div className="mx-auto flex max-w-sm items-start gap-2 rounded-lg border border-amber-500/10 bg-stone-900/60 p-3 text-left">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
            <p className="text-xs text-stone-400">
              <span className="font-medium text-stone-300">{tip.title}</span> · {tip.body}
            </p>
          </div>
        )}
      </div>

      {/* 2. 단일 입력 — "오늘 뭐 할까?"와 특별 일정을 하나로 */}
      <div className="mx-auto w-full max-w-md space-y-4">
        <div
          className={`rounded-lg border border-amber-500/10 p-4 transition-all duration-300 ${
            flash
              ? 'bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
              : 'bg-stone-900/50 shadow-[0_0_10px_rgba(245,158,11,0.05)]'
          }`}
        >
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="오늘 뭐 할까?"
            aria-label="오늘의 할 일 입력"
            maxLength={MAX_ITEM_LENGTH}
            className="w-full bg-transparent text-2xl font-medium text-stone-50 placeholder:text-stone-500 focus:outline-none"
          />
        </div>

        <p className="ml-1 text-xs text-stone-500">할 일도, 특별 일정도 여기에 적어요</p>

        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={addItem}
            disabled={!value.trim()}
            className="gap-1.5 rounded-full bg-stone-800 px-5 text-stone-100 hover:bg-stone-700"
          >
            <Plus className="h-4 w-4" />
            추가
          </Button>
        </div>

        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {items.map((item, i) => (
              <span
                key={i}
                className="animate-in slide-in-from-bottom-2 inline-flex items-center gap-1 rounded-full bg-green-500/15 px-3 py-1 text-sm text-green-400"
              >
                <span className="text-green-500">✓</span>
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3. 단일 CTA — "오늘 하루 시작!" = 격려 To-do 생성 */}
      <div className="mx-auto w-full max-w-md">
        <Button
          onClick={handleStart}
          disabled={isCreating}
          size="lg"
          className="w-full rounded-full bg-amber-500 text-lg font-bold text-stone-950 hover:bg-amber-400"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              만드는 중…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              오늘 하루 시작!
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
