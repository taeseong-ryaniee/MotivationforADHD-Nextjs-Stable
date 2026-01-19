'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Clock, Home, Settings } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { Card, CardContent } from './ui/card'

const navItems = [
  { href: '/', label: '홈', icon: Home },
  { href: '/history', label: '히스토리', icon: Clock },
  { href: '/settings', label: '설정', icon: Settings },
]

const isActiveRoute = (pathname: string, href: string) => {
  if (href === '/') {
    return pathname === '/' || pathname.startsWith('/todo')
  }
  return pathname === href
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-surface-muted text-primary">
      <div className="mx-auto flex w-full max-w-5xl gap-6 px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-10">
        <aside className="hidden w-56 shrink-0 lg:flex lg:flex-col lg:gap-4">
          <div className="flex items-center gap-3 px-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
              <span className="text-lg">☀️</span>
            </div>
            <div>
              <p className="text-sm font-bold text-primary">산만이의 아침</p>
              <p className="text-[10px] text-muted-foreground">오늘의 시작</p>
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground">빠른 이동</p>
              <nav className="mt-3 space-y-2">
                {navItems.map(({ href, label, icon: Icon }) => {
                  const isActive = isActiveRoute(pathname, href)
                  const itemClass = `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md'
                      : 'text-primary hover:bg-surface-muted hover:shadow-sm focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2'
                  }`

                  return (
                    <Link
                      key={href}
                      href={href}
                      className={itemClass}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {label}
                    </Link>
                  )
                })}
              </nav>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">화면 테마</span>
              <ThemeToggle />
            </CardContent>
          </Card>
        </aside>

        <main id="main-content" role="main" className="w-full">
          {children}
        </main>
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 w-full h-16 border-t border-token/70 bg-surface/90 backdrop-blur lg:hidden"
        aria-label="하단 네비게이션"
      >
        <div className="h-full mx-auto px-2 flex items-center justify-between max-w-5xl">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = isActiveRoute(pathname, href)
            const itemClass = `flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition-all duration-200 ${
              isActive
                ? 'text-brand-600 bg-brand-50'
                : 'text-muted-foreground hover:text-primary'
            }`

            return (
              <Link
                key={href}
                href={href}
                className={itemClass}
                style={{ minHeight: '48px', minWidth: '48px' }}
                aria-current={isActive ? 'page' : undefined}
              >
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
