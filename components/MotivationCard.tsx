import { memo } from 'react'
import { Heart, Calendar } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from './ui/Card'

interface MotivationCardProps {
  motivation: string
}

export const MotivationCard = memo(function MotivationCard({ motivation }: MotivationCardProps) {
  if (!motivation) return null

  return (
    <Card className="border-pink-100 bg-gradient-to-br from-white via-pink-50 to-purple-50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Heart className="h-4 w-4 text-red-500" aria-hidden="true" />
          오늘의 격려
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-base font-medium leading-relaxed text-primary">
          {motivation}
        </p>
      </CardContent>
      <CardFooter className="border-t border-pink-100 pt-3 text-xs text-secondary">
        <Calendar className="h-4 w-4 text-brand-500" aria-hidden="true" />
        매일 다른 내용으로 생성됩니다
      </CardFooter>
    </Card>
  )
})
