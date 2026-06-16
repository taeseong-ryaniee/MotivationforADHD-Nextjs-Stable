import { Settings, Clock, LayoutDashboard } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  title: string
  mobileTitle: string
  url: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { title: '대시보드', mobileTitle: '대시보드', url: '/dashboard', icon: LayoutDashboard },
  { title: '히스토리', mobileTitle: '히스토리', url: '/history', icon: Clock },
  { title: '설정', mobileTitle: '설정', url: '/settings', icon: Settings },
]
