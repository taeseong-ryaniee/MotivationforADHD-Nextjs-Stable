'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar as CalendarIcon, Clock, ChevronRight, Activity, CheckCircle2, Trash2 } from 'lucide-react'
import { useDeleteTodo, useTodos } from '@/hooks/useTodos'
import { getTodoTimestamp } from '@/lib/todo-utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { showConfirm, showError, showSuccess } from '@/lib/toast'

export function HistoryView() {
  const router = useRouter()
  const { data: todoHistory = [] } = useTodos()
  const deleteMutation = useDeleteTodo()

  const [date, setDate] = useState<Date | undefined>(new Date())

  const recordedDays = useMemo(() => {
    return todoHistory.map(todo => new Date(getTodoTimestamp(todo)))
  }, [todoHistory])

  const selectedTodo = useMemo(() => {
    if (!date) return null
    const dateString = date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
    return todoHistory.find(t => t.date === dateString)
  }, [date, todoHistory])

  const recentHistory = useMemo(() => {
    return todoHistory.slice(0, 5)
  }, [todoHistory])

  const todayString = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  const thisMonthTodos = useMemo(() => {
    const now = new Date()
    return todoHistory.filter((t) => {
      const d = new Date(getTodoTimestamp(t))
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
  }, [todoHistory])

  const isTodayDone = useMemo(() => {
    return todoHistory.some(t => t.date === todayString)
  }, [todayString, todoHistory])

  const handleDeleteTodo = (id: string) => {
    showConfirm(
      '이 기록을 삭제할까요?',
      async () => {
        try {
          await deleteMutation.mutateAsync(id)
          showSuccess('기록을 삭제했습니다.')
        } catch {
          showError('기록 삭제 중 오류가 발생했습니다.', '다시 시도해주세요.')
        }
      },
      {
        description: '삭제 후에는 복구할 수 없습니다.',
        confirmLabel: '삭제',
      }
    )
  }

  return (
    <div className="space-y-8" data-section="history-root">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push('/')}
          aria-label="오늘로 돌아가기"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Button>
        <div className="flex flex-col gap-1">
          <Badge variant="secondary" className="w-fit font-sans">
            History
          </Badge>
          <h1 className="text-3xl font-extrabold font-serif [letter-spacing:-0.015em]">나의 발자취</h1>
          <p className="text-sm text-muted-foreground">작성한 기록을 날짜별로 확인하세요.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" data-section="history-stats-grid">
        <Card className="border-border/60 bg-card/80 shadow-sm" data-section="history-stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-sans">총 기록</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{todoHistory.length}</div>
            <p className="text-xs text-muted-foreground">누적 작성된 To-do</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/80 shadow-sm" data-section="history-stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-sans">이번 달 달성</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold font-mono">{thisMonthTodos}</div>
            <p className="text-xs text-muted-foreground">이번 달 작성 건수</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/80 shadow-sm" data-section="history-stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-sans">오늘의 상태</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold font-sans">
              {isTodayDone ? <span className="text-foreground">완료</span> : <span className="text-muted-foreground">미완료</span>}
            </div>
            <p className="text-xs text-muted-foreground">{todayString}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-4" data-section="history-sidebar">
          <Card className="border-border/60 bg-card/80 shadow-sm" data-section="history-calendar">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 font-sans">
                <CalendarIcon className="w-4 h-4 text-primary" aria-hidden="true" />
                날짜별 기록
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center p-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                modifiers={{ hasTodo: recordedDays }}
                modifiersStyles={{
                  hasTodo: {
                    fontWeight: 'bold',
                    color: 'var(--primary)',
                    position: 'relative',
                  },
                }}
                className="rounded-lg border border-border/60 bg-background"
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6" data-section="history-content">
          {date ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="font-sans">
                  선택한 날짜
                </Badge>
                <h2 className="text-2xl font-bold font-serif [letter-spacing:-0.01em]">
                  {date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}의 기록
                </h2>
              </div>

              {selectedTodo ? (
                <Card
                  className="cursor-pointer border-border/60 bg-card/80 shadow-sm transition-all hover:shadow-md"
                  onClick={() => router.push(`/todo/${selectedTodo.id}`)}
                  data-section="history-selected"
                >
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-xl text-foreground font-serif">{selectedTodo.title}</h3>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="기록 삭제"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleDeleteTodo(selectedTodo.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        </Button>
                        <ChevronRight className="text-muted-foreground" aria-hidden="true" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 font-sans leading-relaxed whitespace-pre-wrap">
                      {selectedTodo.content}
                    </p>
                    <div className="pt-2 text-xs text-muted-foreground font-mono">
                      작성시간: {selectedTodo.createdAt}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed border-border/60 bg-muted/20" data-section="history-empty">
                  <CardContent className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
                    <Clock className="h-8 w-8 opacity-30" aria-hidden="true" />
                    <p>이 날 작성된 기록이 없습니다.</p>
                    <Button variant="ghost" onClick={() => setDate(undefined)} className="text-primary">
                      최근 기록 보기
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="font-sans">
                  최근 기록
                </Badge>
                <h2 className="text-lg font-bold font-serif">최근 타임라인</h2>
              </div>
              <ScrollArea className="max-h-[420px] pr-2 sm:max-h-[520px]" data-section="history-recent">
                <div className="space-y-3">
                  {recentHistory.map((todo) => (
                    <Card
                      key={todo.id}
                      className="cursor-pointer border-border/60 bg-card/80 shadow-sm transition-colors hover:bg-accent/5"
                      onClick={() => router.push(`/todo/${todo.id}`)}
                      data-section="history-recent-item"
                    >
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="space-y-1">
                          <p className="font-bold text-foreground font-serif">{todo.date}</p>
                          <p className="text-xs text-muted-foreground font-mono">{todo.createdAt}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`기록 삭제: ${todo.date}`}
                            onClick={(event) => {
                              event.stopPropagation()
                              handleDeleteTodo(todo.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          </Button>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
