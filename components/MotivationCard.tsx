import { memo } from 'react'
import { Heart, Info } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from './ui/card'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'

interface MotivationCardProps {
  motivation: string
}

export const MotivationCard = memo(function MotivationCard({ motivation }: MotivationCardProps) {
  if (!motivation) return null

  return (
    <Card className="h-full flex flex-col justify-center border-0 shadow-lg bg-accent/10 dark:bg-accent/5">
      <CardHeader className="pb-6 pt-8 px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-lg font-bold text-accent-foreground dark:text-accent">
            <Heart className="h-6 w-6 text-accent fill-accent/20" aria-hidden="true" />
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
      <CardContent className="pt-0 px-8 pb-8 flex-1 flex items-center">
        <p className="text-2xl sm:text-3xl font-bold leading-snug text-foreground break-keep">
          {motivation}
        </p>
      </CardContent>
    </Card>
  )
})
