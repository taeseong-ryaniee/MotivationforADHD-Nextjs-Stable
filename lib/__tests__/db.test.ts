import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { describe, it, expect, beforeEach } from 'vitest'
import {
  saveTodo,
  bulkSaveTodos,
  getTodoById,
  getTodoByDate,
  getTodosByDate,
  getAllTodos,
  clearAllTodos,
  deleteTodo,
  getDeletedTodoIds,
  setSetting,
  getSetting,
  deleteSetting,
  saveContent,
  getContent,
  migrateFromLocalStorage,
} from '../db'
import type { TodoData, ContentRecord } from '../types'

const makeTodo = (overrides: Partial<TodoData> = {}): TodoData => ({
  id: crypto.randomUUID(),
  date: '2026년 8월 11일',
  title: '테스트 todo',
  content: '테스트 내용',
  createdAt: '2026. 8. 11. 오전 9:00:00',
  ...overrides,
})

// db.ts 의 `_db` 는 모듈 레벨 singleton — 이 describe 는 파일에서 가장 먼저 실행되어야
// (아래 `describe('lib/db', ...)` 의 beforeEach 가 getDB() 를 먼저 불러버리기 전에) v3 상태의
// DB 를 실제 v4 로 여는 upgrade 콜백(db.ts:54-60)을 태울 수 있다. 순서를 옮기지 말 것.
describe('v4 스키마 upgrade', () => {
  it('v3 상태로 저장돼 있던 레코드를 v4 로 열면 upgrade 콜백이 createdAtMs 를 백필한다', async () => {
    const legacy = new Dexie('MotivationForADHD')
    legacy.version(1).stores({ todos: 'id, date, createdAt', settings: 'key' })
    legacy.version(2).stores({ todos: 'id, date, createdAt, [date+createdAt]', settings: 'key' })
    legacy
      .version(3)
      .stores({ todos: 'id, date, createdAt, [date+createdAt]', settings: 'key', content: 'locale' })
    await legacy.open()

    const legacyId = crypto.randomUUID()
    await legacy.table('todos').put({
      id: legacyId,
      date: '2026년 8월 10일',
      title: 'v3 레거시 todo',
      content: '내용',
      createdAt: '2026. 8. 10. 오전 9:00:00',
      // createdAtMs 없음 — v3 스키마엔 이 필드가 존재하지 않는다
    })
    legacy.close()

    // db.ts 의 getDB() 를 처음 트리거 — 온디스크 상태가 v3 이므로 version(4).upgrade() 가 실행된다.
    const upgraded = await getTodoById(legacyId)
    expect(typeof upgraded?.createdAtMs).toBe('number')
  })
})

describe('lib/db', () => {
  beforeEach(async () => {
    await clearAllTodos()
    await deleteSetting('deletedTodoIds')
    await deleteSetting('migrationComplete')
    await deleteSetting('motivationDate')
    await deleteSetting('todayMotivation')
    localStorage.clear()
  })

  it('saveTodo → getTodoById 왕복, createdAtMs 백필', async () => {
    const todo = makeTodo()
    await saveTodo(todo)

    const found = await getTodoById(todo.id)
    expect(found?.title).toBe(todo.title)
    expect(typeof found?.createdAtMs).toBe('number')
  })

  it('saveTodo 가 잘못된 todo 를 거부한다', async () => {
    await expect(saveTodo(makeTodo({ id: 'not-a-uuid' }))).rejects.toThrow()
    await expect(saveTodo(makeTodo({ title: '' }))).rejects.toThrow()
  })

  it('bulkSaveTodos 후 getAllTodos 가 createdAtMs 내림차순으로 돌려준다', async () => {
    const older = makeTodo({ createdAtMs: 1000 })
    const newer = makeTodo({ createdAtMs: 2000 })
    await bulkSaveTodos([older, newer])

    const all = await getAllTodos()
    expect(all.map((t) => t.id)).toEqual([newer.id, older.id])
  })

  it('getTodoByDate / getTodosByDate 가 같은 date 문자열의 레코드를 찾는다', async () => {
    const date = '2026년 8월 11일'
    const a = makeTodo({ date })
    const b = makeTodo({ date })
    await bulkSaveTodos([a, b])

    expect((await getTodoByDate(date))?.date).toBe(date)
    const byDate = await getTodosByDate(date)
    expect(byDate.map((t) => t.id).sort()).toEqual([a.id, b.id].sort())
  })

  it('deleteTodo 가 todo 를 지우고 툼스톤을 남긴다', async () => {
    const todo = makeTodo()
    await saveTodo(todo)

    await deleteTodo(todo.id)
    expect(await getTodoById(todo.id)).toBeUndefined()
    expect(await getDeletedTodoIds()).toContain(todo.id)

    // 같은 id 를 두 번 지워도 목록에 한 번만 들어간다
    await deleteTodo(todo.id)
    const ids = await getDeletedTodoIds()
    expect(ids.filter((id) => id === todo.id)).toHaveLength(1)
  })

  it('setSetting / getSetting / deleteSetting 왕복', async () => {
    await setSetting('someKey', { nested: true })
    expect(await getSetting('someKey')).toEqual({ nested: true })

    await deleteSetting('someKey')
    expect(await getSetting('someKey')).toBeUndefined()
  })

  it('saveContent / getContent 왕복', async () => {
    const record: ContentRecord = {
      locale: 'ko',
      data: {
        version: '1',
        updatedAt: '2026-08-11',
        locale: 'ko',
        motivationMessages: ['화이팅'],
        antiBrainFogTips: ['일단 시작'],
        practicalTips: [{ category: '집중', tips: ['타이머 쓰기'] }],
        daySpecificMessages: {},
        cheers: ['잘하고 있어요'],
      },
      version: '1',
      seededAt: '2026-08-11T00:00:00.000Z',
    }
    await saveContent(record)

    const found = await getContent('ko')
    expect(found?.data.motivationMessages).toEqual(['화이팅'])
  })

  describe('migrateFromLocalStorage', () => {
    it('migrationComplete 가 이미 true 면 아무 것도 하지 않는다', async () => {
      await setSetting('migrationComplete', true)
      localStorage.setItem('notesHistory', JSON.stringify([{ title: 'x', content: 'y' }]))

      await migrateFromLocalStorage()

      // 스킵됐으므로 localStorage 는 그대로 남아 있다
      expect(localStorage.getItem('notesHistory')).not.toBeNull()
      expect(await getAllTodos()).toHaveLength(0)
    })

    it('localStorage.notesHistory 의 유효한 항목을 todo 로 옮기고 키를 지운다', async () => {
      localStorage.setItem(
        'notesHistory',
        JSON.stringify([
          { date: '2026년 8월 10일', title: '옛날 메모', content: '내용', createdAt: '2026. 8. 10.' },
        ])
      )

      await migrateFromLocalStorage()

      expect(localStorage.getItem('notesHistory')).toBeNull()
      const all = await getAllTodos()
      expect(all).toHaveLength(1)
      expect(all[0].title).toBe('옛날 메모')
    })
  })
})
