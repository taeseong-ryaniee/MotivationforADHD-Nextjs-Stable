'use client'

import { useNavigate, useParams } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { TodayTodoView } from '@/components/feature/TodayTodoView'
import { Card, CardContent } from '@/components/ui/card'
import { useTodo, useSaveTodo } from '@/hooks/useTodos'
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
      <Card className="h-full border-border/60 bg-card/80 shadow-sm">
        <CardContent className="flex min-h-[60vh] flex-col items-center justify-center p-8">
          <p className="text-muted-foreground">To-do를 찾을 수 없어요.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full border-border/60 bg-card/80 shadow-sm">
      <CardContent className="h-full p-4 sm:p-8 lg:p-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
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
