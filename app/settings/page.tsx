'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Palette, Settings as SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import SyncSettings from '@/components/SyncSettings'
import { ThemeToggle } from '@/components/feature/ThemeToggle'

export default function SettingsPage() {
  const router = useRouter()

  return (
    <div className="space-y-10 pb-24">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
            <SettingsIcon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-primary">설정</h2>
            <p className="text-sm font-medium text-muted-foreground">앱 환경설정 및 데이터 관리</p>
          </div>
        </div>
        <Button variant="ghost" size="lg" onClick={() => router.push('/')} className="text-base">
          <ArrowLeft className="h-5 w-5 mr-2" />
          홈으로
        </Button>
      </div>

      <div className="grid gap-8">
        {/* 테마 설정 */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Palette className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl">화면 테마</CardTitle>
            </div>
            <CardDescription className="text-base">
              라이트 모드와 다크 모드를 전환합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-2">
            <span className="text-lg font-medium">테마 전환</span>
            <ThemeToggle />
          </CardContent>
        </Card>

        {/* 데이터 동기화 설정 */}
        <SyncSettings />
      </div>
    </div>
  )
}
