import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'white' | 'gray' | 'green'
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  color = 'blue',
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const colorClasses = {
    blue: 'border-brand-500',
    white: 'border-white',
    gray: 'border-token',
    green: 'border-success-500',
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-b-2',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  )
}
