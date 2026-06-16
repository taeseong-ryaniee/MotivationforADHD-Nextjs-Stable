---
name: add-content
description: public/content/ko.json에 새 동기 메시지, 팁, 응원 문구를 추가할 때 ContentData 스키마와 톤 가이드
---

콘텐츠 추가 전 반드시 읽으세요:
- `lib/types.ts`의 `ContentData` 인터페이스
- `public/content/ko.json` 구조

**추가 가능한 필드와 톤 가이드:**

`motivationMessages[]`
- 매일 아침 랜덤 선택되는 메시지
- 1~2문장, 따뜻하고 공감하는 톤
- O: "오늘도 시작했다는 것만으로도 충분해요"
- X: "오늘도 파이팅!" (공허한 응원), "집중하세요" (압박)

`antiBrainFogTips[]`
- 뇌 안개(brain fog) 해소를 위한 즉시 실행 가능한 팁
- 구체적인 행동 동사로 시작
- O: "물 한 잔 마시기", "창문 열어 환기하기"
- X: "집중력을 높이세요", "루틴을 만드세요"

`practicalTips[].tips[]`
- 카테고리별 실용 팁 (category 필드로 그룹화)
- 기존 카테고리 확인 후 맞는 곳에 추가

`cheers[]`
- 완료/달성 시 표시되는 응원 문구
- 압박감 없는 긍정, 짧고 따뜻하게
- O: "잘했어요!", "해냈네요 :)"
- X: "오늘도 달성!", "연속 N일 달성!" (스트릭 압박)

`daySpecificMessages`
- 요일별 메시지 (키: "0"=일요일 ~ "6"=토요일)
- 월요일(1): 시작의 부담감 공감
- 금요일(5): 한 주 마무리 격려

**추가 후 필수 작업:**
`lib/content-seed.ts`의 `version` 필드 업데이트 → IndexedDB 캐시 무효화 트리거
