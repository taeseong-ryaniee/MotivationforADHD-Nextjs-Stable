'use client'

import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { MainScreen } from '@/components/feature/MainScreen'
import { StartScreen } from '@/components/feature/StartScreen'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDailyTodo, useSaveTodo, todoKeys } from '@/hooks/useTodos'
import { useContent } from '@/hooks/useContent'
import { migrateFromLocalStorage } from '@/lib/db'
import { showError } from '@/lib/toast'
import { useState, useEffect, useMemo, useCallback } from 'react'
import type { TodoData } from '@/lib/types'

function getTodayTip(antiBrainFogTips: string[]): { title: string; body: string } | null {
  if (!antiBrainFogTips || antiBrainFogTips.length === 0) return null
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  const tip = antiBrainFogTips[dayOfYear % antiBrainFogTips.length]
  return { title: '멍함 탈출 팁', body: tip }
}

export function DashboardView() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: content, isLoading: isLoadingContent, error: contentError } = useContent('ko')

  const [specialEvent, setSpecialEvent] = useState('')
  const { todayTodo, todayTodoCount, isCreating, createDailyTodo } = useDailyTodo()
  const saveTodoMutation = useSaveTodo()

  useEffect(() => {
    migrateFromLocalStorage()
  }, [])

  const cheers = useMemo(() => content?.cheers ?? [], [content])
  const tip = useMemo(() => getTodayTip(content?.antiBrainFogTips ?? []), [content])

  const handleAddQuickTodo = useCallback(async (text: string) => {
    const now = new Date()
    const dateString = now.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
    const todo: TodoData = {
      id: crypto.randomUUID(),
      date: dateString,
      title: text,
      content: text,
      createdAt: now.toLocaleString('ko-KR'),
    }
    await saveTodoMutation.mutateAsync(todo)
  }, [saveTodoMutation])

  const handleStartDay = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: todoKeys.all })
  }, [queryClient])

  const handleCreateTodo = async () => {
    if (!content) return
    try {
      const todo = await createDailyTodo({
        specialEvent,
        content,
      })
      navigate({ to: '/todo/$id', params: { id: todo.id } })
    } catch {
      showError('To-do 생성 중 오류가 발생했습니다', '다시 시도해주세요.')
    }
  }

  const handleShowTodayTodo = () => {
    navigate({ to: '/today' })
  }

  if (contentError) {
    console.error('Content loading error:', contentError)
  }

  if (isLoadingContent) {
    return (
      <Card className="border-border/60 bg-card/80 shadow-sm">
        <CardContent className="space-y-6 p-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>
          </div>
          <Skeleton className="h-32 w-full rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  // No todo for today → StartScreen
  if (!todayTodo) {
    return (
      <StartScreen
        cheers={cheers}
        tip={tip}
        onAddTodo={handleAddQuickTodo}
        onStartDay={handleStartDay}
        todoCount={todayTodoCount}
      />
    )
  }

  // Has today's todo → existing dashboard
  return (
    <MainScreen
      specialEvent={specialEvent}
      isCreating={isCreating}
      onUpdateSpecialEvent={setSpecialEvent}
      onCreateDailyTodo={handleCreateTodo}
      onShowTodayTodo={handleShowTodayTodo}
    />
  )
}
