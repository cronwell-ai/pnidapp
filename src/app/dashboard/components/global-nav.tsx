'use client'
import { Atom, UserRound } from "lucide-react"
import Link from "next/link"
import { LogOutButton } from "@/app/dashboard/components/logout-button";
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"

function NavLinkItem({ text, href, isActive }: { text: string, href: string, isActive: boolean }) {
  return (
    <Link href={href}>
      <span className={cn("group flex max-w-full cursor-pointer items-center justify-between space-x-2 border-default py-1 font-normal outline-none ring-foreground focus-visible:z-10 focus-visible:ring-1 group-hover:border-foreground-muted h-8",
        isActive ? "font-bold" : "font-normal")}>
        <span className="w-full truncate text-sm text-foreground-light transition group-hover:text-foreground">{`${text}`}</span>
        { isActive && <span>&#x2022;</span> }
      </span>
    </Link>
  )
}

function NavSectionHeader({ text, icon }: { text: string, icon: React.ReactNode }) {
  return (
    <div className="flex space-x-3 mb-2 font-normal">
      <span className="text-xs text-gray-500 font-semibold w-full flex flex-row items-center justify-start gap-2">
        {icon}
        {`${text}`}
      </span>
    </div>
  )
}

const navSections = (currpath: string) => [
  {
    text: "Projects", icon: <Atom className="w-3 h-3" />, items: [
      { text: "All Projects", href: "/dashboard", active: currpath == "/dashboard" },
    ]
  },
  {
    text: "Account", icon: <UserRound className="w-3 h-3" />, items: [
      { text: "Preferences", href: "/dashboard/preferences", active: currpath == "/dashboard/preferences" },
    ]
  },
]

export default function GlobalNav() {
  const pathname = usePathname()
  const items = navSections(pathname)
  return (<div className="-mt-1">
    <nav role="menu" aria-label="Sidebar" aria-orientation="vertical" aria-labelledby="options-menu">
      {items.map((section, index) => (
        <div key={index} className="border-b py-5 px-6 border-default">
          <NavSectionHeader text={section.text} icon={section.icon} />
          <ul className="space-y-1">
            {section.items.map((item, index) => (
              <NavLinkItem key={index} text={item.text} href={item.href} isActive={item.active} />
            ))}
          </ul>
        </div>
      ))}
      <div className="border-b py-5 px-6 border-default">
        <LogOutButton />
      </div>
    </nav>
  </div>)
}