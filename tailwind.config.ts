import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 1. ADHD 친화적 폰트 스케일 재정의 (행간 1.6 고정)
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.5' }],    // 12px: 부가 정보
        sm: ['0.875rem', { lineHeight: '1.571' }], // 14px: 보조 텍스트
        base: ['1rem', { lineHeight: '1.6' }],     // 16px: 본문 (가독성 핵심)
        lg: ['1.125rem', { lineHeight: '1.6' }],   // 18px: 강조 본문
        xl: ['1.25rem', { lineHeight: '1.6' }],    // 20px: 소제목
        '2xl': ['1.5rem', { lineHeight: '1.4' }],  // 24px: 중제목
        '3xl': ['1.875rem', { lineHeight: '1.3' }],// 30px: 대제목
        '4xl': ['2.25rem', { lineHeight: '1.2' }], // 36px: 히어로 섹션
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        // 2. 상태 표시를 위한 시멘틱 컬러 추가
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
