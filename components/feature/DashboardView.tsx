'use client'

import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { MainScreen } from '@/components/feature/MainScreen'
import { useTodoStore } from '@/lib/store'
import { migrateFromLocalStorage } from '@/lib/db'
import { showError } from '@/lib/toast'
import { useContent } from '@/hooks/useContent'

export function DashboardView() {
  const navigate = useNavigate()
  const {
    todayMotivation,
    specialEvent,
    isCreating,
    lastCreated,
    todoHistory,
    initialize,
    createDailyTodo,
    updateSpecialEvent,
  } = useTodoStore()

  const { data: content, isLoading: isLoadingContent, error: contentError } = useContent('ko')

  useEffect(() => {
    const init = async () => {
      await migrateFromLocalStorage()

      if (content) {
        useTodoStore.getState().loadContent(content)
      }

      await initialize()
    }

    init()
  }, [initialize, content])

  const handleCreateTodo = async () => {
    try {
      const todo = await createDailyTodo()
      navigate({ to: '/todo/$id', params: { id: todo.id } })
    } catch {
      showError('To-do 생성 중 오류가 발생했습니다', '다시 시도해주세요.')
    }
  }

  const handleShowTodayTodo = () => {
    const latest = useTodoStore.getState().todayTodo ?? useTodoStore.getState().todoHistory[0]
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
        <p className="text-muted-foreground font-medium animate-pulse">오늘의 영감을 불러오고 있어요...</p>
      </div>
    )
  }

  return (
    <MainScreen
      todayMotivation={todayMotivation}
      specialEvent={specialEvent}
      isCreating={isCreating}
      lastCreated={lastCreated}
      onUpdateSpecialEvent={updateSpecialEvent}
      onCreateDailyTodo={handleCreateTodo}
      onShowTodayTodo={handleShowTodayTodo}
      todoHistory={todoHistory}
    />
  )
}
