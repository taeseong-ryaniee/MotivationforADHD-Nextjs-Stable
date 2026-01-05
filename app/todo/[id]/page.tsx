'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TodayTodoView } from '@/components/TodayTodoView'
import { getTodoById } from '@/lib/db'
import { useTodoStore } from '@/lib/store'
import type { TodoData } from '@/lib/types'

export default function TodoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [todo, setTodo] = useState<TodoData | null>(null)
  const copyToClipboard = useTodoStore((state) => state.copyToClipboard)

  useEffect(() => {
    const loadTodo = async () => {
      const todoData = await getTodoById(resolvedParams.id)
      if (todoData) {
        setTodo(todoData)
      } else {
        router.push('/')
      }
    }

    loadTodo()
  }, [resolvedParams.id, router])

  const handleBack = () => {
    router.push('/')
  }

  const handleCopyContent = async (content: string) => {
    await copyToClipboard(content)
    alert('클립보드에 복사되었습니다!')
  }

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 min-h-screen p-6 pt-safe pb-24-safe">
      <div className="bg-surface border border-token rounded-2xl shadow-lg p-6">
        <TodayTodoView
          todayTodo={todo}
          onBack={handleBack}
          onCopyContent={handleCopyContent}
        />
      </div>
    </div>
  )
}
