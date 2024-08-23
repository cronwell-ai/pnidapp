import { Switch } from "@/components/ui/switch"

export default function DataCollectionForm() {
  return (
    <form id="profile-form" className="space-y-6 w-full">
      <div className="grid gap-2 md:grid md:grid-cols-12 space-y-0">
        <div className="col-span-3 text-sm leading-normal flex flex-col justify-center">
          <Switch />
        </div>
        <div className="col-span-9 flex flex-col gap-1">
          <h3 className="font-medium text-md">Opt-in to send telemetry data from the dashboard</h3>
          <p className="font-normal text-muted-foreground text-sm">By opting into sending telemetry data, we can improve your overall user experience.</p>
        </div>
      </div>
    </form>
  )
}