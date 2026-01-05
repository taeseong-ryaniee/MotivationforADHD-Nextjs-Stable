import React from 'react'
import { cn } from '@/lib/utils'

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  gradient?: 'green-blue' | 'pink-purple' | 'orange-red' | 'blue-purple'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  icon?: React.ReactNode
  children?: React.ReactNode
}

export function GradientButton({
  gradient = 'green-blue',
  size = 'md',
  fullWidth = false,
  disabled = false,
  icon,
  children,
  className,
  ...props
}: GradientButtonProps) {
  const gradients = {
    'green-blue': 'bg-gradient-to-r from-green-400 to-blue-500',
    'pink-purple': 'bg-gradient-to-r from-pink-400 to-purple-500',
    'orange-red': 'bg-gradient-to-r from-orange-400 to-red-500',
    'blue-purple': 'bg-gradient-to-r from-blue-400 to-purple-500',
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  }

  return (
    <div
      className={cn(
        'rounded-xl p-1',
        gradients[gradient],
        'dark:from-slate-800 dark:to-slate-900',
        fullWidth && 'w-full'
      )}
    >
      <button
        className={cn(
          'bg-surface rounded-lg font-semibold text-primary hover:bg-surface-muted transition-all duration-200',
          'flex items-center justify-center space-x-2',
          'focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50',
          sizeClasses[size],
          fullWidth && 'w-full',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        disabled={disabled}
        {...props}
      >
        {icon}
        {children && <span>{children}</span>}
      </button>
    </div>
  )
}
