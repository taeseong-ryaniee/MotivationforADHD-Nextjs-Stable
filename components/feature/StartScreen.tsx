'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Heart, Lightbulb, Loader2, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SpecialEventInput } from '@/components/feature/SpecialEventInput'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface StartScreenProps {
  motivation: string
  cheers: string[]
  tip: { title: string; body: string } | null
  specialEvent: string
  isCreating: boolean
  onAddTodo: (text: string) => Promise<void>
  onStartDay: () => void
  onUpdateSpecialEvent: (value: string) => void
  onGenerate: () => void
  todoCount: number
}

const DEFAULT_CHEERS = [
  '좋아, 한 걸음 시작했어!',
  '시작이 반이래. 벌써 반이야!',
  '오늘도 멍함을 이겼어.',
]

export function StartScreen({
  motivation,
  cheers,
  tip,
  specialEvent,
  isCreating,
  onAddTodo,
  onStartDay,
  onUpdateSpecialEvent,
  onGenerate,
  todoCount,
}: StartScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [flash, setFlash] = useState(false)
  const [addedItems, setAddedItems] = useState<string[]>([])
  const [showGenerate, setShowGenerate] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async () => {
    const trimmed = value.trim()
    if (!trimmed || isAdding) return

    setIsAdding(true)
    try {
      await onAddTodo(trimmed)
      setValue('')

      setAddedItems((prev) => [...prev, trimmed])

      setFlash(true)
      setTimeout(() => setFlash(false), 300)

      const messages = cheers.length > 0 ? cheers : DEFAULT_CHEERS
      const cheer = messages[Math.floor(Math.random() * messages.length)]
      toast.success(cheer)
    } catch {
      toast.error('저장에 실패했어요. 다시 시도해주세요.')
    } finally {
      setIsAdding(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const totalTodos = todoCount + addedItems.length

  return (
    <div className="flex flex-1 flex-col py-2 md:py-6">
      {/* 격려 히어로 + 입력 — 화면 중앙 정렬 (네비게이션은 AppShell 헤더 + MobileNav가 담당) */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        {/* HERO: 오늘의 격려 (동기부여가 주인공) */}
        {motivation && (
          <div className="w-full max-w-md space-y-4 text-center">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-amber-500">
              <Heart className="h-4 w-4" aria-hidden="true" />
              오늘의 격려
            </div>
            <p className="text-balance break-keep font-serif text-2xl font-bold leading-relaxed text-stone-50 sm:text-3xl">
              {motivation}
            </p>
          </div>
        )}

        {/* ACTION: 할 일 입력 */}
        <div className="w-full max-w-md space-y-4">
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
              disabled={isAdding}
              className="w-full bg-transparent text-2xl font-medium text-stone-50 placeholder:text-stone-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!value.trim() || isAdding}
              className="rounded-full gap-1.5 bg-amber-500 text-stone-950 hover:bg-amber-400 px-5"
            >
              <Plus className="h-4 w-4" />
              추가
            </Button>
          </div>

          {/* Added items as chips */}
          {addedItems.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {addedItems.map((item, i) => (
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

        {/* 보조 행동: 특별 일정으로 격려 To-do 만들기 (progressive disclosure) */}
        <div className="w-full max-w-md">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowGenerate((prev) => !prev)}
            className="w-full justify-between text-sm text-stone-400 hover:text-stone-200"
            aria-expanded={showGenerate}
          >
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              특별 일정으로 격려 To-do 만들기
            </span>
            <ChevronDown
              className={cn('h-4 w-4 transition-transform', showGenerate && 'rotate-180')}
            />
          </Button>
          {showGenerate && (
            <div className="animate-in fade-in slide-in-from-top-2 mt-3 space-y-4 rounded-lg border border-border/60 bg-stone-900/40 p-4">
              <SpecialEventInput value={specialEvent} onChange={onUpdateSpecialEvent} />
              <Button
                onClick={onGenerate}
                disabled={isCreating}
                className="w-full rounded-full bg-amber-500 font-bold text-stone-950 hover:bg-amber-400"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    만드는 중…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    격려 To-do 만들기
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Start day button */}
        {totalTodos > 0 && (
          <Button
            onClick={onStartDay}
            size="lg"
            className="animate-in fade-in mt-4 rounded-full bg-amber-500 text-lg font-bold text-stone-950 hover:bg-amber-400 px-8"
          >
            오늘 하루 시작!
          </Button>
        )}
      </div>

      {/* Tip card (bottom 40%) */}
      {tip && (
        <div className="mt-auto pt-6">
          <Card className="border-amber-500/10 bg-stone-900/80">
            <CardContent className="flex items-start gap-3 p-4">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-stone-300">{tip.title}</p>
                <p className="mt-1 text-xs text-stone-500">{tip.body}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
