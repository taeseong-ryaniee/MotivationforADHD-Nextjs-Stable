'use client'

import dynamic from 'next/dynamic'

const AppRouter = dynamic(() => import('@/components/AppRouter').then(mod => mod.AppRouter), {
  ssr: false,
})

export default function Page() {
  return <AppRouter />
}
