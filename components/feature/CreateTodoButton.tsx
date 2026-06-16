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
      className="w-full gap-2 rounded-xl text-base font-bold"
      disabled={isCreating}
      onClick={onClick}
      aria-busy={isCreating}
      aria-label={isCreating ? '오늘 루틴 생성 중' : '오늘 루틴 만들기'}
    >
      {isCreating ? (
        <LoadingSpinner color="blue" />
      ) : (
        <CheckCircle className="h-5 w-5 text-current" />
      )}
      <span aria-live="polite">{isCreating ? '루틴 생성 중…' : '오늘 루틴 만들기'}</span>
    </Button>
  )
}
