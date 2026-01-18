# 산만이의 아침 (Motivation for ADHD)

ADHD 사용자를 위한 매일의 동기부여 및 생산성 앱 - Next.js 16.1.1 버전

## ✨ 주요 기능

- **📅 매일의 동기부여**: 하루를 시작하는 맞춤형 메시지 제공
- **✅ 집중 To-do**: 복잡함을 제거한 심플한 할 일 관리
- **☁️ 멀티 클라우드 동기화**: AWS S3, Google Drive, OneDrive 지원
- **🎨 모던 UI**: shadcn/ui 기반의 깔끔하고 반응형 디자인
- **📱 PWA 지원**: 오프라인 작동 및 앱 설치 지원
- **🔒 프라이버시 중심**: 모든 데이터는 로컬 우선(Local-First) 저장

## 🛠 기술 스택

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State**: Zustand + TanStack Query
- **Database**: Dexie.js (IndexedDB)
- **Cloud**: AWS SDK v3 (S3), Google/Microsoft OAuth
- **Testing**: Vitest + React Testing Library

## 🚀 시작하기

### 개발 서버 실행

```bash
bun install
bun dev
```

[http://localhost:3000](http://localhost:3000)에서 앱을 확인할 수 있습니다.

### 테스트 실행

```bash
bun test
```

## ☁️ 클라우드 동기화 설정 가이드

이 앱은 서버 없이 클라이언트에서 직접 클라우드 스토리지와 통신합니다. 동기화를 사용하려면 각 서비스의 설정이 필요합니다.

### 1. AWS S3 (권장)
1. AWS 콘솔에서 S3 버킷 생성
2. **CORS 설정** (필수):
   ```json
   [
       {
           "AllowedHeaders": ["*"],
           "AllowedMethods": ["GET", "PUT", "HEAD"],
           "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
           "ExposeHeaders": []
       }
   ]
   ```
3. IAM 사용자 생성 및 `Access Key`, `Secret Key` 발급 (S3 권한 부여)
4. 앱 설정 메뉴에서 정보 입력

### 2. Google Drive
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 및 'Google Drive API' 활성화
3. **OAuth 동의 화면** 구성 (User Type: External)
4. **사용자 인증 정보** > **OAuth 클라이언트 ID** 생성 (웹 애플리케이션)
   - 승인된 자바스크립트 원본: `http://localhost:3000`
   - 승인된 리디렉션 URI: `http://localhost:3000/oauth/callback`
5. 발급된 `Client ID`를 앱 설정에 입력

### 3. OneDrive
1. [Azure Portal](https://portal.azure.com/) > App registrations 접속
2. 새 등록 (New registration)
   - 지원 계정 유형: 개인 Microsoft 계정만 (Personal Microsoft accounts only)
   - 리디렉션 URI (SPA): `http://localhost:3000/oauth/callback`
3. 발급된 `Application (client) ID`를 앱 설정에 입력

## 📂 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── oauth/callback/    # OAuth 리다이렉트 처리
│   └── ...
├── components/            # React 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트 (button, card, input...)
│   └── ...
├── lib/                   # 핵심 로직
│   ├── cloud/            # 클라우드 프로바이더 (google, onedrive)
│   ├── storage/          # 스토리지 어댑터 (Dexie)
│   ├── auth.ts           # OAuth 인증 로직
│   ├── sync.ts           # 동기화 매니저
│   └── db.ts             # 레거시 DB 접근
└── public/               # 정적 파일
```

## 라이센스

MIT
