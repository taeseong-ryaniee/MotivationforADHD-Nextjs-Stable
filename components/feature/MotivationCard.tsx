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
    <Card
      className="relative flex h-full flex-col justify-center overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-muted/40 shadow-sm"
      data-section="dashboard-motivation-card"
    >
      <CardHeader className="pb-4 pt-6 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm font-semibold text-muted-foreground">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Heart className="h-4 w-4" aria-hidden="true" />
            </span>
            오늘의 격려
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Info className="h-4 w-4" />
                <span className="sr-only">정보 보기</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3 text-sm" align="end">
              <p>매일 아침, 새로운 영감이 찾아옵니다.</p>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-[160px] flex-1 items-center justify-center px-6 pb-6 pt-0">
        <p className="text-xl font-bold leading-relaxed text-foreground break-keep font-serif tracking-tight text-center sm:text-2xl lg:text-3xl">
          {motivation}
        </p>
      </CardContent>
    </Card>
  )
})
