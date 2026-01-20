import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router'
import { AppShell } from '@/components/AppShell'
import { DashboardView } from '@/components/feature/DashboardView'
import { HistoryView } from '@/components/feature/HistoryView'
import { TodoDetailView } from '@/components/feature/TodoDetailView'
import SyncSettings from '@/components/SyncSettings'

const rootRoute = createRootRoute({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardView,
})

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: HistoryView,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SyncSettings,
})

const todoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/todo/$id',
  component: TodoDetailView,
})

const routeTree = rootRoute.addChildren([indexRoute, historyRoute, settingsRoute, todoRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
