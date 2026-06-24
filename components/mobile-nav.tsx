"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { NAV_ITEMS } from "@/lib/nav"

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center pb-safe md:hidden">
      <Card className="mx-3 mb-2 w-full border-border/60 bg-card/95 backdrop-blur">
        <CardContent className="flex items-center justify-between px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url))
            return (
              <Link
                key={item.url}
                href={item.url}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
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
