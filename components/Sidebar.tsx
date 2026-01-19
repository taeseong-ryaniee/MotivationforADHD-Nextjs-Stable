'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Clock, Coffee, Home } from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const links = [
    { href: '/', icon: Home, label: '홈' },
    { href: '/history', icon: Clock, label: '히스토리' },
  ]

  return (
    <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 bg-surface border-r border-token p-6 pt-safe">
      <div className="flex items-center mb-8">
        <Coffee className="text-amber-500 w-8 h-8 mr-2" aria-hidden="true" />
        <h2 className="heading-font text-xl font-bold text-primary">산만이</h2>
      </div>
      <nav aria-label="메인 네비게이션">
        <ul className="space-y-2">
          {links.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white'
                      : 'text-primary hover:bg-surface-muted'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" aria-hidden="true" />
                  <span className="font-medium">{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="absolute bottom-6 left-6 right-6">
        <p className="text-xs text-muted-foreground leading-relaxed">
          산만이의 정신없는 아침을 응원합니다
        </p>
      </div>
    </aside>
  )
}
