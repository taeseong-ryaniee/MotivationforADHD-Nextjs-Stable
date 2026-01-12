import Dexie, { type EntityTable } from 'dexie'
import type { TodoData } from './types'
import { TodoDataSchema, validateMigrationData } from './validation'

export interface Settings<T = unknown> {
  key: string
  value: T
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
    // v1: Initial schema
    _db.version(1).stores({
      todos: 'id, date, createdAt',
      settings: 'key'
    })

    // v2: Add compound index for optimized date-based queries
    _db.version(2).stores({
      todos: 'id, date, createdAt, [date+createdAt]',
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
  // Validate before saving to prevent corrupt data
  const validated = TodoDataSchema.parse(todo)
  return await getDB().todos.put(validated)
}

export async function bulkSaveTodos(todos: TodoData[]): Promise<string> {
  // Validate all todos before bulk saving
  const validated = todos.map(todo => TodoDataSchema.parse(todo))
  // bulkPut returns the key of the last item
  return await getDB().todos.bulkPut(validated)
}

export async function deleteTodo(id: string): Promise<void> {
  await getDB().todos.delete(id)
}

export async function clearAllTodos(): Promise<void> {
  await getDB().todos.clear()
}

// Helper functions for settings
export async function getSetting<T = unknown>(key: string): Promise<T | undefined> {
  const setting = await getDB().settings.get(key)
  return setting?.value as T | undefined
}

export async function setSetting<T = unknown>(key: string, value: T): Promise<string> {
  return await getDB().settings.put({ key, value })
}

export async function deleteSetting(key: string): Promise<void> {
  await getDB().settings.delete(key)
}

// Migration from localStorage to IndexedDB
export async function migrateFromLocalStorage(): Promise<void> {
  if (typeof window === 'undefined') return

  // Check if migration already completed (idempotency)
  const migrationComplete = await getSetting<boolean>('migrationComplete')
  if (migrationComplete) {
    console.log('[Migration] Already completed, skipping')
    return
  }

  try {
    let migratedCount = 0

    // Migrate todos history
    const historyRaw = localStorage.getItem('notesHistory')
    if (historyRaw) {
      try {
        const parsed = JSON.parse(historyRaw)
        if (Array.isArray(parsed)) {
          for (const note of parsed) {
            const validated = validateMigrationData(note)
            if (!validated) {
              console.warn('[Migration] Skipping invalid note:', note)
              continue
            }

            // Fill in required fields with defaults
            const todoData: TodoData = {
              id: validated.id || crypto.randomUUID(),
              date: validated.date || new Date().toLocaleDateString('ko-KR'),
              title: validated.title || 'Migrated Todo',
              content: validated.content || '',
              createdAt: validated.createdAt || new Date().toLocaleString('ko-KR')
            }

            await saveTodo(todoData)
            migratedCount++
          }
          localStorage.removeItem('notesHistory')
        }
      } catch (parseError) {
        console.error('[Migration] Failed to parse notesHistory:', parseError)
      }
    }

    // Migrate today's note
    const todayNoteRaw = localStorage.getItem('todayNote')
    if (todayNoteRaw) {
      try {
        const parsed = JSON.parse(todayNoteRaw)
        const validated = validateMigrationData(parsed)

        if (validated) {
          const todoData: TodoData = {
            id: validated.id || crypto.randomUUID(),
            date: validated.date || new Date().toLocaleDateString('ko-KR'),
            title: validated.title || 'Migrated Todo',
            content: validated.content || '',
            createdAt: validated.createdAt || new Date().toLocaleString('ko-KR')
          }

          await saveTodo(todoData)
          migratedCount++
        }

        localStorage.removeItem('todayNote')
        localStorage.removeItem('todayNoteDate')
      } catch (parseError) {
        console.error('[Migration] Failed to parse todayNote:', parseError)
      }
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

    // Mark migration as complete
    await setSetting('migrationComplete', true)

    console.log(`[Migration] Successfully migrated ${migratedCount} todos`)
  } catch (error) {
    console.error('[Migration] Critical error:', error)
    // Don't mark as complete so it can be retried
    throw new Error(`마이그레이션 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
  }
}
