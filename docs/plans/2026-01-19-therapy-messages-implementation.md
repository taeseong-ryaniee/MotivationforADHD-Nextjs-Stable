# 인지치료 메시지 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 기존 7개 동기부여 메시지를 400개 인지치료 기반 메시지로 업그레이드

**Architecture:** 새로운 `therapyMessages` 구조를 JSON에 추가하고, 날짜 기반 시드로 매일 같은 메시지를 표시하는 선택 로직 구현. 기존 `motivationMessages` 필드는 유지하되 새 구조 우선 사용.

**Tech Stack:** TypeScript, Zustand, TanStack Query, Vitest

---

## Task 1: TypeScript 타입 정의 추가

**Files:**
- Modify: `lib/types.ts`

**Step 1: 새로운 타입 정의 추가**

`lib/types.ts` 파일 끝에 추가:

```typescript
// Therapy Messages (인지치료 기반 메시지)
export type TherapyType = 'cbt' | 'dbt' | 'act'

export interface TherapyCategory {
  label: string
  cbt: string[]
  dbt: string[]
  act: string[]
}

export interface TherapyMessages {
  starting: TherapyCategory    // 시작하기
  working: TherapyCategory     // 업무/공부 진행
  stuck: TherapyCategory       // 막힘/멈춤
  emotion: TherapyCategory     // 감정 다스리기
  mistake: TherapyCategory     // 실수/자책 대응
  social: TherapyCategory      // 대인관계/소통
}

// ContentData 확장 (기존 호환성 유지)
export interface ContentDataV2 extends Omit<ContentData, 'motivationMessages'> {
  version: string
  therapyMessages?: TherapyMessages
  motivationMessages?: string[] // 하위 호환성
}
```

**Step 2: 커밋**

```bash
git add lib/types.ts
git commit -m "feat: add TherapyMessages type definitions"
```

---

## Task 2: 메시지 선택 유틸리티 생성

**Files:**
- Create: `lib/utils/messageSelector.ts`
- Create: `lib/utils/__tests__/messageSelector.test.ts`

**Step 1: 테스트 파일 생성**

```typescript
// lib/utils/__tests__/messageSelector.test.ts
import { describe, it, expect } from 'vitest'
import { hashDate, flattenTherapyMessages, getDailyMessage } from '../messageSelector'
import type { TherapyMessages } from '@/lib/types'

describe('hashDate', () => {
  it('같은 날짜는 같은 해시를 반환한다', () => {
    const hash1 = hashDate('2026-01-19')
    const hash2 = hashDate('2026-01-19')
    expect(hash1).toBe(hash2)
  })

  it('다른 날짜는 다른 해시를 반환한다', () => {
    const hash1 = hashDate('2026-01-19')
    const hash2 = hashDate('2026-01-20')
    expect(hash1).not.toBe(hash2)
  })

  it('양수를 반환한다', () => {
    const hash = hashDate('2026-01-19')
    expect(hash).toBeGreaterThanOrEqual(0)
  })
})

describe('flattenTherapyMessages', () => {
  const mockMessages: TherapyMessages = {
    starting: { label: '시작하기', cbt: ['cbt1', 'cbt2'], dbt: ['dbt1'], act: ['act1'] },
    working: { label: '업무', cbt: ['work-cbt'], dbt: [], act: [] },
    stuck: { label: '막힘', cbt: [], dbt: [], act: [] },
    emotion: { label: '감정', cbt: [], dbt: [], act: [] },
    mistake: { label: '실수', cbt: [], dbt: [], act: [] },
    social: { label: '소통', cbt: [], dbt: [], act: [] },
  }

  it('모든 메시지를 하나의 배열로 평탄화한다', () => {
    const result = flattenTherapyMessages(mockMessages)
    expect(result).toContain('cbt1')
    expect(result).toContain('dbt1')
    expect(result).toContain('act1')
    expect(result).toContain('work-cbt')
    expect(result.length).toBe(5)
  })

  it('빈 배열도 처리한다', () => {
    const emptyMessages: TherapyMessages = {
      starting: { label: '', cbt: [], dbt: [], act: [] },
      working: { label: '', cbt: [], dbt: [], act: [] },
      stuck: { label: '', cbt: [], dbt: [], act: [] },
      emotion: { label: '', cbt: [], dbt: [], act: [] },
      mistake: { label: '', cbt: [], dbt: [], act: [] },
      social: { label: '', cbt: [], dbt: [], act: [] },
    }
    const result = flattenTherapyMessages(emptyMessages)
    expect(result).toEqual([])
  })
})

describe('getDailyMessage', () => {
  const mockMessages: TherapyMessages = {
    starting: { label: '시작하기', cbt: ['msg1', 'msg2', 'msg3'], dbt: ['msg4'], act: ['msg5'] },
    working: { label: '업무', cbt: ['msg6'], dbt: ['msg7'], act: ['msg8'] },
    stuck: { label: '막힘', cbt: ['msg9'], dbt: ['msg10'], act: [] },
    emotion: { label: '감정', cbt: [], dbt: [], act: [] },
    mistake: { label: '실수', cbt: [], dbt: [], act: [] },
    social: { label: '소통', cbt: [], dbt: [], act: [] },
  }

  it('같은 날짜에는 같은 메시지를 반환한다', () => {
    const msg1 = getDailyMessage(mockMessages, '2026-01-19')
    const msg2 = getDailyMessage(mockMessages, '2026-01-19')
    expect(msg1).toBe(msg2)
  })

  it('다른 날짜에는 (대체로) 다른 메시지를 반환한다', () => {
    const msg1 = getDailyMessage(mockMessages, '2026-01-19')
    const msg2 = getDailyMessage(mockMessages, '2026-01-20')
    // 확률적으로 다를 수 있지만, 10개 메시지 중 선택하므로 대체로 다름
    // 완전히 다른지는 보장 못하므로 타입만 확인
    expect(typeof msg1).toBe('string')
    expect(typeof msg2).toBe('string')
  })

  it('메시지 배열에 있는 값을 반환한다', () => {
    const allMessages = ['msg1', 'msg2', 'msg3', 'msg4', 'msg5', 'msg6', 'msg7', 'msg8', 'msg9', 'msg10']
    const result = getDailyMessage(mockMessages, '2026-01-19')
    expect(allMessages).toContain(result)
  })
})
```

**Step 2: 테스트 실행 (실패 확인)**

```bash
bun test messageSelector
```

Expected: FAIL - 파일이 존재하지 않음

**Step 3: 구현 파일 생성**

```typescript
// lib/utils/messageSelector.ts
import type { TherapyMessages } from '@/lib/types'

/**
 * 날짜 문자열을 해시값으로 변환
 * 같은 날짜는 항상 같은 해시를 반환
 */
export function hashDate(dateString: string): number {
  let hash = 0
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * TherapyMessages 구조를 단일 배열로 평탄화
 */
export function flattenTherapyMessages(messages: TherapyMessages): string[] {
  const categories = Object.values(messages)
  const allMessages: string[] = []

  for (const category of categories) {
    allMessages.push(...category.cbt)
    allMessages.push(...category.dbt)
    allMessages.push(...category.act)
  }

  return allMessages
}

/**
 * 오늘 날짜 기반으로 메시지 선택
 * 같은 날은 같은 메시지를 반환
 */
export function getDailyMessage(
  messages: TherapyMessages,
  dateString?: string
): string {
  const today = dateString || new Date().toISOString().split('T')[0]
  const allMessages = flattenTherapyMessages(messages)

  if (allMessages.length === 0) {
    return '오늘도 화이팅이에요!'
  }

  const seed = hashDate(today)
  const index = seed % allMessages.length

  return allMessages[index]
}

/**
 * 오늘의 메시지 가져오기 (편의 함수)
 */
export function getTodayMessage(messages: TherapyMessages): string {
  return getDailyMessage(messages)
}
```

**Step 4: 테스트 실행 (성공 확인)**

```bash
bun test messageSelector
```

Expected: PASS

**Step 5: 커밋**

```bash
git add lib/utils/messageSelector.ts lib/utils/__tests__/messageSelector.test.ts
git commit -m "feat: add date-seeded message selector utility with tests"
```

---

## Task 3: JSON 콘텐츠 구조 업데이트

**Files:**
- Modify: `public/content/ko.json`

**Step 1: therapyMessages 구조 추가**

`public/content/ko.json`을 수정하여 `therapyMessages` 필드 추가.
기존 `motivationMessages`는 하위 호환성을 위해 유지.

```json
{
  "version": "2.0.0",
  "updatedAt": "2026-01-19T00:00:00.000Z",
  "locale": "ko",
  "therapyMessages": {
    "starting": {
      "label": "시작하기",
      "cbt": [
        "'오늘도 못 할 것 같아'라는 생각이 들 수 있어요. 하지만 어제도 그렇게 생각했는데 해냈잖아요",
        "'완벽하게 준비되면 시작해야지'라는 생각은 함정이에요. 준비는 하면서 완성되는 거예요",
        "시작이 어려운 건 당신 잘못이 아니에요. ADHD 뇌는 시작 버튼이 좀 뻑뻑할 뿐이에요"
      ],
      "dbt": [
        "아침에 몸이 무거우면, 일단 기지개 한 번 펴보세요. 몸이 먼저 깨어나면 마음도 따라와요",
        "시작 전 긴장감이 느껴지면, 손바닥을 5초간 꽉 쥐었다 천천히 펴보세요",
        "숨을 4초 들이쉬고 6초 내쉬면서, 지금 이 순간에 집중해보세요"
      ],
      "act": [
        "시작이 두려워도 괜찮아요. 완벽한 준비 없이, 일단 컴퓨터 전원부터 켜보세요",
        "'못 할 것 같다'는 생각이 있어도 괜찮아요. 그 생각을 안고 파일 하나만 열어보세요",
        "완벽하지 않아도 돼요. 시작하는 것만으로 이미 한 걸음 나아간 거예요"
      ]
    },
    "working": {
      "label": "업무/공부 진행",
      "cbt": [
        "'이거 언제 다 하지'라는 생각이 들면, 지금 5분만 집중해보세요. 5분이 모여 한 시간이 돼요",
        "멀티태스킹이 효율적이라는 건 착각이에요. 하나씩 하는 게 결국 더 빨라요",
        "'다른 사람은 쉽게 하는데'라는 비교는 접어두세요. 당신만의 속도가 있어요"
      ],
      "dbt": [
        "집중이 흐트러지면, 잠시 눈을 감고 세 번 깊게 숨 쉬어보세요",
        "몸이 뻣뻣해지면, 자리에서 어깨를 세 번 돌려보세요. 작은 움직임이 집중을 되살려요",
        "지루함이 밀려올 때, 물 한 잔 마시며 5분만 쉬어가세요. 쉼도 일의 일부예요"
      ],
      "act": [
        "산만해져도 괜찮아요. 알아차렸다면 다시 돌아오면 돼요. 그게 바로 집중이에요",
        "완벽하게 끝내려 하지 마세요. 80%만 해도 충분해요. 나머지는 내일의 내가 할 거예요",
        "지금 이 순간 할 수 있는 가장 작은 것 하나만 해보세요. 그것만으로 충분해요"
      ]
    },
    "stuck": {
      "label": "막힘/멈춤",
      "cbt": [
        "'아무것도 안 돼'라는 생각이 들 때, 오늘 한 작은 일들을 떠올려보세요. 분명 뭔가 했어요",
        "막혔다고 실패한 게 아니에요. 잠시 멈춘 것뿐이에요. 멈춤도 과정의 일부예요",
        "'나는 왜 이렇게 느리지'라는 생각 대신, '나는 지금 쉬어가는 중이야'라고 말해보세요"
      ],
      "dbt": [
        "막막할 때는 자리에서 일어나 창문을 열어보세요. 신선한 공기가 머리를 맑게 해줄 거예요",
        "멈춰버린 느낌이 들면, 손목을 돌리며 작은 움직임부터 시작해보세요",
        "답답할 때, 차가운 물로 손을 씻어보세요. 감각에 집중하면 머리가 맑아져요"
      ],
      "act": [
        "막혀도 괜찮아요. 다른 일을 하다 보면 해결책이 떠오를 때가 있어요. 잠시 다른 걸 해보세요",
        "지금 못 풀어도 돼요. 나중에 다시 보면 쉬워 보일 수 있어요. 일단 넘어가세요",
        "완벽한 답을 찾으려 하지 마세요. 일단 '임시'라고 적고 넘어가도 괜찮아요"
      ]
    },
    "emotion": {
      "label": "감정 다스리기",
      "cbt": [
        "화가 나는 건 자연스러운 감정이에요. 하지만 화난 상태로 결정하면 후회할 수 있어요",
        "'이건 참을 수 없어'라는 생각이 들면, '지금은 힘들지만 지나갈 거야'로 바꿔보세요",
        "감정이 격해지면 판단력이 흐려져요. 중요한 결정은 감정이 가라앉은 후에 하세요"
      ],
      "dbt": [
        "화가 확 올라올 때, 차가운 물로 얼굴을 씻어보세요. 마음이 조금 가라앉아요",
        "심장이 두근거리면, 숨을 4초 들이쉬고 7초 내쉬어보세요. 심박수가 천천히 내려갈 거예요",
        "감정이 폭발할 것 같으면, 화장실에 가서 혼자만의 시간을 잠시 가져보세요",
        "불안이 밀려오면, 발바닥이 바닥에 닿는 느낌에 집중해보세요. 지금 여기에 있다는 걸 느껴보세요",
        "조급한 마음이 올라오면, 손바닥을 5초간 꽉 쥐었다 천천히 펴보세요. 도움이 될 거예요"
      ],
      "act": [
        "불안한 마음이 있어도 괜찮아요. 불안을 없애려 하지 말고, 불안과 함께 할 일을 해보세요",
        "감정은 파도와 같아요. 밀려왔다 빠져나가요. 지금 이 감정도 지나갈 거예요",
        "기분이 안 좋아도 괜찮아요. 기분대로 행동하지 않아도 돼요. 지금 해야 할 작은 것 하나만 해보세요"
      ]
    },
    "mistake": {
      "label": "실수/자책 대응",
      "cbt": [
        "'나는 왜 맨날 실수하지'라는 생각 대신, '실수는 누구나 해, 다음엔 더 잘하면 돼'라고 말해보세요",
        "실수 하나가 당신 전체를 정의하지 않아요. 잘한 것도 분명히 있어요",
        "'다 내 잘못이야'라는 생각이 들면, 정말 100% 내 잘못인지 따져보세요. 대부분 그렇지 않아요",
        "완벽주의는 적이에요. 실수해도 세상이 끝나지 않아요. 고치면 돼요",
        "자책하는 시간은 아무것도 해결하지 못해요. 그 시간에 작은 거라도 고쳐보세요"
      ],
      "dbt": [
        "실수 후 자책이 밀려오면, 따뜻한 차 한 잔 마시며 잠시 쉬어가세요",
        "마음이 무거울 때, 좋아하는 음악을 틀어보세요. 기분 전환에 도움이 돼요"
      ],
      "act": [
        "실수했어도 괜찮아요. 중요한 건 다음에 어떻게 하느냐예요. 배운 걸 적어두세요",
        "자책하는 마음이 있어도 괜찮아요. 그 마음을 안고, 할 수 있는 작은 수습부터 시작해보세요",
        "완벽한 사람은 없어요. 실수는 성장의 재료예요. 오늘의 실수가 내일의 경험이 될 거예요"
      ]
    },
    "social": {
      "label": "대인관계/소통",
      "cbt": [
        "'저 사람이 나를 싫어하나봐'라는 생각, 정말 그런 증거가 있나요? 대부분 추측일 거예요",
        "말실수했다고 끝난 게 아니에요. 솔직하게 '아까 제가 좀 그랬죠, 죄송해요'라고 하면 돼요",
        "'내 말을 아무도 안 들어줘'라는 생각 대신, 한 명이라도 들어주는 사람을 떠올려보세요"
      ],
      "dbt": [
        "대화 중 감정이 올라오면, 잠시 '화장실 다녀올게요'라고 하고 자리를 피해도 괜찮아요",
        "말하기 전에 세 번 숨을 쉬어보세요. 충동적인 말을 줄일 수 있어요",
        "어려운 대화 전에, 손바닥에 찬물을 대며 마음을 가라앉혀보세요"
      ],
      "act": [
        "관계가 어려워도 괜찮아요. 완벽한 관계는 없어요. 지금 할 수 있는 작은 친절부터 시작해보세요",
        "거절당해도 괜찮아요. 모든 사람에게 호감을 살 필요 없어요. 나를 이해해주는 한 명이면 충분해요"
      ]
    }
  },
  "motivationMessages": [
    "오늘도 새로운 시작이에요. 완벽하지 않아도 괜찮습니다.",
    "어제의 실수는 오늘의 경험이 되었어요. 한 걸음씩 나아가세요.",
    "ADHD가 있어도 당신은 충분히 잘하고 있어요. 자신을 믿어보세요.",
    "작은 진전도 진전입니다. 오늘 하나만이라도 해내면 성공이에요.",
    "남들과 비교하지 마세요. 당신만의 속도로 가면 됩니다.",
    "집중이 안 되는 날도 있어요. 그런 날엔 더 작은 목표로 시작해보세요.",
    "완료보다 진행이 중요해요. 80% 완성된 것이 100% 계획보다 나아요."
  ],
  "antiBrainFogTips": [...기존 유지...],
  "practicalTips": [...기존 유지...],
  "daySpecificMessages": {...기존 유지...}
}
```

> **Note:** 위는 샘플 메시지 구조입니다. 실제로는 400개 메시지를 모두 작성해야 합니다.

**Step 2: 커밋**

```bash
git add public/content/ko.json
git commit -m "feat: add therapyMessages structure with sample content"
```

---

## Task 4: Zustand 스토어 업데이트

**Files:**
- Modify: `lib/store.ts`
- Modify: `lib/types.ts`

**Step 1: 스토어에 therapyMessages 지원 추가**

`lib/store.ts` 수정:

1. import 추가:
```typescript
import { getDailyMessage } from './utils/messageSelector'
import type { TherapyMessages, ContentDataV2 } from './types'
```

2. 인터페이스에 therapyMessages 추가:
```typescript
interface TodoStore {
  // ... 기존 필드
  therapyMessages: TherapyMessages | null
  // ...
}
```

3. 초기 상태에 추가:
```typescript
therapyMessages: null,
```

4. `initialize` 함수 수정 (motivation 선택 로직):
```typescript
// 기존: const newMotivation = getRandomItem(state.motivationMessages)
// 변경:
const newMotivation = state.therapyMessages
  ? getDailyMessage(state.therapyMessages)
  : getRandomItem(state.motivationMessages)
```

5. `loadContent` 함수 수정:
```typescript
loadContent: (content: ContentDataV2) => {
  set({
    therapyMessages: content.therapyMessages || null,
    motivationMessages: content.motivationMessages || [],
    antiBrainFogTips: content.antiBrainFogTips,
    practicalTips: content.practicalTips,
    daySpecificMessages: content.daySpecificMessages,
  })
}
```

**Step 2: 커밋**

```bash
git add lib/store.ts
git commit -m "feat: integrate therapyMessages into Zustand store"
```

---

## Task 5: 400개 메시지 콘텐츠 작성

**Files:**
- Modify: `public/content/ko.json`

**Step 1: 카테고리별 메시지 작성**

설계 문서의 배분표에 따라 400개 메시지 작성:

| 카테고리 | CBT | DBT | ACT | 합계 |
|---------|-----|-----|-----|------|
| starting | 30 | 25 | 25 | 80 |
| working | 35 | 30 | 35 | 100 |
| stuck | 25 | 20 | 25 | 70 |
| emotion | 15 | 30 | 15 | 60 |
| mistake | 25 | 10 | 15 | 50 |
| social | 15 | 15 | 10 | 40 |

**문체 가이드라인:**
- 친절하고 따뜻한 말투
- 의문문 금지 → 평서문/명령문만
- 전문 용어 금지 → 쉬운 일상 표현

**Step 2: JSON 업데이트 및 검증**

```bash
# JSON 유효성 검사
bun run lint
```

**Step 3: 커밋**

```bash
git add public/content/ko.json
git commit -m "feat: complete 400 therapy messages content"
```

---

## Task 6: 검증 및 통합 테스트

**Files:**
- Modify: `lib/validation.ts` (있다면)

**Step 1: 앱 실행 및 수동 테스트**

```bash
bun dev
```

확인 사항:
- [ ] 메인 화면에서 메시지가 표시되는지
- [ ] 같은 날 앱 재실행 시 같은 메시지가 표시되는지
- [ ] 브라우저 날짜 변경 시 다른 메시지가 표시되는지

**Step 2: 테스트 전체 실행**

```bash
bun test
```

**Step 3: 빌드 확인**

```bash
bun run build
```

**Step 4: 최종 커밋**

```bash
git add -A
git commit -m "feat: complete therapy messages integration"
```

---

## 요약

| Task | 설명 | 예상 난이도 |
|------|------|-----------|
| 1 | TypeScript 타입 정의 | 쉬움 |
| 2 | 메시지 선택 유틸리티 + 테스트 | 보통 |
| 3 | JSON 구조 업데이트 (샘플) | 쉬움 |
| 4 | Zustand 스토어 통합 | 보통 |
| 5 | 400개 메시지 작성 | 많음 (콘텐츠 작업) |
| 6 | 검증 및 테스트 | 쉬움 |
