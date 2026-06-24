'use client'

import { Loader2 } from 'lucide-react'
import { StartScreen } from '@/components/feature/StartScreen'
import { TodayTodoView } from '@/components/feature/TodayTodoView'
import { Card, CardContent } from '@/components/ui/card'
import { useDailyTodo, useSaveTodo } from '@/hooks/useTodos'
import { useContent } from '@/hooks/useContent'
import { migrateFromLocalStorage } from '@/lib/db'
import { showError, showSuccess } from '@/lib/toast'
import { copyToClipboard } from '@/lib/utils'
import { useEffect, useMemo, useCallback } from 'react'

function getDayOfYear(): number {
  return Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
}

function getTodayTip(antiBrainFogTips: string[]): { title: string; body: string } | null {
  if (!antiBrainFogTips || antiBrainFogTips.length === 0) return null
  const tip = antiBrainFogTips[getDayOfYear() % antiBrainFogTips.length]
  return { title: '멍함 탈출 팁', body: tip }
}

// 아침 히어로용 — 하루 동안 안정적인(결정적) 격려 메시지를 고른다.
function getDailyMotivation(motivationMessages: string[]): string {
  if (!motivationMessages || motivationMessages.length === 0) return ''
  return motivationMessages[getDayOfYear() % motivationMessages.length]
}

export function DashboardView() {
  const { data: content, isLoading: isLoadingContent, error: contentError } = useContent('ko')

  const {
    todayTodo,
    isLoadingTodayTodo,
    isCreating,
    createDailyTodo,
  } = useDailyTodo()
  const saveTodoMutation = useSaveTodo()

  useEffect(() => {
    migrateFromLocalStorage()
  }, [])

  const cheers = useMemo(() => content?.cheers ?? [], [content])
  const tip = useMemo(() => getTodayTip(content?.antiBrainFogTips ?? []), [content])
  const motivation = useMemo(
    () => getDailyMotivation(content?.motivationMessages ?? []),
    [content]
  )

  // 단일 행동: 적어둔 항목들로 격려 To-do를 생성하면 todayTodo가 채워지고
  // 인라인으로 TodayTodoView가 뜬다 (별도 라우팅 없음). "오늘 하루 시작!" =
  // "격려 To-do 만들기"가 하나의 흐름.
  const handleStart = useCallback(async (items: string[]) => {
    if (!content) return
    try {
      await createDailyTodo({ specialEvent: items.join('\n'), content })
    } catch {
      showError('To-do 생성 중 오류가 발생했습니다', '다시 시도해주세요.')
    }
  }, [content, createDailyTodo])

  const handleCopyContent = useCallback(async (text: string) => {
    await copyToClipboard(text)
    showSuccess('클립보드에 복사되었습니다!')
  }, [])

  const handleUpdateTodo = useCallback(async (newContent: string) => {
    if (!todayTodo) return
    await saveTodoMutation.mutateAsync({ ...todayTodo, content: newContent })
  }, [saveTodoMutation, todayTodo])

  if (contentError) {
    console.error('Content loading error:', contentError)
  }

  // todo 로딩 중 → 로더 (StartScreen ↔ TodayTodoView 깜빡임 방지)
  if (isLoadingTodayTodo || isLoadingContent) {
    return (
      <Card className="border-border/60 bg-card/80 md:h-full">
        <CardContent className="flex flex-col items-center justify-center p-4 py-16 sm:p-8 md:h-full">
          <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">오늘의 To-do를 불러오는 중…</p>
        </CardContent>
      </Card>
    )
  }

  // 오늘의 To-do가 있으면 → 보기
  if (todayTodo) {
    return (
      <Card className="border-border/60 bg-card/80 md:h-full">
        <CardContent className="p-4 sm:p-8 md:h-full lg:p-10">
          <TodayTodoView
            todayTodo={todayTodo}
            onCopyContent={handleCopyContent}
            onUpdate={handleUpdateTodo}
          />
        </CardContent>
      </Card>
    )
  }

  // 없으면 → 아침 시작 화면 (격려 + 팁 + 단일 입력 + 단일 CTA)
  return (
    <div className="flex flex-1 flex-col">
      <div className="hidden md:block">
        <p className="text-xs font-semibold text-muted-foreground font-sans">Daily Focus</p>
        <h1 className="text-3xl font-extrabold">산만이의 아침</h1>
        <p className="mt-1 text-sm text-muted-foreground">오늘의 루틴을 차근히 기록해요.</p>
      </div>
      <StartScreen
        motivation={motivation}
        cheers={cheers}
        tip={tip}
        isCreating={isCreating}
        onStart={handleStart}
      />
    </div>
  )
}
