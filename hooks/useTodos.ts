'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { TodoData, ContentData } from '@/lib/types'
import {
  getTodoById,
  getTodoByDate,
  getTodosByDate,
  getRecentTodos,
  saveTodo,
  deleteTodo,
  clearAllTodos,
  getSetting,
  setSetting,
} from '@/lib/db'
import { getRandomItem, getSpecialEventAdvice, getTodayTips } from '@/lib/content-utils'

const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters?: string) => [...todoKeys.lists(), { filters }] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
  byDate: (date: string) => [...todoKeys.all, 'date', date] as const,
  countByDate: (date: string) => [...todoKeys.all, 'count', date] as const,
}

export { todoKeys }

const getTodayDateString = (): string =>
  new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

interface UseDailyTodoParams {
  content: ContentData
  specialEvent: string
}

export function useDailyTodo() {
  const queryClient = useQueryClient()
  const todayDate = getTodayDateString()

  const todayTodoQuery = useQuery<TodoData | null>({
    queryKey: todoKeys.byDate(todayDate),
    queryFn: async () => (await getTodoByDate(todayDate)) ?? null,
    staleTime: 1000 * 60 * 5,
  })

  const todayCountQuery = useQuery<number>({
    queryKey: todoKeys.countByDate(todayDate),
    queryFn: async () => {
      const todos = await getTodosByDate(todayDate)
      return todos.length
    },
    staleTime: 1000 * 60,
  })

  const historyQuery = useTodos()

  const createMutation = useMutation({
    mutationFn: async ({ content, specialEvent }: UseDailyTodoParams) => {
      const today = new Date()
      const dayOfWeek = today.getDay()
      const dateString = getTodayDateString()
      const existingTodo = await getTodoByDate(dateString)

      if (existingTodo) {
        return existingTodo
      }

      const motivation = getRandomItem(content.motivationMessages)
      const dayMessage = content.daySpecificMessages[String(dayOfWeek)] || ''
      const antiFogTip = getRandomItem(content.antiBrainFogTips)
      const { tip1, tip2 } = getTodayTips(content.practicalTips)
      const specialEventItems = specialEvent
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)
      const normalizedSpecialEvent = specialEventItems.join(' ')
      const specialAdvice = getSpecialEventAdvice(normalizedSpecialEvent)

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

      if (specialEventItems.length > 0) {
        todoContent += `

🌟 오늘의 특별 일정
${specialEventItems.map((item) => `- ${item}`).join('\n')}
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
      queryClient.invalidateQueries({ queryKey: todoKeys.byDate(getTodayDateString()) })
      queryClient.invalidateQueries({ queryKey: todoKeys.countByDate(getTodayDateString()) })
    },
  })

  return {
    todayTodo: todayTodoQuery.data || null,
    isLoadingTodayTodo: todayTodoQuery.isLoading,
    todayTodoCount: todayCountQuery.data ?? 0,
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
      queryClient.invalidateQueries({ queryKey: todoKeys.countByDate(todo.date) })
      queryClient.setQueryData(todoKeys.detail(todo.id), todo)
    },
  })
}

export function useDeleteTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
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
