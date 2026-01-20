'use client'

import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Calendar as CalendarIcon, Clock, ChevronRight } from 'lucide-react'
import { useTodoStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'

export function HistoryView() {
  const navigate = useNavigate()
  const todoHistory = useTodoStore((state) => state.todoHistory)
  const [date, setDate] = useState<Date | undefined>(new Date())

  // 기록이 있는 날짜들 (Date 객체로 변환)
  const recordedDays = useMemo(() => {
    return todoHistory.map(todo => new Date(todo.createdAt))
  }, [todoHistory])

  // 선택된 날짜에 해당하는 To-do 찾기
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

  // 최근 기록 5개 (타임라인용)
  const recentHistory = useMemo(() => {
    return todoHistory.slice(0, 5)
  }, [todoHistory])

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-primary font-serif">History</span>
          <h1 className="text-2xl font-bold font-serif">나의 발자취</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Calendar & Stats (4 cols) */}
        <div className="md:col-span-4 space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2 font-sans">
                <CalendarIcon className="w-4 h-4 text-brand-500" />
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
                   }
                }}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card className="bg-surface-muted border-none">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">총 기록 수</span>
                <span className="font-mono font-bold text-lg text-primary">{todoHistory.length}개</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">이번 달 기록</span>
                <span className="font-mono font-bold text-lg text-secondary">
                  {todoHistory.filter(t => new Date(t.createdAt).getMonth() === new Date().getMonth()).length}개
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Detail List (8 cols) */}
        <div className="md:col-span-8 space-y-6">
          {date ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-bold flex items-center gap-2 font-serif">
                {date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}의 기록
              </h2>
              
              {selectedTodo ? (
                <Card 
                  className="hover:shadow-md transition-all cursor-pointer border-brand-200"
                  onClick={() => navigate({ to: '/todo/$id', params: { id: selectedTodo.id } })}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-xl text-primary font-serif">{selectedTodo.title}</h3>
                      <ChevronRight className="text-muted-foreground" />
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
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">
                  <Clock className="w-10 h-10 mb-3 opacity-20" />
                  <p>이 날 작성된 기록이 없습니다.</p>
                  <Button 
                    variant="link" 
                    className="mt-2 text-brand-500"
                    onClick={() => setDate(undefined)}
                  >
                    최근 기록 보기
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 font-serif">
                최근 타임라인
              </h2>
              <div className="space-y-3">
                {recentHistory.map((todo) => (
                  <Card 
                    key={todo.id} 
                    className="hover:bg-accent/5 transition-colors cursor-pointer group"
                    onClick={() => navigate({ to: '/todo/$id', params: { id: todo.id } })}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-bold text-foreground font-serif group-hover:text-primary transition-colors">
                          {todo.date}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">{todo.createdAt}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
