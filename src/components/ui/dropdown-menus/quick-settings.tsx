'use client'
import { LogOut, Moon, } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export default function QuickSettingsDropdown({triggerElement} : {triggerElement: React.ReactNode}) {
  const { theme, setTheme } = useTheme()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {triggerElement}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Quick Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={event => { 
          event.preventDefault()
          setTheme(theme === "dark" ? "light" : "dark")
        }} className="text-xs font-medium">
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark Mode</span>
          <span className={cn("ml-auto text-xs opacity-60")}>
            {theme === "dark" ? "On" : "Off"}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
