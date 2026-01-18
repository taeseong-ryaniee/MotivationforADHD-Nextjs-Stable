import { useEffect } from 'react'
import { Coffee, Eye } from 'lucide-react'
import { MotivationCard } from './MotivationCard'
import { SpecialEventInput } from './SpecialEventInput'
import { CreateTodoButton } from './CreateTodoButton'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

interface MainScreenProps {
  todayMotivation: string
  specialEvent: string
  isCreating: boolean
  lastCreated: string | null
  onUpdateSpecialEvent: (event: string) => void
  onCreateDailyTodo: () => void
  onShowTodayTodo: () => void
}

export function MainScreen({
  todayMotivation,
  specialEvent,
  isCreating,
  lastCreated,
  onUpdateSpecialEvent,
  onCreateDailyTodo,
  onShowTodayTodo,
}: MainScreenProps) {
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
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
              <Coffee className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold text-secondary">오늘의 리듬</p>
              <h1 className="text-2xl font-semibold text-primary sm:text-3xl">
                산만이의 아침
              </h1>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full border border-token/60 bg-surface px-3 py-1 text-xs text-secondary shadow-sm">
            {todayString}
          </span>
        </div>
        {lastCreated && (
          <Button variant="secondary" onClick={onShowTodayTodo}>
            <Eye className="h-4 w-4" />
            오늘 생성한 To-do
          </Button>
        )}
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <MotivationCard motivation={todayMotivation} />
          <p className="text-sm text-secondary">
            필요한 것만 남겨 오늘의 집중력을 빠르게 끌어올립니다.
          </p>
        </div>

        <div className="space-y-4">
          <SpecialEventInput value={specialEvent} onChange={onUpdateSpecialEvent} />
          <CreateTodoButton isCreating={isCreating} onClick={onCreateDailyTodo} />
        </div>
      </div>

      <Card className="bg-surface-muted/70">
        <CardContent className="px-4 py-3 text-xs text-secondary">
          Ctrl/⌘ + Enter로 빠르게 To-do를 생성할 수 있어요.
        </CardContent>
      </Card>
    </div>
  )
}
