import { memo } from 'react'
import { Heart, Info } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

interface MotivationCardProps {
  motivation: string
}

export const MotivationCard = memo(function MotivationCard({ motivation }: MotivationCardProps) {
  if (!motivation) return null

  return (
    <Card className="h-full flex flex-col justify-center border shadow-sm">
      <CardHeader className="pb-6 pt-8 px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-lg font-bold">
            <Heart className="h-5 w-5 text-primary fill-primary/20" aria-hidden="true" />
            오늘의 격려
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-accent">
                <Info className="h-5 w-5" />
                <span className="sr-only">정보 보기</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3 text-sm" align="end">
              <p>매일 아침, 새로운 영감이 찾아옵니다.</p>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-8 pb-8 flex-1 flex items-center justify-center min-h-[160px]">
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold leading-relaxed text-foreground break-keep font-serif tracking-tight text-center">
          {motivation}
        </p>
      </CardContent>
    </Card>
  )
})
