import { toast } from 'sonner'

/**
 * Toast notification utilities
 * Wrapper functions for consistent toast usage throughout the app
 */

/**
 * Show success toast
 */
export const showSuccess = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 3000
  })
}

/**
 * Show error toast
 */
export const showError = (message: string, description?: string) => {
  toast.error(message, {
    description,
    duration: 5000
  })
}

/**
 * Show info toast
 */
export const showInfo = (message: string, description?: string) => {
  toast.info(message, {
    description,
    duration: 4000
  })
}

/**
 * Show warning toast
 */
export const showWarning = (message: string, description?: string) => {
  toast.warning(message, {
    description,
    duration: 4000
  })
}

/**
 * Show confirmation toast with action button
 */
export const showConfirm = (
  message: string,
  onConfirm: () => void,
  options?: {
    description?: string
    confirmLabel?: string
    cancelLabel?: string
  }
) => {
  toast(message, {
    description: options?.description,
    duration: Infinity, // Don't auto-dismiss
    action: {
      label: options?.confirmLabel || '확인',
      onClick: onConfirm
    },
    cancel: {
      label: options?.cancelLabel || '취소',
      onClick: () => {}
    }
  })
}

/**
 * Show loading toast (returns ID to dismiss later)
 */
export const showLoading = (message: string) => {
  return toast.loading(message)
}

/**
 * Dismiss a specific toast by ID
 */
export const dismissToast = (id: string | number) => {
  toast.dismiss(id)
}

/**
 * Dismiss all toasts
 */
export const dismissAll = () => {
  toast.dismiss()
}
