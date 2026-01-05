import { CheckCircle } from 'lucide-react'
import { GradientButton } from './ui/GradientButton'
import { LoadingSpinner } from './ui/LoadingSpinner'

interface CreateTodoButtonProps {
  isCreating: boolean
  onClick: () => void
}

export function CreateTodoButton({ isCreating, onClick }: CreateTodoButtonProps) {
  return (
    <GradientButton
      gradient="green-blue"
      size="lg"
      disabled={isCreating}
      fullWidth
      onClick={onClick}
      icon={
        isCreating ? (
          <LoadingSpinner color="blue" />
        ) : (
          <CheckCircle className="w-5 h-5 text-success-500" />
        )
      }
    >
      {isCreating ? 'To-do 생성 중...' : '오늘 하루 시작!'}
    </GradientButton>
  )
}
