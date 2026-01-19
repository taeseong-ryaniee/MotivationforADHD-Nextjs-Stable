'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Trash2, ArrowLeft, Loader2 } from 'lucide-react'
import { useTodoStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { showConfirm, showSuccess } from '@/lib/toast'

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
    <div className="space-y-10 pb-24">
      <Card className="shadow-lg border-0">
        <CardContent className="p-8 sm:p-10">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
                <Clock className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">최근 기록</p>
                <h2 className="text-3xl font-bold text-primary">히스토리</h2>
              </div>
            </div>
            <Button variant="ghost" size="lg" onClick={() => router.push('/')} className="text-base">
              <ArrowLeft className="h-5 w-5 mr-2" />
              홈으로
            </Button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
              <p className="text-muted-foreground text-base">히스토리를 불러오는 중...</p>
            </div>
          ) : todoHistory.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                {todoHistory.map((todo) => (
                  <Card
                    key={todo.id}
                    className="group cursor-pointer p-6 transition hover:-translate-y-1 hover:shadow-lg border-muted/40"
                    onClick={() => router.push(`/todo/${todo.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-lg font-bold text-primary">{todo.date}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{todo.createdAt}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        aria-label="삭제"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(todo.id)
                        }}
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mt-8 border-t border-token/60 pt-6">
                <Button variant="outline" size="lg" className="w-full text-base h-12" onClick={handleClearAll}>
                  모든 히스토리 삭제
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-24">
              <Clock className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-30" aria-hidden="true" />
              <p className="text-xl font-medium text-primary mb-3">아직 히스토리가 없습니다</p>
              <p className="text-base text-muted-foreground leading-relaxed">
                To-do를 생성하면 여기에 표시됩니다
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
