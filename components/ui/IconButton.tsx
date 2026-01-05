import React from 'react'
import { cn } from '@/lib/utils'

interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  rounded?: boolean
  'aria-label': string // Required for accessibility
  children: React.ReactNode
}

export function IconButton({
  variant = 'ghost',
  size = 'md',
  rounded = true,
  disabled = false,
  'aria-label': ariaLabel,
  children,
  className,
  ...props
}: IconButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1'

  const variantClasses = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white focus:ring-brand-300',
    secondary: 'bg-surface-muted hover:bg-surface text-primary focus:ring-brand-300',
    outline: 'border border-token hover:bg-surface-muted text-primary focus:ring-brand-300',
    ghost: 'hover:bg-surface-muted text-primary focus:ring-brand-300',
  }

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  }

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        rounded ? 'rounded-full' : 'rounded-lg',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  )
}
