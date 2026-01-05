# TanStack Query 사용 가이드

## 개요

이 프로젝트는 TanStack Query (React Query)를 사용하여 서버 상태와 IndexedDB 데이터를 관리합니다.

## Custom Hooks

### 1. useTodos - To-do 리스트 조회

```tsx
import { useTodos } from '@/hooks/useTodos'

function TodoList() {
  const { data: todos, isLoading, error } = useTodos(30)

  if (isLoading) return <div>로딩 중...</div>
  if (error) return <div>에러 발생</div>

  return (
    <div>
      {todos?.map((todo) => (
        <div key={todo.id}>{todo.title}</div>
      ))}
    </div>
  )
}
```

### 2. useTodo - 개별 To-do 조회

```tsx
import { useTodo } from '@/hooks/useTodos'

function TodoDetail({ id }: { id: string }) {
  const { data: todo, isLoading } = useTodo(id)

  if (isLoading) return <div>로딩 중...</div>

  return <div>{todo?.content}</div>
}
```

### 3. useSaveTodo - To-do 저장

```tsx
import { useSaveTodo } from '@/hooks/useTodos'

function CreateTodo() {
  const { mutate, isPending } = useSaveTodo()

  const handleSave = () => {
    mutate({
      id: crypto.randomUUID(),
      date: new Date().toLocaleDateString(),
      title: 'My Todo',
      content: 'Todo content',
      createdAt: new Date().toLocaleString(),
    })
  }

  return (
    <button onClick={handleSave} disabled={isPending}>
      {isPending ? '저장 중...' : '저장'}
    </button>
  )
}
```

### 4. useDeleteTodo - To-do 삭제

```tsx
import { useDeleteTodo } from '@/hooks/useTodos'

function DeleteButton({ id }: { id: string }) {
  const { mutate: deleteTodo, isPending } = useDeleteTodo()

  return (
    <button onClick={() => deleteTodo(id)} disabled={isPending}>
      삭제
    </button>
  )
}
```

### 5. useContent - 동기부여 문구 조회

```tsx
import { useContent } from '@/hooks/useContent'

function MotivationMessage() {
  const { data: content, isLoading } = useContent('ko')

  if (isLoading) return <div>로딩 중...</div>

  const randomMessage = content?.motivationMessages[
    Math.floor(Math.random() * content.motivationMessages.length)
  ]

  return <p>{randomMessage}</p>
}
```

## Query Key 구조

### Todo Query Keys

```typescript
todoKeys = {
  all: ['todos'],
  lists: ['todos', 'list'],
  list: ['todos', 'list', { filters }],
  details: ['todos', 'detail'],
  detail: ['todos', 'detail', id],
  byDate: ['todos', 'date', date],
}
```

### Content Query Keys

```typescript
contentKeys = {
  all: ['content'],
  locale: ['content', locale],
}
```

## 캐싱 전략

### Todos
- **Stale Time**: 5분 - 5분간 데이터를 fresh 상태로 유지
- **GC Time**: 10분 - 10분간 캐시 유지
- **Refetch on Window Focus**: true - 탭 전환 시 자동 리페칭

### Content
- **Stale Time**: 1시간 - 동기부여 문구는 자주 변경되지 않음
- **GC Time**: 24시간 - 하루 동안 캐시 유지
- **Retry**: 2회 - 실패 시 2번까지 재시도

## Devtools

개발 환경에서 React Query Devtools가 자동으로 활성화됩니다.

화면 하단의 TanStack Query 아이콘을 클릭하면:
- 모든 쿼리의 상태 확인
- 캐시 데이터 확인
- 수동으로 쿼리 무효화
- 네트워크 요청 추적

## Optimistic Updates

To-do 저장 시 낙관적 업데이트를 사용하여 즉각적인 UI 반영:

```typescript
useMutation({
  mutationFn: (todo: TodoData) => saveTodo(todo),
  onMutate: async (newTodo) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: todoKeys.lists() })

    // Snapshot previous value
    const previousTodos = queryClient.getQueryData(todoKeys.lists())

    // Optimistically update to the new value
    queryClient.setQueryData(todoKeys.lists(), (old) => [...old, newTodo])

    // Return context with snapshot
    return { previousTodos }
  },
  onError: (err, newTodo, context) => {
    // Rollback on error
    queryClient.setQueryData(todoKeys.lists(), context.previousTodos)
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
  },
})
```

## 성능 최적화 팁

1. **필요한 데이터만 구독하기**
   ```tsx
   // ❌ 전체 리스트를 구독
   const { data: todos } = useTodos()

   // ✅ 필요한 필드만 select
   const { data: todoCount } = useTodos({
     select: (data) => data.length,
   })
   ```

2. **조건부 쿼리 사용하기**
   ```tsx
   const { data } = useTodo(id, {
     enabled: !!id, // id가 있을 때만 실행
   })
   ```

3. **Prefetching**
   ```tsx
   const queryClient = useQueryClient()

   // 미리 데이터 로드
   queryClient.prefetchQuery({
     queryKey: todoKeys.detail(nextId),
     queryFn: () => getTodoById(nextId),
   })
   ```

## 참고 자료

- [TanStack Query 공식 문서](https://tanstack.com/query/latest)
- [React Query Patterns](https://tkdodo.eu/blog/practical-react-query)
