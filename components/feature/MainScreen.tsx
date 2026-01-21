'use client'

import { useEffect, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Activity, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react'
import { MotivationCard } from './MotivationCard'
import { SpecialEventInput } from './SpecialEventInput'
import { CreateTodoButton } from './CreateTodoButton'
import { ThemeToggle } from './ThemeToggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FocusTimer } from './FocusTimer'
import { Calendar } from '@/components/ui/calendar'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface MainScreenProps {
  todayMotivation: string
  specialEvent: string
  isCreating: boolean
  lastCreated: string | null
  onUpdateSpecialEvent: (event: string) => void
  onCreateDailyTodo: () => void
  onShowTodayTodo: () => void
  todoHistory: import('@/lib/types').TodoData[]
}

export function MainScreen({
  todayMotivation,
  specialEvent,
  isCreating,
  lastCreated,
  onUpdateSpecialEvent,
  onCreateDailyTodo,
  onShowTodayTodo,
  todoHistory,
}: MainScreenProps) {
  const navigate = useNavigate()
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


  // Create Date objects for days with todos
  const daysWithTodos = useMemo(() => todoHistory.map(todo => new Date(todo.createdAt)), [todoHistory])
  
  // Stats
  const totalTodos = todoHistory.length
  const thisMonthTodos = useMemo(() => {
    const now = new Date()
    return todoHistory.filter(t => {
      const d = new Date(t.createdAt)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
  }, [todoHistory])
  
  const isTodayDone = !!lastCreated

  const handleDayClick = (day: Date) => {
    // Find todo for this day
    const dayString = day.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
    
    const todo = todoHistory.find(t => t.date === dayString)
    
    if (todo) {
      navigate({ to: '/todo/$id', params: { id: todo.id } })
    } else {
      toast.info('해당 날짜의 기록이 없습니다.')
    }
  }

  return (
    <div className="space-y-8" data-section="dashboard-root">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="font-sans">
              Daily Focus
            </Badge>
            <Badge
              variant={isTodayDone ? 'default' : 'outline'}
              className={
                isTodayDone
                  ? 'border-emerald-200 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : 'text-muted-foreground'
              }
            >
              {isTodayDone ? '오늘 완료' : '오늘 미완료'}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl font-serif">
            산만이의 아침
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base font-sans">
            ADHD 극복을 위한 오늘의 집중 루틴을 설계합니다.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <CalendarIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {todayString}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {lastCreated && (
            <Button variant="secondary" onClick={onShowTodayTodo} className="gap-2 w-full sm:w-auto">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              오늘의 To-do 보기
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full justify-start gap-2 bg-muted/40 p-1 sm:w-auto">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="calendar" disabled>
            캘린더 (준비중)
          </TabsTrigger>
          <TabsTrigger value="analytics" disabled>
            분석 (준비중)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" data-section="dashboard-stats-grid">
            <Card className="border-border/60 bg-card/80 shadow-sm" data-section="dashboard-stat-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground font-sans">
                  총 기록
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold font-mono">{totalTodos}</div>
                <p className="text-xs text-muted-foreground">누적 작성된 To-do</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-card/80 shadow-sm" data-section="dashboard-stat-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground font-sans">
                  이번 달 달성
                </CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold font-mono">{thisMonthTodos}</div>
                <p className="text-xs text-muted-foreground">이번 달 작성 건수</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-card/80 shadow-sm" data-section="dashboard-stat-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground font-sans">
                  오늘의 상태
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-semibold font-sans">
                  {isTodayDone ? (
                    <span className="text-foreground">완료</span>
                  ) : (
                    <span className="text-muted-foreground">미완료</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{todayString}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-12" data-section="dashboard-overview-grid">
            <div className="lg:col-span-7 space-y-6" data-section="dashboard-overview-main">
              <MotivationCard motivation={todayMotivation} />
              <Card className="border-border/60 bg-card/80 shadow-sm" data-section="dashboard-daily-plan">
                <CardHeader className="space-y-1">
                  <CardTitle className="font-serif text-lg">오늘의 일정 메모</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    특별한 일정이 있으면 AI가 맞춤형 조언을 준비합니다.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SpecialEventInput value={specialEvent} onChange={onUpdateSpecialEvent} />
                  <CreateTodoButton isCreating={isCreating} onClick={onCreateDailyTodo} />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-5 space-y-6" data-section="dashboard-overview-side">
              <Card className="border-border/60 bg-card/80 shadow-sm" data-section="dashboard-calendar">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">기록 캘린더</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={new Date()}
                    onDayClick={handleDayClick}
                    modifiers={{ hasTodo: daysWithTodos }}
                    modifiersStyles={{
                      hasTodo: {
                        fontWeight: 'bold',
                        textDecoration: 'underline',
                        textDecorationColor: 'hsl(var(--primary))',
                        textDecorationThickness: '2px',
                        textUnderlineOffset: '4px',
                      },
                    }}
                    className="p-0"
                  />
                </CardContent>
              </Card>

              <FocusTimer className="border-border/60 bg-card/80 shadow-sm" />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
