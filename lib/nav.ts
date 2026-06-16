import { Settings, Clock, LayoutDashboard, NotebookPen } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  title: string
  mobileTitle: string
  url: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { title: '오늘의 To-do', mobileTitle: '오늘', url: '/today', icon: NotebookPen },
  { title: '대시보드', mobileTitle: '대시보드', url: '/dashboard', icon: LayoutDashboard },
  { title: '히스토리', mobileTitle: '히스토리', url: '/history', icon: Clock },
  { title: '설정', mobileTitle: '설정', url: '/settings', icon: Settings },
]
