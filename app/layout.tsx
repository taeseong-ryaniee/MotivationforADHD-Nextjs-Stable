import type { Metadata, Viewport } from 'next'
import './globals.css'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import Providers from '@/components/Providers'
import { Toaster } from '@/components/ui/Toaster'
import { AppShell } from '@/components/AppShell'

export const metadata: Metadata = {
  title: '산만이의 아침',
  description: 'ADHD 사용자를 위한 매일의 동기부여 앱',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '산만이',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/icons/app-icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/app-icon.svg" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.3/packages/wanted-sans-std/fonts/webfonts/variable/split/WantedSansStdVariable.min.css"
        />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-500 focus:text-white focus:rounded-lg focus:shadow-lg"
        >
          메인 콘텐츠로 건너뛰기
        </a>
        <Providers>
          <ServiceWorkerRegister />
          <Toaster />
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
