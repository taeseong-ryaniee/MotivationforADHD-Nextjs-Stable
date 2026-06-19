'use client'

import { useMemo, useState } from 'react'
import { ArrowLeft, Copy, NotebookPen, Pencil, Save, X } from 'lucide-react'
import type { TodoData } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { showSuccess } from '@/lib/toast'

interface TodayTodoViewProps {
  todayTodo: TodoData | null
  onBack?: () => void
  onCopyContent: (content: string) => void
  onUpdate?: (content: string) => Promise<void>
}

interface Section {
  emoji: string
  title: string
  body: string
}

const SECTION_EMOJIS = ['🌅', '💪', '📅', '⚡', '🎯', '🌟', '🧠'] as const

const SPECIAL_HEADER = '🌟 오늘의 특별 일정'
const ADVICE_PREFIX = '💡 어드바이스:'
const MEMORY_HEADER = '🧠 기억할 것'

function extractSpecialEvents(content: string): string[] {
  const lines = content.split(/\r?\n/)
  const start = lines.findIndex((line) => line.startsWith(SPECIAL_HEADER))
  if (start === -1) return []

  const out: string[] = []

  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (
      line.startsWith(ADVICE_PREFIX) ||
      line.startsWith(MEMORY_HEADER) ||
      SECTION_EMOJIS.some((emoji) => line.startsWith(emoji))
    ) {
      break
    }
    if (line.startsWith('- ')) {
      out.push(line.slice(2).trim())
    }
  }

  return out.filter(Boolean)
}

function buildSpecialSection(events: string[]): string[] {
  if (events.length === 0) return []
  return [
    SPECIAL_HEADER,
    ...events.map((item) => `- ${item}`),
    `${ADVICE_PREFIX} 일정을 기준으로 우선순위를 정해 한 번에 하나씩 진행하세요.`,
  ]
}

function updateSpecialEventsInContent(content: string, events: string[]): string {
  const lines = content.split(/\r?\n/)
  const nextSection = buildSpecialSection(events)
  const sectionStart = lines.findIndex((line) => line.startsWith(SPECIAL_HEADER))

  if (sectionStart !== -1) {
    let sectionEnd = lines.length
    for (let i = sectionStart + 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.startsWith(MEMORY_HEADER)) {
        sectionEnd = i
        break
      }
    }
    lines.splice(sectionStart, sectionEnd - sectionStart, ...nextSection)
  } else if (nextSection.length > 0) {
    const memoryStart = lines.findIndex((line) => line.startsWith(MEMORY_HEADER))
    const insertAt = memoryStart === -1 ? lines.length : memoryStart
    lines.splice(insertAt, 0, ...nextSection, '')
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

export function TodayTodoView({ todayTodo, onBack, onCopyContent, onUpdate }: TodayTodoViewProps) {
  const [isEditingSpecial, setIsEditingSpecial] = useState(false)
  const [specialEventsDraft, setSpecialEventsDraft] = useState('')

  const sections = useMemo(() => {
    const text = todayTodo?.content || ''
    if (!text) return [] as Section[]

    const lines = text.split(/\r?\n/)
    const out: Section[] = []
    let current: Section | null = null

    for (const raw of lines) {
      const line = raw.trimEnd()
      const emoji = SECTION_EMOJIS.find((e) => line.startsWith(e))

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

  const sectionTone = (_emoji: string) => {
    return 'bg-muted/20 border-border/60'
  }

  const handleSave = async () => {
    if (!onUpdate || !todayTodo) return
    const events = specialEventsDraft
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
    const updatedContent = updateSpecialEventsInContent(todayTodo.content, events)
    await onUpdate(updatedContent)
    setIsEditingSpecial(false)
    showSuccess('특별 일정이 수정되었습니다!')
  }

  const handleCancel = () => {
    setSpecialEventsDraft(extractSpecialEvents(todayTodo?.content || '').join('\n'))
    setIsEditingSpecial(false)
  }

  const isEditable = useMemo(() => {
      if (!todayTodo) return false;
      const today = new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      })
      return todayTodo.date === today
  }, [todayTodo])

  return (
    <div className="flex flex-col space-y-6 md:h-full" data-section="todo-detail-root">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <NotebookPen className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground font-sans">오늘의 정리</p>
            <h2 className="text-xl font-bold text-foreground md:text-2xl font-serif">오늘의 격려 To-do</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isEditable && !isEditingSpecial && (
            <Badge variant="secondary" className="text-xs">
              오늘만 특별 일정 수정 가능
            </Badge>
          )}
          {isEditingSpecial && (
            <Badge className="text-xs">편집 중</Badge>
          )}
          {!isEditingSpecial && onUpdate && isEditable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSpecialEventsDraft(extractSpecialEvents(todayTodo?.content || '').join('\n'))
                setIsEditingSpecial(true)
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              특별 일정 수정
            </Button>
          )}
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              돌아가기
            </Button>
          )}
        </div>
      </div>

      {todayTodo && (
        <Card
          className="flex flex-col border-border/60 bg-card/80 shadow-sm md:flex-1 md:overflow-hidden"
          data-section="todo-detail-content"
        >
          <CardContent className="flex flex-col p-4 sm:p-6 md:flex-1 md:overflow-y-auto">
            <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-border/60 pb-4 text-xs text-muted-foreground shrink-0">
              <Badge variant="secondary" className="font-sans">
                {todayTodo.date}
              </Badge>
              <Badge variant="outline" className="font-mono">
                {todayTodo.createdAt}
              </Badge>
            </div>

            {isEditingSpecial && (
              <Card className="mb-6 border-border/60 bg-muted/20 p-4 shadow-none">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">특별 일정 (한 줄에 하나씩)</p>
                  <Textarea
                    value={specialEventsDraft}
                    onChange={(e) => setSpecialEventsDraft(e.target.value)}
                    className="min-h-[140px] bg-background p-3 text-sm leading-relaxed"
                    placeholder="예: 팀 미팅 14:00…"
                    name="specialEventOnly"
                    autoComplete="off"
                    aria-label="특별 일정 수정"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="mr-2 h-4 w-4" />
                      취소
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="mr-2 h-4 w-4" />
                      저장하기
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <>
              {sections.length > 0 ? (
                <div
                  role="article"
                  aria-label="오늘의 To-do 섹션"
                  className="grid gap-4 sm:grid-cols-2"
                  data-section="todo-detail-sections"
                >
                  {sections.map((sec, idx) => (
                    <Card
                      key={idx}
                      className={`border-border/60 p-4 shadow-sm transition-colors hover:bg-opacity-80 ${sectionTone(sec.emoji)}`}
                      data-section="todo-detail-section"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xl" aria-hidden="true">
                          {sec.emoji}
                        </span>
                        <h4 className="text-base font-bold text-foreground font-serif">{sec.title}</h4>
                      </div>
                      <div className="text-sm leading-loose text-muted-foreground whitespace-pre-wrap font-sans">
                        {sec.body}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                  <Card className="border-border/60 bg-muted/20 p-5 shadow-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground leading-relaxed">
                      {todayTodo.content}
                    </pre>
                  </Card>
                )}

              <div className="mt-8 pt-4 border-t border-border/30 shrink-0">
                <Button
                  onClick={() => onCopyContent(todayTodo.content)}
                  className="w-full h-12 text-base font-medium shadow-sm transition-all hover:translate-y-[-1px]"
                  size="lg"
                  type="button"
                  aria-label="To-do 전체 내용 클립보드에 복사"
                >
                  <Copy className="h-5 w-5 mr-2" aria-hidden="true" />
                  클립보드에 전체 복사하기
                </Button>
              </div>
            </>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
