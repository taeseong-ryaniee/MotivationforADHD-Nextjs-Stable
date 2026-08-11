import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createElement, type ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { TodoData, ContentData } from '@/lib/types'

// lib/db는 브라우저(IndexedDB) 의존이므로 모킹한다 — 여기서 검증하는 것은 훅의 캐시 동작이다.
const getTodoById = vi.fn()
const getTodoByDate = vi.fn()
const getRecentTodos = vi.fn()
const saveTodo = vi.fn()
const deleteTodo = vi.fn()
const clearAllTodos = vi.fn()
vi.mock('@/lib/db', () => ({
  getTodoById: (...a: Parameters<typeof getTodoById>) => getTodoById(...a),
  getTodoByDate: (...a: Parameters<typeof getTodoByDate>) => getTodoByDate(...a),
  getRecentTodos: (...a: Parameters<typeof getRecentTodos>) => getRecentTodos(...a),
  saveTodo: (...a: Parameters<typeof saveTodo>) => saveTodo(...a),
  deleteTodo: (...a: Parameters<typeof deleteTodo>) => deleteTodo(...a),
  clearAllTodos: (...a: Parameters<typeof clearAllTodos>) => clearAllTodos(...a),
}))

import { todoKeys, useTodos, useTodo, useSaveTodo, useDeleteTodo, useClearTodos, useDailyTodo } from '../useTodos'

const makeTodo = (overrides: Partial<TodoData> = {}): TodoData => ({
  id: crypto.randomUUID(),
  date: '2026년 8월 11일',
  title: '테스트 todo',
  content: '테스트 내용',
  createdAt: '2026. 8. 11.',
  createdAtMs: 1000,
  ...overrides,
})

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const Wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
  return { Wrapper, queryClient }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('todoKeys', () => {
  it('detail/byDate/list 가 모두 ["todos", ...] 로 시작한다 — sync-trigger 의 자동 push 판정 규약', () => {
    expect(todoKeys.detail('abc')[0]).toBe('todos')
    expect(todoKeys.byDate('2026-08-11')[0]).toBe('todos')
    expect(todoKeys.list('x')[0]).toBe('todos')
  })
})

describe('useTodos', () => {
  it('getRecentTodos(limit) 의 결과를 돌려준다', async () => {
    const todos = [makeTodo()]
    getRecentTodos.mockResolvedValueOnce(todos)

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useTodos(10), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getRecentTodos).toHaveBeenCalledWith(10)
    expect(result.current.data).toEqual(todos)
  })
})

describe('useTodo', () => {
  it('id 가 null 이면 비활성이라 getTodoById 를 부르지 않는다', () => {
    const { Wrapper } = createWrapper()
    renderHook(() => useTodo(null), { wrapper: Wrapper })
    expect(getTodoById).not.toHaveBeenCalled()
  })
})

describe('useSaveTodo', () => {
  it('mutateAsync 가 saveTodo 를 부르고 성공 후 detail 캐시에 todo 가 들어간다', async () => {
    const todo = makeTodo()
    saveTodo.mockResolvedValueOnce(todo.id)

    const { Wrapper, queryClient } = createWrapper()
    const { result } = renderHook(() => useSaveTodo(), { wrapper: Wrapper })

    await result.current.mutateAsync(todo)

    expect(saveTodo).toHaveBeenCalledWith(todo)
    expect(queryClient.getQueryData(todoKeys.detail(todo.id))).toEqual(todo)
  })
})

describe('useDeleteTodo', () => {
  it('mutateAsync 가 deleteTodo(id) 를 부른다', async () => {
    deleteTodo.mockResolvedValueOnce(undefined)

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useDeleteTodo(), { wrapper: Wrapper })

    await result.current.mutateAsync('some-id')
    expect(deleteTodo).toHaveBeenCalledWith('some-id')
  })
})

describe('useClearTodos', () => {
  it('mutateAsync 가 clearAllTodos 를 부른다', async () => {
    clearAllTodos.mockResolvedValueOnce(undefined)

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useClearTodos(), { wrapper: Wrapper })

    await result.current.mutateAsync()
    expect(clearAllTodos).toHaveBeenCalled()
  })
})

describe('useDailyTodo', () => {
  const content: ContentData = {
    version: '1',
    updatedAt: '2026-08-11',
    locale: 'ko',
    motivationMessages: ['화이팅'],
    antiBrainFogTips: ['물 한 잔 마시기'],
    practicalTips: [
      { category: '집중', tips: ['타이머 쓰기'] },
      { category: '정리', tips: ['책상 치우기'] },
    ],
    daySpecificMessages: {},
    cheers: ['잘하고 있어요'],
  }

  it('오늘 todo 가 없으면 createDailyTodo 가 saveTodo 를 부른다', async () => {
    getTodoByDate.mockResolvedValue(undefined)
    getRecentTodos.mockResolvedValue([])
    saveTodo.mockResolvedValueOnce('new-id')

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useDailyTodo(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoadingTodayTodo).toBe(false))

    await result.current.createDailyTodo({ content, specialEvent: '' })
    expect(saveTodo).toHaveBeenCalled()
  })

  it('오늘 todo 가 이미 있으면 새로 만들지 않고 기존 것을 돌려준다', async () => {
    const existing = makeTodo()
    getTodoByDate.mockResolvedValue(existing)
    getRecentTodos.mockResolvedValue([])

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useDailyTodo(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoadingTodayTodo).toBe(false))

    const created = await result.current.createDailyTodo({ content, specialEvent: '' })
    expect(created).toEqual(existing)
    expect(saveTodo).not.toHaveBeenCalled()
  })
})
