'use client'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Inbox } from "lucide-react"

export default function NotificationDropdown({ triggerElement }: { triggerElement: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {triggerElement}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-1 overflow-hidden">
        <h4 className="font-semibold text-sm px-2 py-1.5">Notifications</h4>
        <Separator className="w-100 my-1 -mx-1" />
        <div className="grid gap-4 py-1.5 px-2">
          <div className="flex flex-col gap-y-2 items-center flex-grow justify-center my-4">
            <Inbox className="w-5 h-5 text-foreground-light" />
            <div className="flex flex-col gap-y-1">
              <p className="text-foreground-light text-sm mx-auto text-center">All caught up</p>
              <p className="text-foreground-lighter text-xs mx-auto text-center">You will be notified here for any notices on your organizations and projects</p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
