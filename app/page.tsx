'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainScreen } from '@/components/MainScreen'
import { useTodoStore } from '@/lib/store'
import { migrateFromLocalStorage } from '@/lib/db'

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

  useEffect(() => {
    const init = async () => {
      // Migrate old data from localStorage
      await migrateFromLocalStorage()

      // Load content from API
      try {
        const response = await fetch('/api/content/ko')
        if (response.ok) {
          const content = await response.json()
          useTodoStore.getState().loadContent(content)
        }
      } catch (error) {
        console.error('Failed to load content:', error)
      }

      // Initialize store
      await initialize()
    }

    init()
  }, [initialize])

  const handleCreateTodo = async () => {
    try {
      const todo = await createDailyTodo()
      router.push(`/todo/${todo.id}`)
    } catch (error) {
      alert('To-do 생성 중 오류가 발생했습니다. 다시 시도해주세요.')
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

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 min-h-screen p-6 pt-safe pb-24-safe">
      <div className="bg-surface border border-token rounded-2xl shadow-lg p-6 space-y-6">
        <MainScreen
          todayMotivation={todayMotivation}
          specialEvent={specialEvent}
          isCreating={isCreating}
          lastCreated={lastCreated}
          onUpdateSpecialEvent={updateSpecialEvent}
          onCreateDailyTodo={handleCreateTodo}
          onShowTodayTodo={handleShowTodayTodo}
        />
      </div>
    </div>
  )
}
