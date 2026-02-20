import { memo, useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SpecialEventInputProps {
  value: string
  onChange: (value: string) => void
}

export const SpecialEventInput = memo(function SpecialEventInput({ value, onChange }: SpecialEventInputProps) {
  const [draft, setDraft] = useState('')
  const [showQuickItems, setShowQuickItems] = useState(false)
  const quickItems = ['아침 운동 20분', '팀 미팅 1건', '집중 업무 2시간', '병원/약 복용 체크']

  const items = useMemo(
    () =>
      value
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
    [value]
  )

  const addItem = () => {
    const next = draft.trim()
    if (!next) return
    onChange([...items, next].join('\n'))
    setDraft('')
  }

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index).join('\n'))
  }

  const handleDraftKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addItem()
    }
  }

  const handleQuickAdd = (item: string) => {
    if (items.includes(item)) return
    onChange([...items, item].join('\n'))
  }

  return (
    <div className="space-y-4">
      {value && (
        <div className="flex justify-end">
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
        </div>
      )}
      <div className="space-y-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setShowQuickItems((prev) => !prev)}
          aria-label={showQuickItems ? '추천 일정 숨기기' : '추천 일정 보기'}
        >
          {showQuickItems ? '추천 일정 숨기기' : '+ 추천 일정'}
        </Button>
        {showQuickItems && (
          <div className="flex flex-wrap gap-2">
            {quickItems.map((item) => (
              <Button
                key={item}
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-full px-3 text-xs"
                onClick={() => handleQuickAdd(item)}
                disabled={items.includes(item)}
                aria-label={`빠른 추가: ${item}`}
              >
                {item}
              </Button>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          id="special-event-input"
          name="specialEvent"
          autoComplete="off"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleDraftKeyDown}
          placeholder="예: 보고서 작성 1시간…"
          className="h-12 border-primary/20 text-base focus-visible:ring-primary shadow-sm"
          aria-label="오늘 나의 To-do"
        />
        <Button type="button" onClick={addItem} className="h-12 px-4" aria-label="일정 추가">
          <Plus className="h-4 w-4" aria-hidden="true" />
          추가
        </Button>
      </div>

      {items.length > 0 && (
        <ul className="space-y-2 rounded-lg border border-border/60 bg-background/60 p-3">
          <li className="pb-1 text-xs text-muted-foreground">총 {items.length}개 일정</li>
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 flex-1 break-words text-foreground">
                {index + 1}. {item}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() => removeItem(index)}
                aria-label={`일정 삭제: ${item}`}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-border/70 bg-muted/20 p-3 text-sm text-muted-foreground">
          아직 일정이 없어요. 가장 중요한 1개만 먼저 추가해보세요.
        </p>
      )}
    </div>
  )
})
