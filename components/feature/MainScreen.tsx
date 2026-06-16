'use client'

import { useEffect } from 'react'
import { Calendar as CalendarIcon, CheckCircle2, Sparkles, Zap } from 'lucide-react'
import { SpecialEventInput } from './SpecialEventInput'
import { CreateTodoButton } from './CreateTodoButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface MainScreenProps {
  specialEvent: string
  isCreating: boolean
  onUpdateSpecialEvent: (event: string) => void
  onCreateDailyTodo: () => void
  onShowTodayTodo: () => void
}

function countEvents(value: string): number {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean).length
}

export function MainScreen({
  specialEvent,
  isCreating,
  onUpdateSpecialEvent,
  onCreateDailyTodo,
  onShowTodayTodo,
}: MainScreenProps) {
  const eventCount = countEvents(specialEvent)
  const todayString = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  // Keyboard shortcut: Ctrl/Cmd + Enter to create todo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        if (!isCreating) {
          onCreateDailyTodo()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCreating, onCreateDailyTodo])

  return (
    <div className="space-y-8" data-section="dashboard-root">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-balance text-3xl font-extrabold text-foreground md:text-4xl font-serif [letter-spacing:-0.015em]">
            산만이의 아침
          </h1>
          <p className="text-base text-muted-foreground font-sans">
            ADHD 극복을 위한 오늘의 집중 루틴을 설계합니다.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs sm:text-sm">
            <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              오늘 일정 {eventCount}개
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 text-muted-foreground">
              <Zap className="h-3.5 w-3.5" aria-hidden="true" />
              빠른 생성: Ctrl/Cmd + Enter
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onClick={onShowTodayTodo}
            className="w-full gap-2 sm:w-auto"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            오늘의 To-do 보기
          </Button>
        </div>
      </div>

      <Card className="border-border/60 bg-card/80 shadow-sm" data-section="dashboard-daily-plan">
        <CardHeader className="space-y-3">
          <div className="w-fit rounded-md border border-border/70 bg-muted/30 px-3 py-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <CalendarIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="whitespace-nowrap">{todayString}</span>
            </div>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground [letter-spacing:-0.01em]">오늘 일정 정리</h2>
              <p className="text-sm text-muted-foreground">
                핵심 일정만 추가하면 루틴 우선순위를 자동으로 구성합니다.
              </p>
            </div>
            <details className="group relative shrink-0">
              <summary
                className="flex h-7 w-7 cursor-pointer list-none items-center justify-center rounded-full border border-border/60 text-sm font-semibold text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="일정 조언 안내"
              >
                i
              </summary>
              <div className="absolute right-0 top-9 z-20 w-64 rounded-md border border-border bg-popover p-3 text-sm text-popover-foreground shadow-md">
                짧고 구체적으로 입력할수록 더 실행 가능한 To-do가 만들어집니다.
              </div>
            </details>
          </div>
        </CardHeader>
        <CardContent>
          <SpecialEventInput value={specialEvent} onChange={onUpdateSpecialEvent} />
        </CardContent>
      </Card>

      <div className="sticky bottom-3 z-10 -mx-2 rounded-xl bg-background/85 px-2 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:static sm:mx-0 sm:rounded-none sm:bg-transparent sm:p-0 sm:backdrop-blur-0">
        <CreateTodoButton isCreating={isCreating} onClick={onCreateDailyTodo} />
      </div>
    </div>
  )
}
