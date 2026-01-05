import { Heart, Calendar } from 'lucide-react'

interface MotivationCardProps {
  motivation: string
}

export function MotivationCard({ motivation }: MotivationCardProps) {
  if (!motivation) return null

  return (
    <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-center mb-2">
        <Heart className="text-red-500 w-5 h-5 mr-2" />
        <span className="heading-font font-semibold text-primary">오늘의 격려</span>
      </div>
      <p className="text-primary text-sm leading-relaxed mb-3 text-center">{motivation}</p>
      <div className="flex items-center justify-center">
        <Calendar className="w-4 h-4 mr-2 text-brand-500" />
        <span className="text-xs text-secondary font-medium">매일 다른 내용으로 생성됩니다</span>
      </div>
    </div>
  )
}
