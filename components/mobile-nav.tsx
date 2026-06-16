"use client"

import { Link, useLocation } from "@tanstack/react-router"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { NAV_ITEMS } from "@/lib/nav"

export function MobileNav() {
  const pathname = useLocation({ select: (location) => location.pathname })

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-2 [padding-bottom:max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
      <Card className="w-full border-border/60 bg-card/95 shadow-lg backdrop-blur">
        <CardContent className="flex items-center px-1 py-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url))
            return (
              <Link
                key={item.url}
                to={item.url}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 text-[11px] font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "fill-current")} />
                <span>{item.mobileTitle}</span>
              </Link>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
