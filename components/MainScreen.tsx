import { Coffee, Eye } from 'lucide-react'
import { MotivationCard } from './MotivationCard'
import { SpecialEventInput } from './SpecialEventInput'
import { CreateTodoButton } from './CreateTodoButton'
import { BaseButton } from './ui/BaseButton'

interface MainScreenProps {
  todayMotivation: string
  specialEvent: string
  isCreating: boolean
  lastCreated: string | null
  onUpdateSpecialEvent: (event: string) => void
  onCreateDailyTodo: () => void
  onShowTodayTodo: () => void
}

export function MainScreen({
  todayMotivation,
  specialEvent,
  isCreating,
  lastCreated,
  onUpdateSpecialEvent,
  onCreateDailyTodo,
  onShowTodayTodo,
}: MainScreenProps) {
  const todayString = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <div>
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Coffee className="text-amber-500 w-8 h-8 mr-2" />
          <h1 className="text-2xl font-bold text-primary">산만이의 아침</h1>
        </div>

        <div className="text-center mb-4">
          <span className="inline-block heading-font text-xs text-secondary bg-surface border border-token rounded-full px-3 py-1">
            {todayString}
          </span>
        </div>

        <MotivationCard motivation={todayMotivation} />

        <p className="text-secondary text-sm">
          매일 다른 내용으로 당신만의 격려 To-do를 만들어보세요
        </p>
      </div>

      <SpecialEventInput value={specialEvent} onChange={onUpdateSpecialEvent} />

      <CreateTodoButton isCreating={isCreating} onClick={onCreateDailyTodo} />

      {lastCreated && (
        <div className="mt-6 pt-4 border-t border-token">
          <BaseButton
            variant="secondary"
            size="md"
            fullWidth
            onClick={onShowTodayTodo}
            icon={<Eye className="w-4 h-4" />}
          >
            오늘 생성한 To-do 보기
          </BaseButton>
        </div>
      )}

      <div className="text-center text-xs text-secondary mt-6 pt-4 border-t border-token">
        산만이의 정신없는 아침을 응원합니다
        <br />✨ 당신은 잘하고 있어요 ✨
      </div>
    </div>
  )
}
