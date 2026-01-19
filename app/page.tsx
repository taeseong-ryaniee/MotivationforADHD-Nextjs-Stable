'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { MainScreen } from '@/components/MainScreen'
import { Card, CardContent } from '@/components/ui/card'
import { useTodoStore } from '@/lib/store'
import { migrateFromLocalStorage } from '@/lib/db'
import { showError } from '@/lib/toast'
import { useContent } from '@/hooks/useContent'

export default function Home() {
  const router = useRouter()
  const {
    todayMotivation,
    specialEvent,
    isCreating,
    lastCreated,
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
      router.push(`/todo/${todo.id}`)
    } catch {
      showError('To-do 생성 중 오류가 발생했습니다', '다시 시도해주세요.')
    }
  }

  const handleShowTodayTodo = () => {
    const latest = useTodoStore.getState().todayTodo ?? useTodoStore.getState().todoHistory[0]
    if (latest) {
      router.push(`/todo/${latest.id}`)
    } else {
      router.push('/')
    }
  }

  if (contentError) {
    console.error('Content loading error:', contentError)
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6 sm:p-8 lg:p-10">
        {isLoadingContent ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-brand-500" />
            <p className="text-sm text-muted-foreground">앱을 불러오는 중...</p>
          </div>
        ) : (
          <MainScreen
            todayMotivation={todayMotivation}
            specialEvent={specialEvent}
            isCreating={isCreating}
            lastCreated={lastCreated}
            onUpdateSpecialEvent={updateSpecialEvent}
            onCreateDailyTodo={handleCreateTodo}
            onShowTodayTodo={handleShowTodayTodo}
          />
        )}
      </CardContent>
    </Card>
  )
}
