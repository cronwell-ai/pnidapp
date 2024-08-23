import { Switch } from "@/components/ui/switch"
import { ThemeSwitch } from "@/components/theme/theme-switch"

export default function AppearanceForm() {
  return (
    <form id="profile-form" className="space-y-6 w-full">
      <div className="grid gap-2 md:grid md:grid-cols-12 space-y-0">
        <div className="col-span-3 text-sm leading-normal flex flex-col justify-center">
          <ThemeSwitch />
        </div>
        <div className="col-span-9 flex flex-col gap-1">
          <h3 className="font-medium text-md">Dark Theme</h3>
          <p className="font-normal text-muted-foreground text-sm">Toggle between light theme and dark theme to make it easy for your eye.</p>
        </div>
      </div>
    </form>
  )
}