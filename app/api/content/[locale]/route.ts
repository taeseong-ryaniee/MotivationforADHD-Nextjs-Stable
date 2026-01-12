import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import type { ContentData } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour

// Whitelist of allowed locales
const ALLOWED_LOCALES = ['ko', 'en'] as const

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const { locale } = await params

    // Security: Validate locale to prevent path traversal attacks
    const allowedLocales = ALLOWED_LOCALES as readonly string[]
    if (!allowedLocales.includes(locale) ||
        locale.includes('..') ||
        locale.includes('/') ||
        locale.includes('\\')) {
      return NextResponse.json(
        { error: 'Invalid locale' },
        { status: 400 }
      )
    }

    const filePath = path.join(process.cwd(), 'public', 'content', `${locale}.json`)

    const fileContents = await fs.readFile(filePath, 'utf8')
    const content: ContentData = JSON.parse(fileContents)

    return NextResponse.json(content, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error loading content:', error)

    // Return default content on error
    const defaultContent: ContentData = {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      locale: 'ko',
      motivationMessages: [
        '오늘도 새로운 시작이에요. 완벽하지 않아도 괜찮습니다.',
        '어제의 실수는 오늘의 경험이 되었어요. 한 걸음씩 나아가세요.',
        'ADHD가 있어도 당신은 충분히 잘하고 있어요. 자신을 믿어보세요.',
      ],
      antiBrainFogTips: [
        '컴퓨터 켜자마자 마우스든 키보드든 일단 손부터 움직이세요',
        '생각하지 말고 어제 마지막에 열었던 파일부터 열어보세요',
      ],
      practicalTips: [
        {
          category: '시작하기',
          tips: ['타이머 25분 맞추고 한 가지 일에만 집중해보기'],
        },
      ],
      daySpecificMessages: {
        0: '일요일 저녁이나 월요일 아침, 새로운 한 주를 차근차근 시작해보세요.',
        1: '월요일 블루가 있어도 괜찮아요. 오늘 하나만 해내면 성공입니다.',
        2: '화요일, 어제의 관성을 이어가세요. 작은 루틴이 큰 변화를 만들어요.',
        3: '수요일 중반, 지친다면 잠시 쉬어가도 돼요. 완주가 목표입니다.',
        4: '목요일, 이번 주도 거의 다 왔어요. 마지막 스퍼트 화이팅!',
        5: '불금! 오늘은 조금 여유롭게 가도 괜찮아요. 다음 주 준비도 살짝 해두세요.',
        6: '토요일, 쉬는 날에도 작은 성취감을 느껴보세요. 휴식도 중요해요.',
      },
    }

    return NextResponse.json(defaultContent, {
      headers: {
        'Cache-Control': 'public, s-maxage=60',
        'Content-Type': 'application/json',
      },
    })
  }
}
