import { TodoData, Settings } from '@/lib/types';

export type StorageProvider = 'local' | 's3' | 'google_drive' | 'icloud';

export interface SyncStatus {
  lastSyncedAt: Date | null;
  status: 'idle' | 'syncing' | 'error' | 'success';
  error?: string;
}

export interface StorageAdapter {
  provider: StorageProvider;
  
  // 초기화
  initialize(): Promise<void>;
  
  // CRUD - Todos
  getTodos(): Promise<TodoData[]>;
  saveTodo(todo: TodoData): Promise<void>;
  deleteTodo(id: string): Promise<void>;
  bulkSaveTodos(todos: TodoData[]): Promise<void>;
  
  // Settings
  getSetting<T = unknown>(key: string): Promise<T | null>;
  saveSetting<T = unknown>(key: string, value: T): Promise<void>;
  deleteSetting(key: string): Promise<void>;
  
  // Legacy Settings (Optional)
  getSettings?(): Promise<Settings | null>;
  saveSettings?(settings: Settings): Promise<void>;
  
  // Sync & Backup (Optional for Local)
  sync?(): Promise<void>;
  backup?(): Promise<Blob>;
  restore?(data: Blob): Promise<void>;
}
