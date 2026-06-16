'use client'

import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { TodayTodoView } from '@/components/feature/TodayTodoView'
import { Card, CardContent } from '@/components/ui/card'
import { useDailyTodo, useSaveTodo } from '@/hooks/useTodos'
import { showSuccess } from '@/lib/toast'
import { copyToClipboard } from '@/lib/utils'

export function TodayTodoPageView() {
  const navigate = useNavigate()
  const { todayTodo, isLoadingTodayTodo } = useDailyTodo()
  const saveMutation = useSaveTodo()

  useEffect(() => {
    if (!isLoadingTodayTodo && !todayTodo) {
      navigate({ to: '/dashboard', replace: true })
    }
  }, [isLoadingTodayTodo, navigate, todayTodo])

  const handleCopyContent = async (content: string) => {
    await copyToClipboard(content)
    showSuccess('클립보드에 복사되었습니다!')
  }

  if (isLoadingTodayTodo) {
    return (
      <Card className="h-full border-border/60 bg-card/80 shadow-sm">
        <CardContent className="h-full p-4 sm:p-8 lg:p-10">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">오늘의 To-do를 불러오는 중…</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!todayTodo) {
    return null
  }

  return (
    <Card className="h-full border-border/60 bg-card/80 shadow-sm">
      <CardContent className="h-full p-4 sm:p-8 lg:p-10">
        <TodayTodoView
          todayTodo={todayTodo}
          onBack={() => navigate({ to: '/dashboard' })}
          onCopyContent={handleCopyContent}
          onUpdate={async (newContent) => {
            await saveMutation.mutateAsync({
              ...todayTodo,
              content: newContent,
            })
          }}
        />
      </CardContent>
    </Card>
  )
}
