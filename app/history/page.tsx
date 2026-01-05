'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Trash2, ArrowLeft } from 'lucide-react'
import { useTodoStore } from '@/lib/store'
import { BaseButton } from '@/components/ui/BaseButton'
import { IconButton } from '@/components/ui/IconButton'

export default function HistoryPage() {
  const router = useRouter()
  const { todoHistory, loadTodoHistory, removeFromHistory, clearHistory } = useTodoStore()

  useEffect(() => {
    loadTodoHistory()
  }, [loadTodoHistory])

  const handleDelete = async (id: string) => {
    if (confirm('이 To-do를 삭제하시겠습니까?')) {
      await removeFromHistory(id)
    }
  }

  const handleClearAll = async () => {
    if (confirm('모든 히스토리를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      await clearHistory()
    }
  }

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 min-h-screen p-6 pt-safe pb-24-safe">
      <div className="bg-surface border border-token rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-brand-500 mr-2" />
            <h2 className="heading-font text-lg font-semibold text-primary">히스토리</h2>
          </div>
          <BaseButton
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            홈으로
          </BaseButton>
        </div>

        {todoHistory.length > 0 ? (
          <>
            <div className="space-y-3 mb-4">
              {todoHistory.map((todo) => (
                <div
                  key={todo.id}
                  className="bg-surface-muted border border-token rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer flex justify-between items-start"
                  onClick={() => router.push(`/todo/${todo.id}`)}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary mb-1">{todo.date}</p>
                    <p className="text-xs text-secondary">{todo.createdAt}</p>
                  </div>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    aria-label="삭제"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(todo.id)
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </IconButton>
                </div>
              ))}
            </div>

            <BaseButton
              variant="outline"
              size="sm"
              fullWidth
              onClick={handleClearAll}
            >
              모든 히스토리 삭제
            </BaseButton>
          </>
        ) : (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-secondary mx-auto mb-4 opacity-50" />
            <p className="text-secondary">아직 히스토리가 없습니다</p>
            <p className="text-sm text-secondary mt-2">
              To-do를 생성하면 여기에 표시됩니다
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
