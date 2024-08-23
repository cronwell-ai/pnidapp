'use client'
import { LogOut } from "lucide-react"
import { signOutAction } from "@/actions/auth"

export function LogOutButton() {
  return (
    <ul className="space-y-1">
      <li
        role="menuitem"
        className="cursor-pointer flex space-x-3 items-center outline-none focus-visible:ring-1 ring-foreground-muted focus-visible:z-10 group py-1 font-normal border-default ml-0"
        onClick={() => {signOutAction()}}
      >
        <div className="transition truncate text-sm font-normal text-primary group-hover:text-red-600 min-w-fit">
          <LogOut className="w-4 h-4" />
        </div>
        <span className="transition truncate text-sm w-full text-primary group-hover:text-red-600">Log out</span>
      </li>
    </ul>
  )
}