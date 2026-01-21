'use client'

import { useNavigate } from '@tanstack/react-router'
import { MainScreen } from '@/components/feature/MainScreen'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDailyTodo } from '@/hooks/useTodos'
import { useContent } from '@/hooks/useContent'
import { migrateFromLocalStorage } from '@/lib/db'
import { showError } from '@/lib/toast'
import { useState, useEffect } from 'react'

export function DashboardView() {
  const navigate = useNavigate()
  const { data: content, isLoading: isLoadingContent, error: contentError } = useContent('ko')

  const [specialEvent, setSpecialEvent] = useState('')
  const { todayMotivation, todayTodo, todoHistory, isCreating, createDailyTodo } = useDailyTodo()

  useEffect(() => {
    const init = async () => {
      await migrateFromLocalStorage()
    }

    init()
  }, [])

  const handleCreateTodo = async () => {
    try {
      const todo = await createDailyTodo({
        specialEvent,
        content: content || undefined,
      })
      navigate({ to: '/todo/$id', params: { id: todo.id } })
    } catch {
      showError('To-do 생성 중 오류가 발생했습니다', '다시 시도해주세요.')
    }
  }

  const handleShowTodayTodo = () => {
    const latest = todayTodo || todoHistory[0]
    if (latest) {
      navigate({ to: '/todo/$id', params: { id: latest.id } })
    } else {
      navigate({ to: '/' })
    }
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
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <MainScreen
      todayMotivation={todayMotivation}
      specialEvent={specialEvent}
      isCreating={isCreating}
      lastCreated={todayTodo?.date || null}
      onUpdateSpecialEvent={setSpecialEvent}
      onCreateDailyTodo={handleCreateTodo}
      onShowTodayTodo={handleShowTodayTodo}
      todoHistory={todoHistory}
    />
  )
}
