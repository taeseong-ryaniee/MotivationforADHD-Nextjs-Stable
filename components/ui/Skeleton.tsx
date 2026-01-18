import * as React from 'react'
import { cn } from '@/lib/utils'

type SkeletonVariant = 'card' | 'text' | 'button' | 'avatar'

interface SkeletonProps {
  className?: string
  variant?: SkeletonVariant
}

const skeletonStyles = {
  card: 'h-40 w-full rounded-2xl',
  text: 'h-4 w-32 rounded',
  button: 'h-10 w-24 rounded-full',
  avatar: 'h-10 w-10 rounded-full',
}

export function Skeleton({ className, variant = 'card' }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse bg-surface-muted', skeletonStyles[variant], className)}
      role="status"
      aria-label="로딩 중"
    />
  )
}
