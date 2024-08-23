import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import CheckoutButton from "./checkout-button"
import PortalButton from "./portal-button"
import { createClient } from "@/lib/supabase/server"
import Constants from "@/constants/settings"
import { cn } from '@/lib/utils'

export default async function BillingForm() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.from('customers').select('is_pro, auto_renew, curr_period_end').eq('auth_user_id', user!.id).single()
  const paid = data?.is_pro
  const autoRenew = data?.auto_renew
  const currPeriodEnd = data?.curr_period_end
  const { data: projectData } = await supabase.from('projects').select('id').eq('owner', user!.id)
  const projectCount = projectData?.length
  return (
    <form id="avatar-form" className="space-y-6 w-full">
      <div className="grid gap-2 md:grid md:grid-cols-12 space-y-0">
        <div className="col-span-3 flex flex-col justify-center">
          <h2 className="font-semibold text-lg">
            {`${projectCount}`} / {paid ? "Unlimited" : `${Constants.NUM_FREE_PROJECTS}`}
          </h2>
          <p>{paid ? "" : "Free "}Projects</p>
        </div>
        <div className="grid col-span-9 items-center">
          <Label htmlFor="picture">
            You are currently on the {paid ? <Badge>Pro</Badge> : <Badge variant="secondary">Free</Badge>} Plan.
          </Label>
          {paid && <>
            <p className={cn("font-normaltext-sm my-2", autoRenew ? "text-green-600" : "text-red-600")}>
              Your plan will {autoRenew ? "automatically rebill" : "expire"} on {`${currPeriodEnd}`}.
            </p>
            <p className="font-normal text-muted-foreground text-sm">
              You can manage your subscription or change your payment method <PortalButton />.
            </p>
            </>}
          {!paid &&
            <p className="font-normal text-muted-foreground text-sm">
              Upgrade to <CheckoutButton /> for unlimited usage!
            </p>}
        </div>
      </div>
    </form>
  )
}