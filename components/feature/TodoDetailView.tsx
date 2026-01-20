'use client'

import { useNavigate, useParams } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { TodayTodoView } from '@/components/feature/TodayTodoView'
import { Card, CardContent } from '@/components/ui/card'
import { useTodo, useSaveTodo } from '@/hooks/useTodos'
import type { TodoData } from '@/lib/types'
import { showSuccess } from '@/lib/toast'

export function TodoDetailView() {
  const { id } = useParams({ from: '/todo/$id' })
  const navigate = useNavigate()

  const { data: todo, isLoading, error } = useTodo(id || '')
  const saveMutation = useSaveTodo()

  const handleBack = () => {
    navigate({ to: '/' })
  }

  const handleCopyContent = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = content
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
    showSuccess('클립보드에 복사되었습니다!')
  }

  if (error) {
    return (
      <Card className="shadow-lg h-full border-none sm:border bg-background/50 backdrop-blur-sm">
        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">To-do를 찾을 수 없어요.</p>
        </CardContent>
      </Card>
    )
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
            todayTodo={todo || null}
            onBack={handleBack}
            onCopyContent={handleCopyContent}
            onUpdate={async (newContent) => {
              if (todo) {
                await saveMutation.mutateAsync({
                  ...todo,
                  content: newContent,
                })
              }
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}
