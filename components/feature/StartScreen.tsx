'use client'

import { useEffect, useRef, useState } from 'react'
import { Lightbulb, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface StartScreenProps {
  cheers: string[]
  tip: { title: string; body: string } | null
  onAddTodo: (text: string) => Promise<void>
  onStartDay: () => void
  todoCount: number
}

const DEFAULT_CHEERS = [
  '좋아, 한 걸음 시작했어!',
  '시작이 반이래. 벌써 반이야!',
  '오늘도 멍함을 이겼어.',
]

export function StartScreen({
  cheers,
  tip,
  onAddTodo,
  onStartDay,
  todoCount,
}: StartScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [flash, setFlash] = useState(false)
  const [addedItems, setAddedItems] = useState<string[]>([])

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
    <div className="flex flex-1 flex-col items-center justify-center py-6">
      <div className="w-full max-w-md space-y-4">
        {/* Input */}
        <div
          className={`rounded-lg border p-4 transition-all duration-300 ${
            flash
              ? 'border-amber-500/30 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
              : 'border-border bg-muted/40'
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
            className="w-full bg-transparent text-2xl font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
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

        {/* Start day button */}
        {totalTodos > 0 && (
          <Button
            onClick={onStartDay}
            size="lg"
            className="animate-in fade-in w-full rounded-full bg-amber-500 text-sm font-bold text-stone-950 hover:bg-amber-400"
          >
            오늘 하루 시작!
          </Button>
        )}

        {/* Tip — inline, no card */}
        {tip && (
          <div className="flex items-start gap-2 pt-1">
            <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
            <div>
              <span className="text-xs font-medium text-muted-foreground">{tip.title} </span>
              <span className="text-xs text-muted-foreground/70">{tip.body}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
