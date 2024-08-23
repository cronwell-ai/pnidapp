import { Button } from "@/components/ui/button"
import { Bell, Settings } from "lucide-react"
import QuickSettingsDropdown from "@/components/ui/dropdown-menus/quick-settings"
import NotificationDropdown from "@/components/ui/dropdown-menus/notifications"
import FeedbackDropdown from "@/components/ui/dropdown-menus/feedback"

export function CommonHeaderTitle({ text }: { text: string }) {
  return (
    <div className="-ml-2 flex items-center text-sm">
      <a className="text-gray-1100 block px-2 py-1 text-sm font-medium leading-5 focus:bg-gray-100 focus:text-gray-900 focus:outline-none">
        {`${text}`}
      </a>
    </div>
  )
}

export function CommonHeader({ leftItem }: { leftItem: React.ReactNode }) {
  return (
    <div className="flex h-12 max-h-12 items-center justify-between py-2 px-5 border-b border-default">
      {leftItem}
      <div className="flex items-center gap-x-2">
        <Button variant={"ghost"} size={"icon"} className="h-6 w-6 p-0 font-normal">
          <NotificationDropdown triggerElement={<Bell className="w-4 h-4" />}/>
        </Button>
        <Button variant={"ghost"} size={"icon"} className="h-6 w-6 p-0 font-normal">
          <QuickSettingsDropdown triggerElement={<Settings className="w-4 h-4" />}/>
        </Button>
        <FeedbackDropdown triggerElement={
          <Button variant={"outline"} className="text-xs px-3 py-0 h-6 mr-2 font-medium">
            Feedback
          </Button>
        }/>
      </div>
    </div>
  )
}