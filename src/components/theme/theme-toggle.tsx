"use client"

import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"

export function ThemeToggle( { className } : { className?: string } ) {
  const { theme, setTheme } = useTheme()

  return (
<Button
      variant="ghost"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "h-8 w-8 px-0 ring-0 border-0 focus-visible:ring-offset-0 focus-visible:ring-0",
        className
      )}
    >
      <SunIcon
        className={cn(
          "h-[1.2rem] w-[1.2rem] transition-all",
          theme === "dark" ? "scale-0 -rotate-90" : "scale-100 rotate-0"
        )}
      />
      <MoonIcon
        className={cn(
          "absolute h-[1.2rem] w-[1.2rem] transition-all",
          theme === "dark" ? "scale-100 rotate-0" : "scale-0 rotate-90"
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
