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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="special-event-input" className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Calendar className="h-4 w-4 text-brand-500" aria-hidden="true" />
          오늘의 특별 일정
        </label>
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-2 py-1 text-xs text-secondary hover:text-primary"
            onClick={() => onChange('')}
            type="button"
            aria-label="일정 지우기"
          >
            지우기
          </Button>
        )}
      </div>
      <p id="special-event-hint" className="text-xs text-secondary">
        예: 10시 회의 · 3시 발표 · 면접
      </p>
      <div className="relative">
        <Input
          id="special-event-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="일정을 입력해 보세요"
          className="pr-10"
          aria-label="오늘의 특별 일정"
          aria-describedby="special-event-hint"
        />
        <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" aria-hidden="true" />
      </div>
    </div>
  )
})
