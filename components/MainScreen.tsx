import { useEffect } from 'react'
import { Coffee, Eye } from 'lucide-react'
import { MotivationCard } from './MotivationCard'
import { SpecialEventInput } from './SpecialEventInput'
import { CreateTodoButton } from './CreateTodoButton'
import { ThemeToggle } from './ThemeToggle'
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
    <div className="space-y-10 pb-24 lg:pb-0">
      {/* Stylish Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-6 pb-2">
        <div className="space-y-3">
          {/* Date Badge */}
          <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary tracking-wide">
            {todayString}
          </span>
          
          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            산만이의 아침
            <Coffee className="inline-block ml-3 h-8 w-8 sm:h-10 sm:w-10 text-primary mb-2 opacity-80" strokeWidth={2.5} />
          </h1>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {lastCreated && (
            <Button 
              variant="outline" 
              size="lg"
              onClick={onShowTodayTodo}
              className="hidden sm:flex text-base border-primary/20 text-primary hover:bg-primary/5 h-12 px-6"
            >
              <Eye className="mr-2 h-5 w-5" />
              오늘의 To-do
            </Button>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile Only: View Todo Button */}
      {lastCreated && (
        <Button 
          variant="outline" 
          onClick={onShowTodayTodo}
          className="w-full sm:hidden flex items-center justify-center py-8 text-xl font-semibold border-primary/20 text-primary shadow-sm"
        >
          <Eye className="mr-2 h-6 w-6" />
          오늘 생성한 To-do 보기
        </Button>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
        {/* Left Column: Motivation (Accent Theme) */}
        <div className="space-y-4 flex flex-col h-full">
          <MotivationCard motivation={todayMotivation} />
        </div>

        {/* Right Column: Action Card & Button */}
        <div className="flex flex-col gap-6">
          <Card className="border-0 shadow-lg bg-primary/5 dark:bg-primary/5">
            <CardContent className="p-8">
              <SpecialEventInput value={specialEvent} onChange={onUpdateSpecialEvent} />
            </CardContent>
          </Card>
          
          <div className="pt-2">
            <CreateTodoButton isCreating={isCreating} onClick={onCreateDailyTodo} />
          </div>
        </div>
      </div>

      {/* Desktop Hint */}
      <Card className="hidden lg:block bg-muted/30 border-none shadow-none mt-8">
        <CardContent className="px-8 py-6 text-base text-muted-foreground text-center">
          Tip: <kbd className="px-2 py-1 rounded bg-background border border-border font-mono text-sm mx-1">Ctrl</kbd> + <kbd className="px-2 py-1 rounded bg-background border border-border font-mono text-sm mx-1">Enter</kbd>로 빠르게 시작하세요.
        </CardContent>
      </Card>
    </div>
  )
}
