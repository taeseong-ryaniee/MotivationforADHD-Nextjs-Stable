import type { PracticalTip, TodayTips } from '@/lib/types'

export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

interface BuildTodoParams {
  dateString: string
  motivation: string
  dayMessage: string
  antiFogTip: string
  tip1: string
  tip2: string
  specialEventItems: string[]
  specialAdvice: string
  createdAt: string
}

export function buildTodoContent({
  dateString,
  motivation,
  dayMessage,
  antiFogTip,
  tip1,
  tip2,
  specialEventItems,
  specialAdvice,
  createdAt,
}: BuildTodoParams): { title: string; content: string } {
  const title = `ADHD 격려 - ${dateString}`
  let content = `🌅 ${dateString} 아침 격려

💪 오늘의 마음가짐
${motivation}

📅 ${dayMessage}

⚡ 멍함 없이 바로 시작하기
${antiFogTip}

🎯 오늘 실행할 일
1. ${tip1}
2. ${tip2}`

  if (specialEventItems.length > 0) {
    content += `

🌟 오늘의 특별 일정
${specialEventItems.map((item) => `- ${item}`).join('\n')}
💡 어드바이스: ${specialAdvice}`
  }

  content += `

🧠 기억할 것
• "지금 당장"보다 "조금씩"
• 실수는 설명의 기회
• 완료보다 진행이 중요

🍀 오늘 하루도 화이팅! 당신은 잘하고 있어요.

---
생성 시간: ${createdAt}`

  return { title, content }
}

export function getSpecialEventAdvice(event: string): string {
  if (!event.trim()) return ''

  const lowerEvent = event.toLowerCase()

  if (lowerEvent.includes('회의') || lowerEvent.includes('미팅')) {
    return '회의 전에 핵심 포인트3가지만 미리 정리해두세요. 완벽한 준비보다 핵심만 파악하는 게 중요해요.'
  } else if (lowerEvent.includes('발표') || lowerEvent.includes('프레젠테이션')) {
    return '발표 전에는 첫 문장만 완벽하게 외워두세요. 시작이 매끄러우면 나머지는 자연스럽게 이어질 거예요.'
  } else if (lowerEvent.includes('면접') || lowerEvent.includes('인터뷰')) {
    return "면접에서는 솔직함이 최고의 전략이에요. ADHD 특성도 '꼼꼼히 준비하는 성향'으로 어필할 수 있어요."
  } else if (lowerEvent.includes('평가') || lowerEvent.includes('피드백')) {
    return "평가받을 때는 '개선하고 싶은 부분'을 먼저 말하세요. 자기 인식이 있다는 걸 보여주는 게 좋아요."
  } else if (lowerEvent.includes('데드라인') || lowerEvent.includes('마감')) {
    return '마감일엔 80% 완성도로 제출하세요. 완벽을 추구하다 놓치는 것보다 시간 안에 내는 게 중요해요.'
  } else if (
    lowerEvent.includes('교육') ||
    lowerEvent.includes('세미나') ||
    lowerEvent.includes('워크샵')
  ) {
    return '긴 교육에서는 중간중간 메모하며 손을 움직이세요. 집중력 유지에 도움이 될 거예요.'
  } else {
    return '새로운 일정이 있을 때는 평소보다 여유 시간을 두고 준비하세요. 예상보다 시간이 더 걸릴 수 있어요.'
  }
}

export function getTodayTips(practicalTips: PracticalTip[]): TodayTips {
  const selectedCategory = getRandomItem(practicalTips)
  const tip1 = getRandomItem(selectedCategory.tips)

  const otherCategories = practicalTips.filter((cat) => cat.category !== selectedCategory.category)
  const secondCategory = getRandomItem(otherCategories)
  const tip2 = getRandomItem(secondCategory.tips)

  return {
    tip1,
    tip2,
    categories: [selectedCategory.category, secondCategory.category],
  }
}
