'use client'

import dynamic from 'next/dynamic'

// IndexedDB(브라우저 전용)에 의존하므로 SSR을 끈다.
const DashboardView = dynamic(
  () => import('@/components/feature/DashboardView').then((m) => m.DashboardView),
  { ssr: false },
)

export default function TodayPage() {
  return <DashboardView />
}
