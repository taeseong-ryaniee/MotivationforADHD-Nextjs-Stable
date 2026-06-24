'use client'

import dynamic from 'next/dynamic'

const HistoryView = dynamic(
  () => import('@/components/feature/HistoryView').then((m) => m.HistoryView),
  { ssr: false },
)

export default function HistoryPage() {
  return <HistoryView />
}
