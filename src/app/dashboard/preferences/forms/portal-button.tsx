'use client'
import { Button } from "@/components/ui/button"
import { loadStripe } from "@stripe/stripe-js"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { createPortalSession } from "@/actions/billing/portal-action"
import sentryHelper from "@/lib/sentry"


export default function PortalButton() {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const handlePortal = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw 'Please log in to manage your billing.';
      }

      const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('auth_user_id', user.id)
      .single();
    
      const { url } = await createPortalSession(customer?.stripe_customer_id);
      window.location.href = url;

    } catch (error : any) {
      sentryHelper.logError(error)
      setErr(error.message || error)
    }
    setLoading(false)
  }
  return (
    <>
    <Button variant="link" className="p-0 w-min h-min" onClick={() => handlePortal()} disabled={loading}>
      {loading ? "Loading..." : "here"}
    </Button>
    {err && <p className="text-red-500">{err}</p>}
    </>
  )
}