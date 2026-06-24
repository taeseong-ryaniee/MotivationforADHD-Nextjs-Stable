'use client'

import dynamic from 'next/dynamic'

const SyncSettings = dynamic(() => import('@/components/SyncSettings'), {
  ssr: false,
})

export default function SettingsPage() {
  return <SyncSettings />
}
