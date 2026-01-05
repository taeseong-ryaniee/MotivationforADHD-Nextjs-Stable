'use client'

import { useMemo } from 'react'
import { ArrowLeft, Copy, NotebookPen } from 'lucide-react'
import type { TodoData } from '@/lib/types'
import { BaseButton } from './ui/BaseButton'

interface TodayTodoViewProps {
  todayTodo: TodoData | null
  onBack: () => void
  onCopyContent: (content: string) => void
}

interface Section {
  emoji: string
  title: string
  body: string
}

export function TodayTodoView({ todayTodo, onBack, onCopyContent }: TodayTodoViewProps) {
  const sections = useMemo(() => {
    const text = todayTodo?.content || ''
    if (!text) return [] as Section[]

    const lines = text.split(/\r?\n/)
    const headerEmojis = ['🌅', '💪', '📅', '⚡', '🎯', '🌟', '🧠']
    const out: Section[] = []
    let current: Section | null = null

    for (const raw of lines) {
      const line = raw.trimEnd()
      const emoji = headerEmojis.find((e) => line.startsWith(e))

      if (emoji) {
        if (current) out.push(current)
        const title = line.slice(emoji.length).trim()
        current = { emoji, title, body: '' }
      } else if (current) {
        current.body += (current.body ? '\n' : '') + raw
      }
    }

    if (current) out.push(current)
    return out.filter((s) => s.title && s.body.trim())
  }, [todayTodo])

  const sectionTone = (emoji: string) => {
    switch (emoji) {
      case '🌅':
        return 'bg-orange-50 border-orange-100 dark:bg-orange-950/40 dark:border-orange-900'
      case '💪':
        return 'bg-green-50 border-green-100 dark:bg-green-950/40 dark:border-green-900'
      case '📅':
        return 'bg-sky-50 border-sky-100 dark:bg-sky-950/40 dark:border-sky-900'
      case '⚡':
        return 'bg-yellow-50 border-yellow-100 dark:bg-yellow-950/40 dark:border-yellow-900'
      case '🎯':
        return 'bg-indigo-50 border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-900'
      case '🌟':
        return 'bg-purple-50 border-purple-100 dark:bg-purple-950/40 dark:border-purple-900'
      case '🧠':
        return 'bg-surface-muted border-token'
      default:
        return 'bg-surface border-token'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <NotebookPen className="w-5 h-5 text-brand-500 mr-2" />
          <h2 className="heading-font text-lg font-semibold text-primary">오늘의 격려 To-do</h2>
        </div>
        <BaseButton variant="ghost" size="sm" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>
          돌아가기
        </BaseButton>
      </div>

      {todayTodo && (
        <div className="bg-surface-muted rounded-xl p-4 border border-token shadow-md">
          <div className="mb-4">
            <span className="inline-block heading-font text-xs text-secondary bg-surface border border-token rounded-full px-3 py-1">
              {todayTodo.date}
            </span>
            <span className="ml-2 text-[11px] text-secondary">{todayTodo.createdAt}</span>
          </div>

          {sections.length > 0 ? (
            <div>
              {sections.map((sec, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg p-4 mb-3 border ${sectionTone(sec.emoji)}`}
                >
                  <div className="flex items-center mb-1">
                    <span className="mr-2" aria-hidden="true">
                      {sec.emoji}
                    </span>
                    <h4 className="heading-font text-base font-semibold text-primary">{sec.title}</h4>
                  </div>
                  <div className="text-sm text-secondary whitespace-pre-wrap leading-relaxed">
                    {sec.body}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface rounded-lg p-4 mb-4 border border-token">
              <pre className="whitespace-pre-wrap font-sans text-sm text-secondary leading-relaxed">
                {todayTodo.content}
              </pre>
            </div>
          )}

          <button
            onClick={() => onCopyContent(todayTodo.content)}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-lg py-3 px-4 font-medium transition-colors flex items-center justify-center space-x-2"
            type="button"
          >
            <Copy className="w-4 h-4" />
            <span>클립보드에 복사하기</span>
          </button>
        </div>
      )}
    </div>
  )
}
