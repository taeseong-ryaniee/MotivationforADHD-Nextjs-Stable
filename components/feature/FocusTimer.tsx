'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Timer } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function FocusTimer({ className }: { className?: string }) {
  const INITIAL_TIME = 25 * 60 // 25 minutes
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft])

  const toggleTimer = () => setIsActive(!isActive)
  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(INITIAL_TIME)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((INITIAL_TIME - timeLeft) / INITIAL_TIME) * 100

  return (
    <Card className={cn('border-border/60 bg-card/80 shadow-sm', className)} data-section="dashboard-focus-timer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2 font-sans">
          <Timer className="w-4 h-4 text-primary" aria-hidden="true" />
          집중 타이머
        </CardTitle>
        <Badge
          variant={isActive ? 'default' : 'secondary'}
          className={
            isActive
              ? 'border-emerald-200 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
              : 'text-muted-foreground'
          }
        >
          {isActive ? '집중 중' : '대기'}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-5">
          <div className="relative flex w-full justify-center py-4">
            <div className="relative z-10 text-4xl font-bold tracking-wider tabular-nums text-foreground font-mono">
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
            <div
              className="h-full bg-primary transition-all duration-1000 ease-linear"
              style={{ width: `${100 - progress}%` }}
            />
          </div>

          <div className="flex w-full gap-3 pt-2">
            <Button
              className={cn(
                'flex-1 font-semibold shadow-sm transition-all',
                isActive
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
              onClick={toggleTimer}
            >
              {isActive ? (
                <>
                  <Pause className="mr-2 h-4 w-4" aria-hidden="true" /> 일시정지
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" aria-hidden="true" /> 시작하기
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={resetTimer}
              className="border-border/60 text-foreground hover:bg-accent"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
