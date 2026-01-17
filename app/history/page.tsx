'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Trash2, ArrowLeft, Loader2 } from 'lucide-react'
import { useTodoStore } from '@/lib/store'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { showConfirm, showSuccess } from '@/lib/toast'

import SyncSettings from '@/components/SyncSettings'

export default function HistoryPage() {
  const router = useRouter()
  const { todoHistory, loadTodoHistory, removeFromHistory, clearHistory } = useTodoStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await loadTodoHistory()
      setIsLoading(false)
    }
    loadData()
  }, [loadTodoHistory])

  const handleDelete = async (id: string) => {
    showConfirm(
      '이 To-do를 삭제하시겠습니까?',
      async () => {
        await removeFromHistory(id)
        showSuccess('To-do가 삭제되었습니다')
      }
    )
  }

  const handleClearAll = async () => {
    showConfirm(
      '모든 히스토리를 삭제하시겠습니까?',
      async () => {
        await clearHistory()
        showSuccess('모든 히스토리가 삭제되었습니다')
      },
      {
        description: '이 작업은 되돌릴 수 없습니다.'
      }
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <Card className="shadow-lg">
        <CardContent className="p-6 sm:p-8 lg:p-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
                <Clock className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold text-secondary">최근 기록</p>
                <h2 className="text-xl font-semibold text-primary md:text-2xl">히스토리</h2>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4" />
              홈으로
            </Button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-4" />
              <p className="text-secondary text-sm">히스토리를 불러오는 중...</p>
            </div>
          ) : todoHistory.length > 0 ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {todoHistory.map((todo) => (
                  <Card
                    key={todo.id}
                    className="group cursor-pointer p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                    onClick={() => router.push(`/todo/${todo.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-primary">{todo.date}</p>
                        <p className="mt-1 text-xs text-secondary">{todo.createdAt}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="삭제"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(todo.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mt-6 border-t border-token/60 pt-5">
                <Button variant="outline" size="sm" className="w-full" onClick={handleClearAll}>
                  모든 히스토리 삭제
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Clock className="w-16 h-16 text-secondary mx-auto mb-4 opacity-40" aria-hidden="true" />
              <p className="text-primary font-medium mb-2">아직 히스토리가 없습니다</p>
              <p className="text-sm text-secondary leading-relaxed">
                To-do를 생성하면 여기에 표시됩니다
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="ml-1 text-lg font-semibold text-primary">데이터 관리</h3>
        <SyncSettings />
      </div>
    </div>
  )
}
