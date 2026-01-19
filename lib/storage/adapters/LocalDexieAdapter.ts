import { StorageAdapter, StorageProvider } from '../types';
import { getDB } from '@/lib/db';
import { TodoData, Settings } from '@/lib/types';

export class LocalDexieAdapter implements StorageAdapter {
  provider: StorageProvider = 'local';

  async initialize(): Promise<void> {
    // Dexie는 지연 초기화되므로 명시적 초기화는 선택사항이나,
    // DB 연결 테스트 등을 여기서 수행할 수 있음.
    const db = getDB();
    if (!db.isOpen()) {
      await db.open();
    }
  }

  async getTodos(): Promise<TodoData[]> {
    return await getDB().todos.toArray();
  }

  async saveTodo(todo: TodoData): Promise<void> {
    await getDB().todos.put(todo);
  }

  async deleteTodo(id: string): Promise<void> {
    await getDB().todos.delete(id);
  }

  async bulkSaveTodos(todos: TodoData[]): Promise<void> {
    await getDB().todos.bulkPut(todos);
  }

  async getSetting<T = unknown>(key: string): Promise<T | null> {
    const setting = await getDB().settings.get(key)
    return setting ? (setting.value as T) : null
  }

  async saveSetting<T = unknown>(key: string, value: T): Promise<void> {
    await getDB().settings.put({ key, value })
  }

  async deleteSetting(key: string): Promise<void> {
    await getDB().settings.delete(key)
  }

  // Legacy support
  async getSettings(): Promise<Settings | null> {
    const settings = await getDB().settings.get('user-settings')
    return settings || null
  }

  async saveSettings(settings: Settings): Promise<void> {
    await getDB().settings.put({ ...settings, id: 'user-settings' })
  }
}
