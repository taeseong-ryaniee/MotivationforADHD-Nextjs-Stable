import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileNav } from "@/components/mobile-nav"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {/* Desktop Sidebar - Hidden on Mobile */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      
      <SidebarInset>
        {/* Desktop Header - Hidden on Mobile */}
        <header className="hidden md:flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
        </header>
        
        {/* Main Content Area */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 pb-20 md:pb-4">
          {children}
        </div>
      </SidebarInset>

      {/* Mobile Bottom Navigation - Visible only on Mobile */}
      <MobileNav />
    </SidebarProvider>
  )
}
