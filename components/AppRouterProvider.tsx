'use client'

import { RouterProvider } from '@tanstack/react-router'
import { router } from '@/lib/router'

export function AppRouterProvider() {
  return <RouterProvider router={router} />
}
