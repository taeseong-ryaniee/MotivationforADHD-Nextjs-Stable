import React from 'react'
import { cn } from '@/lib/utils'

interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  icon?: React.ReactNode
  children?: React.ReactNode
}

export function BaseButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  icon,
  children,
  className,
  ...props
}: BaseButtonProps) {
  const baseClasses =
    'font-medium transition-all duration-200 flex items-center justify-center space-x-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1'

  const variantClasses = {
    primary:
      'bg-brand-500 hover:bg-brand-600 text-white focus:ring-brand-300 dark:bg-brand-600 dark:hover:bg-brand-600/90 dark:focus:ring-brand-300',
    secondary:
      'bg-surface-muted hover:bg-surface text-primary focus:ring-brand-300 dark:bg-surface-muted dark:hover:bg-surface',
    outline:
      'border border-token hover:bg-surface-muted text-primary focus:ring-brand-300',
    ghost: 'hover:bg-surface-muted text-primary focus:ring-brand-300',
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  }

  return (
    <button
      className={cn(
        'btn-root',
        `btn-${variant}`,
        baseClasses,
        variantClasses[variant],
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
  )
}
