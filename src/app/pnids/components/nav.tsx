'use client'
import { cn } from "@/lib/utils"
import { useState } from "react"
import NavigationIconLink from "./nav-icon-link"
import { DraftingCompass, Eye, Grip, ListCheck, Settings } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import Image from "next/image"

export default function Nav({ docId }: { docId: string }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const basicItems = [
    {
      label: "View",
      icon: <Eye className="w-5 h-5" />,
      href: `/pnids/${docId}/view`,
    },
    {
      label: "Export",
      icon: <ListCheck className="w-5 h-5" />,
      href: `/pnids/${docId}/export`,
    },
  ]

  const logisticItems = [
    {
      label: "Settings",
      icon: <Settings className="w-5 h-5" />,
      href: `/pnids/${docId}/settings`,
    },
  ]

  return (
    <nav
      data-state={isExpanded ? 'expanded' : 'collapsed'}
      className={cn(
        'group py-2 z-10 h-full w-14 data-[state=expanded]:w-[13rem]',
        'border-r bg-background border-default data-[state=expanded]:shadow-xl',
        'transition-width duration-150',
        'hide-scrollbar flex flex-col justify-between overflow-y-auto overflow-x-hidden'
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <ul className="flex flex-col gap-y-1 justify-start px-2">
        <Link
          href="/dashboard"
          className="mx-2 flex items-center h-[40px]"
        >
          <h4 className="mb-0 text-sm font-semibold truncate flex flex-row items-center justify-begin gap-2.5">
            <Image src="/logo3.png" alt="PNID.app" width={20} height={20} className="mx-auto shrink-0" />
          </h4>
        </Link>
        <NavigationIconLink
          isExpanded={isExpanded}
          label="Editor"
          icon={<DraftingCompass className="w-5 h-5" />}
          href={`/pnids/${docId}`}
        />
        <Separator className="my-1" />
        {basicItems.map((item, index) => (
          <NavigationIconLink
            key={index}
            isExpanded={isExpanded}
            label={item.label}
            icon={item.icon}
            href={item.href}
          />
        ))}
      </ul>
      <ul className="flex flex-col gap-y-1 justify-end px-2 mb-6">
        {logisticItems.map((item, index) => (
          <NavigationIconLink
            key={index}
            isExpanded={isExpanded}
            label={item.label}
            icon={item.icon}
            href={item.href}
          />
        ))}
      </ul>
    </nav>
  )
}