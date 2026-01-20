import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface CreateTodoButtonProps {
  isCreating: boolean
  onClick: () => void
}

export function CreateTodoButton({ isCreating, onClick }: CreateTodoButtonProps) {
  return (
    <Button
      variant="default"
      size="lg"
      className="w-full"
      disabled={isCreating}
      onClick={onClick}
      aria-busy={isCreating}
      aria-label={isCreating ? 'To-do 생성 중' : '오늘 하루 시작하기'}
    >
      {isCreating ? (
        <LoadingSpinner color="blue" />
      ) : (
        <CheckCircle className="h-5 w-5 text-white" />
      )}
      {isCreating ? 'To-do 생성 중...' : '오늘 하루 시작!'}
    </Button>
  )
}
