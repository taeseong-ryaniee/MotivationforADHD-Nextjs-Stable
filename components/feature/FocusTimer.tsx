'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Timer } from 'lucide-react'
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
    <Card className={cn("border shadow-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2 font-sans">
          <Timer className="w-5 h-5 text-primary" />
          집중 타이머
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-5">
          <div className="relative w-full flex justify-center py-4">
            <div className="text-5xl font-mono font-bold tracking-wider tabular-nums z-10 relative">
              {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-500 transition-all duration-1000 ease-linear"
              style={{ width: `${100 - progress}%` }}
            />
          </div>

          <div className="flex gap-3 w-full pt-2">
            <Button 
              className={cn(
                "flex-1 font-semibold shadow-sm transition-all", 
                isActive 
                  ? "bg-amber-500 hover:bg-amber-600 text-white" 
                  : "bg-brand-500 hover:bg-brand-600 text-white"
              )}
              onClick={toggleTimer}
            >
              {isActive ? (
                <><Pause className="mr-2 h-4 w-4" /> 일시정지</>
              ) : (
                <><Play className="mr-2 h-4 w-4" /> 시작하기</>
              )}
            </Button>
            <Button variant="outline" size="icon" onClick={resetTimer} className="border-input hover:bg-accent text-accent-foreground">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
