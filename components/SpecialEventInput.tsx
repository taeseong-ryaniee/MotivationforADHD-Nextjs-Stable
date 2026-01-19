import { memo } from 'react'
import { Calendar } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'

interface SpecialEventInputProps {
  value: string
  onChange: (value: string) => void
}

export const SpecialEventInput = memo(function SpecialEventInput({ value, onChange }: SpecialEventInputProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label htmlFor="special-event-input" className="flex items-center gap-2 text-lg font-bold text-primary">
          <Calendar className="h-6 w-6 text-primary" aria-hidden="true" />
          오늘의 특별 일정
        </label>
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-3 py-1.5 text-base text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={() => onChange('')}
            type="button"
            aria-label="일정 지우기"
          >
            지우기
          </Button>
        )}
      </div>
      <p id="special-event-hint" className="text-base text-muted-foreground">
        예: 10시 회의 · 3시 발표 · 면접
      </p>
      <div className="relative mt-2">
        <Input
          id="special-event-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="일정을 입력해 보세요"
          className="pr-12 h-14 text-lg border-primary/20 focus-visible:ring-primary shadow-sm"
          aria-label="오늘의 특별 일정"
          aria-describedby="special-event-hint"
        />
        <Calendar className="pointer-events-none absolute right-4 top-1/2 h-6 w-6 -translate-y-1/2 text-primary/40" aria-hidden="true" />
      </div>
    </div>
  )
})
