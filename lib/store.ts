import { create } from 'zustand'
import type { TodoData, PracticalTip, TodayTips, ContentData, S3Config, SyncStrategy } from './types'
import {
  getTodoByDate,
  getRecentTodos,
  saveTodo,
  deleteTodo,
  clearAllTodos,
  getSetting,
  setSetting,
} from './db'
import {
  exportData,
  downloadSyncFile,
  importData,
  saveS3Config,
  getS3Config,
  clearS3Config,
  uploadToS3,
  downloadFromS3,
  getSyncStatus,
} from './sync'
import { getRandomItem, getSpecialEventAdvice, getTodayTips } from './content-utils'

interface TodoStore {
  // State
  todayTodo: TodoData | null
  todayMotivation: string
  specialEvent: string
  isCreating: boolean
  lastCreated: string | null
  todoHistory: TodoData[]
  isInitialized: boolean

  // Content data
  motivationMessages: string[]
  antiBrainFogTips: string[]
  practicalTips: PracticalTip[]
  daySpecificMessages: Record<number, string>

  // Computed
  hasTodo: () => boolean
  canShowTodo: () => boolean

  // Actions
  initialize: () => Promise<void>
  loadContent: (content: ContentData) => void
  createDailyTodo: () => Promise<TodoData>
  loadTodoHistory: () => Promise<void>
  removeFromHistory: (id: string) => Promise<void>
  clearHistory: () => Promise<void>
  updateTodo: (id: string, content: string) => Promise<void>

  updateSpecialEvent: (event: string) => void
  copyToClipboard: (text: string) => Promise<void>

  exportData: () => Promise<void>
  importData: (file: File, strategy: SyncStrategy) => Promise<void>
  saveS3Config: (config: S3Config) => Promise<void>
  getS3Config: () => Promise<S3Config | undefined>
  clearS3Config: () => Promise<void>
  uploadToS3: () => Promise<void>
  downloadFromS3: (filename: string) => Promise<void>
  getSyncStatus: () => { lastSyncAt: string | undefined; syncedWith: string | undefined }
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  // Initial state
  todayTodo: null,
  todayMotivation: '',
  specialEvent: '',
  isCreating: false,
  lastCreated: null,
  todoHistory: [],
  isInitialized: false,

  // Content (loaded via loadContent from IndexedDB)
  motivationMessages: [],
  antiBrainFogTips: [],
  practicalTips: [],
  daySpecificMessages: {},

  // Computed
  hasTodo: () => get().todayTodo !== null,
  canShowTodo: () => get().todayTodo !== null && get().lastCreated !== null,

  // Actions
  initialize: async () => {
    const state = get()
    if (state.isInitialized) return

    try {
      // Initialize motivation
      const today = new Date().toDateString()
      const savedDate = await getSetting<string>('motivationDate')

      if (savedDate !== today) {
        const newMotivation = getRandomItem(state.motivationMessages)
        set({ todayMotivation: newMotivation })
        await setSetting('motivationDate', today)
        await setSetting('todayMotivation', newMotivation)
      } else {
        const saved = await getSetting<string>('todayMotivation')
        set({ todayMotivation: saved || getRandomItem(state.motivationMessages) })
      }

      // Load today's todo
      const todayTodo = await getTodoByDate(today)
      if (todayTodo) {
        set({
          todayTodo,
          lastCreated: todayTodo.date,
        })
      }

      // Load history
      await get().loadTodoHistory()

      set({ isInitialized: true })
    } catch (error) {
      console.error('Error initializing store:', error)
      set({ isInitialized: true })
    }
  },

  loadContent: (content: ContentData) => {
    set({
      motivationMessages: content.motivationMessages,
      antiBrainFogTips: content.antiBrainFogTips,
      practicalTips: content.practicalTips,
      daySpecificMessages: content.daySpecificMessages,
    })
  },

  createDailyTodo: async () => {
    const state = get()
    set({ isCreating: true })

    try {
      const today = new Date()
      const dayOfWeek = today.getDay()
      const dateString = today.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      })

      const motivation = getRandomItem(state.motivationMessages)
      const dayMessage = state.daySpecificMessages[dayOfWeek] || ''
      const antiFogTip = getRandomItem(state.antiBrainFogTips)
      const { tip1, tip2 } = getTodayTips(state.practicalTips)
      const specialAdvice = getSpecialEventAdvice(state.specialEvent)

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

      if (state.specialEvent.trim()) {
        todoContent += `

🌟 오늘의 특별 일정: ${state.specialEvent}
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

      set({
        todayTodo: todoData,
        lastCreated: todoData.date,
      })

      // Refresh history
      await get().loadTodoHistory()

      return todoData
    } catch (error) {
      console.error('Error creating todo:', error)
      throw new Error('To-do 생성 중 오류가 발생했습니다.')
    } finally {
      set({ isCreating: false })
    }
  },

  loadTodoHistory: async () => {
    try {
      const history = await getRecentTodos(30)
      set({ todoHistory: history })
    } catch (error) {
      console.error('Error loading history:', error)
      set({ todoHistory: [] })
    }
  },

  removeFromHistory: async (id: string) => {
    try {
      await deleteTodo(id)
      await get().loadTodoHistory()
    } catch (error) {
      console.error('Error removing from history:', error)
    }
  },

  clearHistory: async () => {
    try {
      await clearAllTodos()
      set({ todoHistory: [] })
    } catch (error) {
      console.error('Error clearing history:', error)
    }
  },

  updateTodo: async (id: string, content: string) => {
    try {
      // Find existing todo
      const todos = await getRecentTodos(100)
      const existing = todos.find((t) => t.id === id)
      
      if (!existing) {
        throw new Error('Todo not found')
      }

      const updated: TodoData = {
        ...existing,
        content,
      }

      await saveTodo(updated)
      
      // Update state if it's today's todo
      const currentToday = get().todayTodo
      if (currentToday?.id === id) {
        set({ todayTodo: updated })
      }

      // Refresh history
      await get().loadTodoHistory()
    } catch (error) {
      console.error('Error updating todo:', error)
      throw error
    }
  },

  setTodayTodo: (todo: TodoData) => {
    set({
      todayTodo: todo,
      lastCreated: todo.date,
    })
  },

  updateSpecialEvent: (event: string) => {
    set({ specialEvent: event })
  },

  copyToClipboard: async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  },

  exportData: async () => {
    const data = await exportData()
    downloadSyncFile(data)
  },

  importData: async (file: File, strategy: SyncStrategy) => {
    await importData(file, strategy)
    await get().loadTodoHistory()
  },

  saveS3Config: async (config: S3Config) => {
    await saveS3Config(config)
  },

  getS3Config: async () => {
    return await getS3Config()
  },

  clearS3Config: async () => {
    await clearS3Config()
  },

  uploadToS3: async () => {
    const config = await get().getS3Config()
    if (!config) {
      throw new Error('S3 configuration not found')
    }

    const data = await exportData()
    await uploadToS3(config, data)
  },

  downloadFromS3: async (filename: string) => {
    const config = await get().getS3Config()
    if (!config) {
      throw new Error('S3 configuration not found')
    }

    const data = await downloadFromS3(config, filename)
    await importData(new File([JSON.stringify(data)], filename), 'merge')
    await get().loadTodoHistory()
  },

  getSyncStatus: () => {
    return getSyncStatus()
  },
}))
