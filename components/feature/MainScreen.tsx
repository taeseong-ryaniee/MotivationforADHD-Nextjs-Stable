'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, Calendar as CalendarIcon, CheckCircle2, Flame, LayoutDashboard } from 'lucide-react'
import { MotivationCard } from './MotivationCard'
import { SpecialEventInput } from './SpecialEventInput'
import { CreateTodoButton } from './CreateTodoButton'
import { ThemeToggle } from './ThemeToggle'
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
  const router = useRouter()
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
      router.push(`/todo/${todo.id}`)
    } else {
      toast.info('해당 날짜의 기록이 없습니다.')
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
        <div>
          <h2 className="text-4xl font-bold tracking-tight flex items-center gap-2 font-serif text-primary">
            Dashboard
            <LayoutDashboard className="h-8 w-8 text-muted-foreground/50" />
          </h2>
          <p className="text-muted-foreground font-sans mt-1">
            ADHD 극복을 위한 오늘의 생산성 대시보드입니다.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {lastCreated && (
            <Button 
              variant="outline" 
              onClick={onShowTodayTodo}
              className="hidden lg:flex"
            >
              오늘의 To-do 보기
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="hidden md:inline-flex">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="calendar" disabled>캘린더 (준비중)</TabsTrigger>
          <TabsTrigger value="analytics" disabled>분석 (준비중)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Stats Row */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">총 기록</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{totalTodos}</div>
                <p className="text-xs text-muted-foreground">누적 작성된 To-do</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">이번 달 달성</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{thisMonthTodos}</div>
                <p className="text-xs text-muted-foreground">이번 달 작성 건수</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">오늘의 상태</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">
                  {isTodayDone ? <span className="text-primary">완료</span> : <span className="text-muted-foreground">미완료</span>}
                </div>
                <p className="text-xs text-muted-foreground">{todayString}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">집중 목표</CardTitle>
                <Flame className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">25m</div>
                <p className="text-xs text-muted-foreground">뽀모도로 1세트 도전</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
            
            {/* Left Column (Motivation & Input) - 4 cols */}
            <Card className="col-span-1 lg:col-span-4 border shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif">오늘의 시작</CardTitle>
              </CardHeader>
              <CardContent className="pl-2 space-y-6">
                <div className="px-4">
                  <MotivationCard motivation={todayMotivation} />
                </div>
                
                <div className="rounded-xl border border-primary/10 bg-secondary/30 text-card-foreground p-6 space-y-4 mx-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg flex items-center gap-2 font-serif text-primary">
                      🎯 특별한 일정이나 이슈가 있나요?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      입력해주시면 AI가 맞춤형 조언을 함께 생성해드립니다.
                    </p>
                    <SpecialEventInput value={specialEvent} onChange={onUpdateSpecialEvent} />
                  </div>
                  <div className="pt-2">
                    <CreateTodoButton isCreating={isCreating} onClick={onCreateDailyTodo} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Column (Calendar & Timer) - 3 cols */}
            <div className="col-span-1 lg:col-span-3 space-y-4">
              <Card className="col-span-3 border shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif">캘린더</CardTitle>
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
                        textUnderlineOffset: '4px'
                      }
                    }}
                    className="p-0"
                  />
                </CardContent>
              </Card>

              <FocusTimer />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
