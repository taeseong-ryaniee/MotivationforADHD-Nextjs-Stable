'use client'

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { TodayTodoView } from '@/components/feature/TodayTodoView'
import { Card, CardContent } from '@/components/ui/card'
import { getTodoById } from '@/lib/db'
import { useTodoStore } from '@/lib/store'
import type { TodoData } from '@/lib/types'
import { showSuccess } from '@/lib/toast'

export function TodoDetailView() {
  const { id } = useParams({ from: '/todo/$id' })
  const navigate = useNavigate()
  const [todo, setTodo] = useState<TodoData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const copyToClipboard = useTodoStore((state) => state.copyToClipboard)
  const updateTodo = useTodoStore((state) => state.updateTodo)

  useEffect(() => {
    const loadTodo = async () => {
      setIsLoading(true)
      const todoData = await getTodoById(id)
      if (todoData) {
        setTodo(todoData)
      } else {
        navigate({ to: '/' })
      }
      setIsLoading(false)
    }

    loadTodo()
  }, [id, navigate])

  const handleBack = () => {
    navigate({ to: '/' })
  }

  const handleCopyContent = async (content: string) => {
    await copyToClipboard(content)
    showSuccess('클립보드에 복사되었습니다!')
  }

  return (
    <Card className="shadow-lg h-full border-none sm:border bg-background/50 backdrop-blur-sm">
      <CardContent className="p-4 sm:p-8 lg:p-10 h-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-brand-500" />
            <p className="text-sm text-muted-foreground">To-do를 불러오는 중...</p>
          </div>
        ) : (
          <TodayTodoView
            todayTodo={todo}
            onBack={handleBack}
            onCopyContent={handleCopyContent}
            onUpdate={async (newContent) => {
                if (todo) {
                    await updateTodo(todo.id, newContent);
                    setTodo({ ...todo, content: newContent });
                }
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}
