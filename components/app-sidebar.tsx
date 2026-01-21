"use client"

import * as React from "react"
import {
  Settings,
  Clock,
  LayoutDashboard,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Link, useLocation } from "@tanstack/react-router"

const data = {
  navMain: [
    {
      title: "메인 메뉴",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "히스토리",
      url: "/history",
      icon: Clock,
    },
    {
      title: "설정",
      url: "/settings",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = useLocation({ select: (location) => location.pathname })

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="gap-3 px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="text-xs font-semibold text-muted-foreground font-sans">Daily Focus</span>
            <span className="font-serif text-lg font-semibold">산만이의 아침</span>
          </div>
        </div>
        <div className="rounded-lg border border-sidebar-border/60 bg-sidebar-accent/40 px-3 py-2 text-xs text-muted-foreground">
          오늘의 루틴을 차근히 기록해요.
        </div>
      </SidebarHeader>
      <SidebarSeparator className="mx-3" />
      <SidebarContent className="px-2 pt-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {data.navMain.map((item) => {
                const isActive = pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url))
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} className="gap-3">
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" aria-hidden="true" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
