export interface TodoData {
  id: string
  date: string
  title: string
  content: string
  createdAt: string
}

export interface PracticalTip {
  category: string
  tips: string[]
}

export interface TodayTips {
  tip1: string
  tip2: string
  antiFogTip: string
  categories: string[]
}

export interface ContentData {
  version: string
  updatedAt: string
  locale: string
  motivationMessages: string[]
  antiBrainFogTips: string[]
  practicalTips: PracticalTip[]
  daySpecificMessages: Record<number, string>
}
