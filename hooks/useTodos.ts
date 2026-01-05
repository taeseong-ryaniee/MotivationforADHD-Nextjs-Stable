import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { TodoData } from '@/lib/types'
import {
  getTodoById,
  getTodoByDate,
  getRecentTodos,
  saveTodo,
  deleteTodo,
  clearAllTodos,
} from '@/lib/db'

// Query keys
export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters?: string) => [...todoKeys.lists(), { filters }] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
  byDate: (date: string) => [...todoKeys.all, 'date', date] as const,
}

// Fetch all todos (recent 30)
export function useTodos(limit = 30) {
  return useQuery({
    queryKey: todoKeys.list(`limit-${limit}`),
    queryFn: () => getRecentTodos(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Fetch todo by ID
export function useTodo(id: string | null) {
  return useQuery({
    queryKey: todoKeys.detail(id || ''),
    queryFn: () => getTodoById(id!),
    enabled: !!id, // Only run query if ID exists
    staleTime: 1000 * 60 * 10, // 10 minutes (single todo rarely changes)
  })
}

// Fetch todo by date
export function useTodoByDate(date: string) {
  return useQuery({
    queryKey: todoKeys.byDate(date),
    queryFn: () => getTodoByDate(date),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Save todo mutation
export function useSaveTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (todo: TodoData) => saveTodo(todo),
    onSuccess: (_, todo) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
      queryClient.invalidateQueries({ queryKey: todoKeys.byDate(todo.date) })

      // Optimistically update the cache
      queryClient.setQueryData(todoKeys.detail(todo.id), todo)
    },
  })
}

// Delete todo mutation
export function useDeleteTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: (_, id) => {
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })

      // Remove from cache
      queryClient.removeQueries({ queryKey: todoKeys.detail(id) })
    },
  })
}

// Clear all todos mutation
export function useClearTodos() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => clearAllTodos(),
    onSuccess: () => {
      // Invalidate all todo queries
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
    },
  })
}
