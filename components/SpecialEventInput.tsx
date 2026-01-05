import { Calendar } from 'lucide-react'

interface SpecialEventInputProps {
  value: string
  onChange: (value: string) => void
}

export function SpecialEventInput({ value, onChange }: SpecialEventInputProps) {
  return (
    <section className="bg-surface-muted border border-token rounded-xl p-4 mt-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Calendar className="w-5 h-5 text-brand-500 mr-2" />
          <h3 className="heading-font text-sm font-semibold text-primary">오늘의 특별 일정</h3>
        </div>
        {value && (
          <button
            onClick={() => onChange('')}
            className="text-xs text-secondary hover:text-primary"
            type="button"
          >
            지우기
          </button>
        )}
      </div>

      <p className="text-xs text-secondary mb-3">예: 10시 팀 회의, 3시 발표, 면접 등</p>

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="일정을 입력해 보세요"
          className="w-full px-4 py-3 pr-10 bg-surface border border-token rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-sm"
        />
        <Calendar className="w-4 h-4 text-secondary absolute right-3 top-1/2 -translate-y-1/2" />
      </div>
    </section>
  )
}
