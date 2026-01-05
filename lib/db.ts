import Dexie, { type EntityTable } from 'dexie'

export interface TodoData {
  id: string
  date: string
  title: string
  content: string
  createdAt: string
}

export interface Settings {
  key: string
  value: any
}

// Lazy initialization to avoid SSR issues
let _db: (Dexie & {
  todos: EntityTable<TodoData, 'id'>
  settings: EntityTable<Settings, 'key'>
}) | null = null

function getDB() {
  // Only initialize in browser environment
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB can only be used in browser environment')
  }

  if (!_db) {
    _db = new Dexie('MotivationForADHD') as Dexie & {
      todos: EntityTable<TodoData, 'id'>
      settings: EntityTable<Settings, 'key'>
    }

    // Schema declaration
    _db.version(1).stores({
      todos: 'id, date, createdAt',
      settings: 'key'
    })
  }

  return _db
}

export { getDB as db }

// Helper functions for todos
export async function getTodoById(id: string): Promise<TodoData | undefined> {
  return await getDB().todos.get(id)
}

export async function getTodoByDate(date: string): Promise<TodoData | undefined> {
  return await getDB().todos.where('date').equals(date).first()
}

export async function getAllTodos(): Promise<TodoData[]> {
  return await getDB().todos.orderBy('createdAt').reverse().toArray()
}

export async function getRecentTodos(limit: number = 30): Promise<TodoData[]> {
  return await getDB().todos.orderBy('createdAt').reverse().limit(limit).toArray()
}

export async function saveTodo(todo: TodoData): Promise<string> {
  return await getDB().todos.put(todo)
}

export async function deleteTodo(id: string): Promise<void> {
  await getDB().todos.delete(id)
}

export async function clearAllTodos(): Promise<void> {
  await getDB().todos.clear()
}

// Helper functions for settings
export async function getSetting<T = any>(key: string): Promise<T | undefined> {
  const setting = await getDB().settings.get(key)
  return setting?.value as T | undefined
}

export async function setSetting<T = any>(key: string, value: T): Promise<string> {
  return await getDB().settings.put({ key, value })
}

export async function deleteSetting(key: string): Promise<void> {
  await getDB().settings.delete(key)
}

// Migration from localStorage to IndexedDB
export async function migrateFromLocalStorage(): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    // Migrate todos history
    const historyRaw = localStorage.getItem('notesHistory')
    if (historyRaw) {
      const history = JSON.parse(historyRaw) as any[]
      for (const note of history) {
        if (!note.id) {
          note.id = crypto.randomUUID()
        }
        await saveTodo(note as TodoData)
      }
      localStorage.removeItem('notesHistory')
    }

    // Migrate today's note
    const todayNoteRaw = localStorage.getItem('todayNote')
    if (todayNoteRaw) {
      const todayNote = JSON.parse(todayNoteRaw) as any
      if (!todayNote.id) {
        todayNote.id = crypto.randomUUID()
      }
      await saveTodo(todayNote as TodoData)
      localStorage.removeItem('todayNote')
      localStorage.removeItem('todayNoteDate')
    }

    // Migrate settings
    const motivationDate = localStorage.getItem('motivationDate')
    const todayMotivation = localStorage.getItem('todayMotivation')

    if (motivationDate) {
      await setSetting('motivationDate', motivationDate)
      localStorage.removeItem('motivationDate')
    }

    if (todayMotivation) {
      await setSetting('todayMotivation', todayMotivation)
      localStorage.removeItem('todayMotivation')
    }

    console.log('Migration from localStorage completed successfully')
  } catch (error) {
    console.error('Error migrating from localStorage:', error)
  }
}
