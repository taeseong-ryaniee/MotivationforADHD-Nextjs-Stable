'use client'

import { Toaster as Sonner } from 'sonner'

/**
 * Toast notification component using Sonner
 * Provides accessible, beautiful toast notifications
 */
export function Toaster() {
  return (
    <Sonner
      position="top-center"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'bg-surface border-token rounded-lg shadow-lg',
          title: 'text-primary font-medium',
          description: 'text-secondary text-sm',
          actionButton: 'bg-blue-600 text-white hover:bg-blue-700',
          cancelButton: 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200',
          closeButton: 'bg-surface border-token hover:bg-gray-100 dark:hover:bg-gray-800',
          error: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
          success: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
          warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
          info: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
        }
      }}
    />
  )
}
