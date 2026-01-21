'use client'

import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Calendar as CalendarIcon, Clock, ChevronRight } from 'lucide-react'
import { useTodos } from '@/hooks/useTodos'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

export function HistoryView() {
  const navigate = useNavigate()
  const { data: todoHistory = [] } = useTodos()

  const [date, setDate] = useState<Date | undefined>(new Date())

  const recordedDays = useMemo(() => {
    return todoHistory.map(todo => new Date(todo.createdAt))
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

  return (
    <div className="space-y-8" data-section="history-root">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate({ to: '/' })}
          aria-label="대시보드로 돌아가기"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Button>
        <div className="flex flex-col gap-1">
          <Badge variant="secondary" className="w-fit font-sans">
            History
          </Badge>
          <h1 className="text-2xl font-bold font-serif">나의 발자취</h1>
          <p className="text-sm text-muted-foreground">작성한 기록을 날짜별로 확인하세요.</p>
        </div>
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

          <Card className="border-border/60 bg-card/80 shadow-sm" data-section="history-summary">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">총 기록 수</span>
                <span className="font-mono text-lg font-semibold text-foreground">{todoHistory.length}개</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">이번 달 기록</span>
                <span className="font-mono text-lg font-semibold text-foreground">
                  {todoHistory.filter(t => new Date(t.createdAt).getMonth() === new Date().getMonth()).length}개
                </span>
              </div>
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
                <h2 className="text-lg font-bold font-serif">
                  {date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}의 기록
                </h2>
              </div>

              {selectedTodo ? (
                <Card
                  className="cursor-pointer border-border/60 bg-card/80 shadow-sm transition-all hover:shadow-md"
                  onClick={() => navigate({ to: '/todo/$id', params: { id: selectedTodo.id } })}
                  data-section="history-selected"
                >
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-xl text-foreground font-serif">{selectedTodo.title}</h3>
                      <ChevronRight className="text-muted-foreground" aria-hidden="true" />
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
                      onClick={() => navigate({ to: '/todo/$id', params: { id: todo.id } })}
                      data-section="history-recent-item"
                    >
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="space-y-1">
                          <p className="font-bold text-foreground font-serif">{todo.date}</p>
                          <p className="text-xs text-muted-foreground font-mono">{todo.createdAt}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
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
