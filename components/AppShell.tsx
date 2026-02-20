import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { ThemeToggle } from "@/components/feature/ThemeToggle"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="min-h-svh bg-gradient-to-b from-background via-background to-muted/40">
      <AppSidebar />

      <SidebarInset className="bg-transparent">
        <header className="sticky top-0 z-40 hidden h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur md:flex">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-5" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground font-sans">산만이의 아침</span>
            <span className="text-base font-semibold text-foreground font-serif">오늘의 집중 루틴</span>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        <div className="fixed right-4 top-4 z-50 md:hidden">
          <ThemeToggle />
        </div>

        <div className="flex flex-1 flex-col gap-6 px-4 pb-24 pt-6 sm:px-6 md:px-8 md:pb-8">
          <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6">
            {children}
          </div>
        </div>
      </SidebarInset>

      <MobileNav />
    </SidebarProvider>
  )
}
