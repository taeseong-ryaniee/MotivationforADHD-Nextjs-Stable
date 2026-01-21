'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { TodoData, PracticalTip, TodayTips, ContentData } from '@/lib/types'
import {
  getTodoById,
  getTodoByDate,
  getRecentTodos,
  saveTodo,
  deleteTodo,
  clearAllTodos,
  getSetting,
  setSetting,
} from '@/lib/db'

const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters?: string) => [...todoKeys.lists(), { filters }] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
  byDate: (date: string) => [...todoKeys.all, 'date', date] as const,
}

const getRandomItem = <T,>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

const getSpecialEventAdvice = (event: string): string => {
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

const getTodayTips = (practicalTips: PracticalTip[]): TodayTips => {
  const selectedCategory = getRandomItem(practicalTips)
  const tip1 = getRandomItem(selectedCategory.tips)

  const otherCategories = practicalTips.filter((cat) => cat.category !== selectedCategory.category)
  const secondCategory = getRandomItem(otherCategories)
  const tip2 = getRandomItem(secondCategory.tips)

  return {
    tip1,
    tip2,
    antiFogTip: '',
    categories: [selectedCategory.category, secondCategory.category],
  }
}

const MOTIVATION_DEFAULTS = [
  '오늘도 새로운 시작이에요. 완벽하지 않아도 괜찮습니다.',
  '어제의 실수는 오늘의 경험이 되었어요. 한 걸음씩 나아가세요.',
  'ADHD가 있어도 당신은 충분히 잘하고 있어요. 자신을 믿어보세요.',
  '작은 진전도 진전입니다. 오늘 하나만이라도 해내면 성공이에요.',
  '남들과 비교하지 마세요. 당신만의 속도로 가면 됩니다.',
  '집중이 안 되는 날도 있어요. 그런 날엔 더 작은 목표로 시작해보세요.',
  '완료보다 진행이 중요해요. 80% 완성된 것이 100% 계획보다 나아요.',
]

const ANTI_FOG_DEFAULTS = [
  '컴퓨터 켜자마자 마우스든 키보드든 일단 손부터 움직이세요',
  '생각하지 말고 어제 마지막에 열었던 파일부터 열어보세요',
  '완벽한 계획 세우려 하지 말고 일단 5분만 뭐라도 시작하세요',
  '새로운 일 생각하지 말고 어제 하던 일부터 이어서 한 줄만 써보세요',
  '메일함 열어서 제목만이라도 쭉 훑어보며 손가락 움직이세요',
  '타이머 10분 맞추고 책상 정리부터 시작해서 몸을 움직이세요',
  '일단 브라우저든 프로그램이든 뭐라도 클릭하며 시작하세요',
]

const PRACTICAL_TIPS_DEFAULTS = [
  {
    category: '시작하기',
    tips: [
      '타이머 25분 맞추고 한 가지 일에만 집중해보기',
      '메일함 열어서 답장 필요한 것 1개만 골라 간단히 답하기',
      '새로운 일 시작하지 말고 어제 하던 일부터 이어하기',
      '완벽하지 않아도 일단 한 줄이라도 타이핑해보기',
    ],
  },
  {
    category: '소통하기',
    tips: [
      "동료 한 명에게 '진행 중이에요, 막힌 부분은 ○○입니다' 한 줄 보내기",
      '말하기 전 3초 생각하기 (특히 회의나 중요한 대화에서)',
      '완벽한 답변보다 솔직한 진행상황 공유하기',
      "커피 한 잔 사주거나 '수고하세요' 인사로 작은 배려 표현하기",
    ],
  },
  {
    category: '감정관리',
    tips: [
      '감정이 올라올 때: 화장실 가서 3번 심호흡하기',
      "압박감 느낄 때: '지금 할 수 있는 가장 작은 것 하나만' 생각하기",
      "실수했을 때: '죄송합니다, 놓친 부분이 있었네요' 솔직하게 인정하기",
      '집중 안 될 때: 5분 산책하거나 물 한 잔 마시며 리셋하기',
    ],
  },
]

const DAY_MESSAGES_DEFAULT: Record<number, string> = {
  0: '일요일 저녁이나 월요일 아침, 새로운 한 주를 차근차근 시작해보세요.',
  1: '월요일 블루가 있어도 괜찮아요. 오늘 하나만 해내면 성공입니다.',
  2: '화요일, 어제의 관성을 이어가세요. 작은 루틴이 큰 변화를 만들어요.',
  3: '수요일 중반, 지치면 잠시 쉬어가도 돼요. 완주가 목표입니다.',
  4: '목요일, 이번 주도 거의 다 왔어요. 마지막 스퍼트 화이팅!',
  5: '불금! 오늘은 조금 여유롭게 가도 괜찮아요. 다음 주 준비도 살짝 해두세요.',
  6: '토요일, 쉬는 날에도 작은 성취감을 느껴보세요. 휴식도 중요해요.',
}

interface UseDailyTodoParams {
  content?: ContentData
  specialEvent: string
}

export function useDailyTodo() {
  const queryClient = useQueryClient()

  const motivationQuery = useQuery({
    queryKey: ['motivation'],
    queryFn: async () => {
      const today = new Date().toDateString()
      const savedDate = await getSetting<string>('motivationDate')

      if (savedDate !== today) {
        const newMotivation = getRandomItem(MOTIVATION_DEFAULTS)
        await setSetting('motivationDate', today)
        await setSetting('todayMotivation', newMotivation)
        return newMotivation
      }

      return (await getSetting<string>('todayMotivation')) || getRandomItem(MOTIVATION_DEFAULTS)
    },
    staleTime: 1000 * 60 * 60 * 24,
  })

  const todayDate = new Date().toLocaleDateString('ko-KR')
  const todayTodoQuery = useQuery<TodoData | null>({
    queryKey: todoKeys.byDate(todayDate),
    queryFn: async () => (await getTodoByDate(todayDate)) ?? null,
    staleTime: 1000 * 60 * 5,
  })

  const historyQuery = useTodos()

  const createMutation = useMutation({
    mutationFn: async ({ content, specialEvent }: UseDailyTodoParams) => {
      const today = new Date()
      const dayOfWeek = today.getDay()
      const dateString = today.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      })

      const motivation = motivationQuery.data || getRandomItem(MOTIVATION_DEFAULTS)
      const dayMessages = content?.daySpecificMessages || DAY_MESSAGES_DEFAULT
      const antiFogTips = content?.antiBrainFogTips || ANTI_FOG_DEFAULTS
      const practicalTips = content?.practicalTips || PRACTICAL_TIPS_DEFAULTS

      const dayMessage = dayMessages[dayOfWeek] || ''
      const antiFogTip = getRandomItem(antiFogTips)
      const { tip1, tip2 } = getTodayTips(practicalTips)
      const specialAdvice = getSpecialEventAdvice(specialEvent)

      const todoTitle = `ADHD 격려 - ${dateString}`
      let todoContent = `🌅 ${dateString} 아침 격려

💪 오늘의 마음가짐
${motivation}

📅 ${dayMessage}

⚡ 멍함 없이 바로 시작하기
${antiFogTip}

🎯 오늘 실행할 일
1. ${tip1}
2. ${tip2}`

      if (specialEvent.trim()) {
        todoContent += `

🌟 오늘의 특별 일정: ${specialEvent}
💡 어드바이스: ${specialAdvice}`
      }

      todoContent += `

🧠 기억할 것
• "지금 당장"보다 "조금씩"
• 실수는 설명의 기회
• 완료보다 진행이 중요

🍀 오늘 하루도 화이팅! 당신은 잘하고 있어요.

---
생성 시간: ${today.toLocaleTimeString('ko-KR')}`

      const id = crypto.randomUUID()

      const todoData: TodoData = {
        id,
        date: dateString,
        title: todoTitle,
        content: todoContent,
        createdAt: today.toLocaleString('ko-KR'),
      }

      await saveTodo(todoData)

      return todoData
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
      queryClient.invalidateQueries({ queryKey: todoKeys.byDate(new Date().toLocaleDateString('ko-KR')) })
    },
  })

  return {
    todayMotivation: motivationQuery.data || '',
    todayTodo: todayTodoQuery.data || null,
    todoHistory: historyQuery.data || [],
    isCreating: createMutation.isPending,
    createDailyTodo: createMutation.mutateAsync,
  }
}

export function useTodos(limit = 30) {
  return useQuery({
    queryKey: todoKeys.list(`limit-${limit}`),
    queryFn: () => getRecentTodos(limit),
    staleTime: 1000 * 60 * 5,
  })
}

export function useTodo(id: string | null) {
  return useQuery({
    queryKey: todoKeys.detail(id || ''),
    queryFn: () => getTodoById(id || ''),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  })
}

export function useSaveTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (todo: TodoData) => saveTodo(todo),
    onSuccess: (_, todo) => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
      queryClient.invalidateQueries({ queryKey: todoKeys.byDate(todo.date) })
      queryClient.setQueryData(todoKeys.detail(todo.id), todo)
    },
  })
}

export function useDeleteTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
      queryClient.removeQueries({ queryKey: todoKeys.detail(id) })
    },
  })
}

export function useClearTodos() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => clearAllTodos(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
    },
  })
}
