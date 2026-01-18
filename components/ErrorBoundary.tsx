'use client'

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the component tree
 * Displays a fallback UI and provides recovery options
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // TODO: Send to error tracking service in production
    // if (process.env.NODE_ENV === 'production') {
    //   logErrorToService(error, errorInfo)
    // }
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
          <Card className="max-w-md w-full p-8 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>

              <h2 className="heading-font text-xl font-bold text-primary mb-2">
                문제가 발생했습니다
              </h2>

              <p className="text-secondary text-sm mb-6">
                앱 실행 중 오류가 발생했습니다. 아래 옵션을 시도해보세요.
              </p>

              {process.env.NODE_ENV === 'development' && (
                <div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-left">
                  <p className="text-xs font-mono text-red-800 dark:text-red-300 break-words">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer">
                        스택 트레이스 보기
                      </summary>
                      <pre className="text-xs font-mono text-red-700 dark:text-red-400 mt-2 overflow-x-auto">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="space-y-3 w-full">
                <Button variant="default" size="lg" className="w-full" onClick={this.reset}>
                  <RefreshCcw className="h-4 w-4" />
                  다시 시도
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    this.reset()
                    window.location.href = '/'
                  }}
                >
                  <Home className="h-4 w-4" />
                  홈으로 돌아가기
                </Button>
              </div>

              <p className="text-xs text-secondary mt-6">
                문제가 계속되면 앱을 새로고침해주세요
              </p>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
