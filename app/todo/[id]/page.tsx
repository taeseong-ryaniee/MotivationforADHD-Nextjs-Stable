'use client'

import dynamic from 'next/dynamic'

const TodoDetailView = dynamic(
  () => import('@/components/feature/TodoDetailView').then((m) => m.TodoDetailView),
  { ssr: false },
)

export default function TodoDetailPage() {
  return <TodoDetailView />
}
