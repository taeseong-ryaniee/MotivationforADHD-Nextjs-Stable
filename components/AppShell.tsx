import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { ThemeToggle } from "@/components/feature/ThemeToggle"
import { PwaInstallPrompt } from "@/components/feature/PwaInstallPrompt"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="min-h-svh md:h-svh md:overflow-hidden bg-gradient-to-b from-background via-background to-muted/40">
      <AppSidebar className="hidden md:flex" />

      <SidebarInset className="bg-transparent md:min-h-0 md:overflow-hidden">
        {/* 모바일 전용 상단 헤더 — ThemeToggle 제거 (시스템 테마 자동 적용) */}
        <header className="sticky top-0 z-40 flex h-12 items-center border-b border-border/40 bg-background/90 px-4 backdrop-blur md:hidden">
          <span className="font-serif text-base font-bold text-foreground tracking-tight">산만이의 아침</span>
        </header>

        {/* 데스크탑 전용 ThemeToggle */}
        <div className="absolute right-4 top-4 z-40 hidden md:block">
          <ThemeToggle />
        </div>

        <div className="flex flex-1 flex-col px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 md:px-8 md:pb-8 md:pt-8 md:min-h-0 md:overflow-hidden">
          <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 md:min-h-0">
            <PwaInstallPrompt />
            {children}
          </div>
        </div>
      </SidebarInset>

      <MobileNav />
    </SidebarProvider>
  )
}
