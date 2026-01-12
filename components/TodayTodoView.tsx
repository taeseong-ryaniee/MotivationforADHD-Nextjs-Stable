'use client'

import { useMemo } from 'react'
import { ArrowLeft, Copy, NotebookPen } from 'lucide-react'
import type { TodoData } from '@/lib/types'
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'

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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
            <NotebookPen className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold text-secondary">오늘의 정리</p>
            <h2 className="text-xl font-semibold text-primary md:text-2xl">오늘의 격려 To-do</h2>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          돌아가기
        </Button>
      </div>

      {todayTodo && (
        <Card className="shadow-md" aria-live="polite" aria-atomic="true">
          <CardContent className="p-6">
            <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-token/60 pb-4 text-xs text-secondary">
              <span className="rounded-full border border-token/60 bg-surface px-3 py-1 font-semibold text-secondary">
                {todayTodo.date}
              </span>
              <span>{todayTodo.createdAt}</span>
            </div>

            {sections.length > 0 ? (
              <div role="article" aria-label="오늘의 To-do 섹션" className="grid gap-4 md:grid-cols-2">
                {sections.map((sec, idx) => (
                  <Card
                    key={idx}
                    className={`p-4 shadow-none ${sectionTone(sec.emoji)}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg" aria-hidden="true">
                        {sec.emoji}
                      </span>
                      <h4 className="text-sm font-semibold text-primary">{sec.title}</h4>
                    </div>
                    <div className="mt-3 text-sm leading-relaxed text-secondary whitespace-pre-wrap">
                      {sec.body}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-surface p-5 shadow-none">
                <pre className="whitespace-pre-wrap font-sans text-sm text-secondary leading-relaxed">
                  {todayTodo.content}
                </pre>
              </Card>
            )}

            <Button
              onClick={() => onCopyContent(todayTodo.content)}
              className="mt-6 w-full"
              size="lg"
              type="button"
              aria-label="To-do 전체 내용 클립보드에 복사"
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              클립보드에 복사하기
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
