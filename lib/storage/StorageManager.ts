import { StorageAdapter } from './types';
import { LocalDexieAdapter } from './adapters/LocalDexieAdapter';

class StorageManager {
  private static instance: StorageManager;
  private adapter: StorageAdapter;

  private constructor() {
    // 기본값은 로컬 Dexie 어댑터
    this.adapter = new LocalDexieAdapter();
  }

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  // 어댑터 교체 (예: 클라우드 모드로 전환 시)
  public setAdapter(adapter: StorageAdapter) {
    this.adapter = adapter;
    this.adapter.initialize();
  }

  public getAdapter(): StorageAdapter {
    return this.adapter;
  }

  // 편의 메서드들 (Proxy methods)
  public async getTodos() {
    return this.adapter.getTodos();
  }

  public async saveTodo(todo: any) {
    return this.adapter.saveTodo(todo);
  }
}

export const storage = StorageManager.getInstance();
