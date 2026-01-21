"use client"

import * as React from "react"
import {
  Settings,
  Clock,
  LayoutDashboard,
} from "lucide-react"
import { Link, useLocation } from "@tanstack/react-router"
import { Card, CardContent } from "@/components/ui/card"
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
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center pb-safe md:hidden">
      <Card className="mx-3 mb-2 w-full border-border/60 bg-card/95 shadow-lg backdrop-blur">
        <CardContent className="flex items-center justify-between px-2 py-2">
          {data.navMain.map((item) => {
            const isActive = pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url))
            return (
              <Link
                key={item.title}
                to={item.url}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-[11px] font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "fill-current")} />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
