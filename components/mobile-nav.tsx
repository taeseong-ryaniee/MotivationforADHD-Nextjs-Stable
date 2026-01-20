"use client"

import * as React from "react"
import {
  Settings,
  Clock,
  LayoutDashboard,
} from "lucide-react"
import { Link, useLocation } from "@tanstack/react-router"
import { cn } from "@/lib/utils"

const data = {
  navMain: [
    {
      title: "대시보드",
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

export function MobileNav() {
  const pathname = useLocation({ select: (location) => location.pathname })

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background px-4 pb-safe md:hidden">
      {data.navMain.map((item) => {
        const isActive = pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url))
        return (
          <Link
            key={item.title}
            to={item.url}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className={cn("h-5 w-5", isActive && "fill-current")} />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </div>
  )
}
