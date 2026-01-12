'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Clock, Home, Settings } from 'lucide-react'
import { Card, CardContent } from './ui/Card'

const navItems = [
  { href: '/', label: '홈', icon: Home },
  { href: '/history', label: '히스토리', icon: Clock },
  { href: '/settings', label: '설정', icon: Settings, disabled: true },
]

const getRouteLabel = (pathname: string) => {
  if (pathname === '/') return '오늘의 시작'
  if (pathname === '/history') return '히스토리'
  if (pathname.startsWith('/todo')) return '오늘의 To-do'
  return '산만이'
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const currentLabel = getRouteLabel(pathname)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-primary">
      <header className="sticky top-0 z-40 border-b border-token/60 bg-surface/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
              <span className="text-lg">☀️</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-secondary">산만이의 아침</p>
              <p className="text-base font-semibold">{currentLabel}</p>
            </div>
          </div>
          <p className="hidden text-xs text-secondary sm:block">
            오늘의 에너지와 흐름을 빠르게 정리하세요
          </p>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl gap-6 px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-10">
        <aside className="hidden w-56 shrink-0 lg:flex lg:flex-col lg:gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-secondary">빠른 이동</p>
              <nav className="mt-3 space-y-2">
                {navItems.map(({ href, label, icon: Icon, disabled }) => {
                  const isActive = href === '/'
                    ? pathname === '/' || pathname.startsWith('/todo')
                    : pathname === href
                  const itemClass = `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-brand-500 text-white' : 'text-primary hover:bg-surface-muted'
                  }`

                  if (disabled) {
                    return (
                      <div key={href} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-secondary/70">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {label}
                        <span className="ml-auto rounded-full bg-surface-muted px-2 py-0.5 text-[10px] text-secondary">
                          준비중
                        </span>
                      </div>
                    )
                  }

                  return (
                    <Link key={href} href={href} className={itemClass}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {label}
                    </Link>
                  )
                })}
              </nav>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-xs text-secondary">
              짧고 선명하게, 오늘 해야 할 일만 남깁니다.
            </CardContent>
          </Card>
        </aside>

        <main id="main-content" role="main" className="w-full">
          {children}
        </main>
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-token/70 bg-surface/90 px-6 py-3 backdrop-blur lg:hidden"
        aria-label="하단 네비게이션"
      >
        <div className="mx-auto flex max-w-md items-center justify-between">
          {navItems.map(({ href, label, icon: Icon, disabled }) => {
            const isActive = href === '/'
              ? pathname === '/' || pathname.startsWith('/todo')
              : pathname === href
            const itemClass = `flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium ${
              isActive ? 'text-brand-600' : 'text-secondary'
            }`

            if (disabled) {
              return (
                <div key={href} className="flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-secondary/60">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {label}
                </div>
              )
            }

            return (
              <Link key={href} href={href} className={itemClass}>
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
