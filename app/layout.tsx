import type { Metadata, Viewport } from 'next'
import './globals.css'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import Providers from '@/components/Providers'
import { AppShell } from '@/components/AppShell'
import { Toaster } from '@/components/ui/sonner'

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
  themeColor: '#f59e0b',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/app-icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/app-icon-192.png" />
      </head>
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-container focus:shadow-lg"
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
